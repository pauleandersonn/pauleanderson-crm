"""
Instagram Dashboard Server v3
- GET  /                                       -> dashboard.html
- POST /api/analyze                            -> inicia coleta em background (retorna job_id)
- GET  /api/status?job=ID                      -> status do job (queued/running/done/error)
- GET  /api/result?handle=X                    -> JSON final (cache)
- GET  /api/audit?handle=X                     -> JSON da auditoria completa
- GET  /render?handle=X                        -> renderiza HTML completo (auditoria + top posts)
- GET  /render?handle=X&mode=simple            -> HTML simples (perfil + top posts)
- GET  /pdf?handle=X                           -> exporta PDF completo (auditoria)
- GET  /pdf?handle=X&mode=simple               -> exporta PDF simples

Cache:
  ~/.hermes/instagram-cache/<handle>.json       (dados brutos, 24h)
  ~/.hermes/instagram-cache/<handle>_full.json  (auditoria calculada, 24h)
"""
import argparse
import json
import os
import subprocess
import sys
import threading
import time
import uuid
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

from instagram_dashboard import collect, calc_metrics, top_posts
from audit import full_audit, recommendations

CACHE_DIR = Path.home() / "AppData" / "Local" / "hermes" / "instagram-cache"
JOB_DIR = Path.home() / "AppData" / "Local" / "hermes" / "instagram-jobs"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
JOB_DIR.mkdir(parents=True, exist_ok=True)

CACHE_TTL_HOURS = 24

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"


def load_token():
    from dotenv import dotenv_values
    env = dotenv_values(Path.home() / "AppData" / "Local" / "hermes" / ".env.apify.env")
    t = env.get("APIFY_TOKEN")
    if not t:
        raise RuntimeError("APIFY_TOKEN nao encontrado em ~/.hermes/.env.apify.env")
    return t


def cache_path(handle, suffix=""):
    safe = handle.lower().replace("/", "_")
    return CACHE_DIR / f"{safe}{suffix}.json"


def job_path(job_id):
    return JOB_DIR / f"{job_id}.json"


def cache_valid(handle, suffix=""):
    p = cache_path(handle, suffix)
    if not p.exists():
        return False
    age_hours = (time.time() - p.stat().st_mtime) / 3600
    return age_hours < CACHE_TTL_HOURS


def load_cache(handle, suffix=""):
    p = cache_path(handle, suffix)
    return json.loads(p.read_text(encoding="utf-8"))


def save_cache(handle, data, suffix=""):
    p = cache_path(handle, suffix)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def escape(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def fmt(n):
    return f"{int(n or 0):,}".replace(",", ".")


HTML_TEMPLATE = (Path(__file__).parent / "dashboard.html").read_text(encoding="utf-8")


def render_simple_html(data):
    """HTML simples: perfil + Top 10 cards."""
    p = data["profile"]
    m = data["metrics"]
    top = data["top"]
    handle = data["handle"]
    followers = m["followers"]

    badges = []
    if p.get("verified"):
        badges.append('<span class="badge good">Verificado</span>')
    if p.get("isBusinessAccount"):
        badges.append('<span class="badge">Business</span>')

    cards = []
    for i, t in enumerate(top, 1):
        post = t["post"]
        sc = post.get("shortCode") or post.get("code") or ""
        thumb = (
            post.get("displayUrl")
            or post.get("thumbnailUrl")
            or (post.get("images") or [{}])[0].get("url")
            or ""
        )
        cap = (post.get("caption") or "")[:140]
        url = f"https://www.instagram.com/p/{sc}/" if sc else "#"
        ptype = post.get("type") or post.get("productType") or "?"
        cards.append(
            '<a href="' + url + '" target="_blank" style="text-decoration:none;color:inherit;">'
            '<div class="top-card"><div class="top-card-wrap">'
            f'<span class="top-rank">#{i}</span>'
            f'<img src="{thumb}" loading="lazy" onerror="this.style.background=\'#334155\';this.removeAttribute(\'src\')" />'
            "</div><div class=\"top-card-body\">"
            f'<span class="badge">{escape(ptype)}</span>'
            '<div class="top-card-stats">'
            f'<strong>{fmt(t["likes"])}</strong> likes &middot; '
            f'<strong>{fmt(t["comments"])}</strong> comments &middot; '
            f'<strong>{fmt(t["views"])}</strong> views'
            "</div>"
            f'<span class="er-tag">Score: {t["score"]}</span>'
            f"<p class=\"caption\">{escape(cap)}...</p>"
            "</div></div></a>"
        )

    profile_html = (
        '<div class="card">'
        '<div class="profile-header">'
        f'<img src="{p.get("profilePicUrlHD","")}" alt="" onerror="this.style.display=\'none\'" />'
        "<div>"
        f"<h2>@{escape(handle)} &mdash; {escape(p.get('fullName',''))}</h2>"
        f'<div style="color:#94a3b8; font-size:13px; margin-top:4px;">{" ".join(badges)}</div>'
        f'<p style="margin-top:8px; color:#cbd5e1; font-size:13px;">{escape((p.get("biography") or "")[:300])}</p>'
        "</div></div>"
        '<div class="grid grid-4" style="margin-top:20px;">'
        f'<div class="metric-big"><span class="num">{fmt(followers)}</span><span class="label">Followers</span></div>'
        f'<div class="metric-big"><span class="num">{fmt(p.get("followsCount",0))}</span><span class="label">Seguindo</span></div>'
        f'<div class="metric-big"><span class="num">{fmt(p.get("postsCount",0))}</span><span class="label">Posts totais</span></div>'
        f'<div class="metric-big"><span class="num">{m["er_pct"]}%</span><span class="label">Engagement Rate</span></div>'
        "</div>"
        "</div>"
    )

    top_section = f'<h2>Top {len(top)} Conteudos</h2><div class="top-grid">{"".join(cards)}</div>'

    return HTML_TEMPLATE.replace(
        '<div id="results" class="results"></div>',
        f'<div id="results" class="results show">{profile_html}{top_section}</div>',
    )


def render_full_html(data):
    """HTML completo: auditoria 6 dimensoes + benchmark + Top 10 + recomendacoes."""
    a = data["audit"]
    p = data["profile"]
    m = a["metrics"]
    s = a["scores"]
    ig = a["ig_health_score"]
    handle = a["handle"]
    followers = m["followers"]
    types = a["types"]

    def badge(score):
        if score >= 75:
            return f'<span class="badge good">{score}</span>'
        if score >= 60:
            return f'<span class="badge">{score}</span>'
        if score >= 40:
            return f'<span class="badge warn">{score}</span>'
        return f'<span class="badge bad">{score}</span>'

    # Pilares
    pil = a["pillar_distribution"]
    total_pil = sum(pil.values()) or 1
    pil_rows = "".join(
        f'<tr><td>{escape(k)}</td><td>{v}</td><td>{round(v/total_pil*100)}%</td></tr>'
        for k, v in sorted(pil.items(), key=lambda x: -x[1])
    )

    # Compliance
    comp = a["compliance"]
    total = comp["total"] or 1
    crm_pct = round(comp["crm"] / total * 100)
    ad_pct = round(comp["antes_depois"] / total * 100)
    prom_pct = round(comp["promessa"] / total * 100)
    preco_pct = round(comp["preco"] / total * 100)

    def comp_status(pct, threshold=80):
        if pct >= threshold:
            return '<span class="badge good">OK</span>'
        if pct >= 40:
            return '<span class="badge warn">Atenção</span>'
        return '<span class="badge bad">Crítico</span>'

    # Benchmark comparison
    bench = a["benchmark"]
    def cmp_row(label, value, bench_val, fmt_str="{:.2f}", lower_better=False):
        diff = value - bench_val
        if lower_better:
            diff = -diff
        ok = diff >= 0
        return (
            f'<tr><td>{label}</td><td>{fmt_str.format(value)}</td>'
            f'<td>{fmt_str.format(bench_val)}</td>'
            f'<td><span class="{"good" if ok else "bad"}">{"+" if diff >= 0 else ""}{diff:.2f}</span></td></tr>'
        )

    video_pct = (types.get('Video', 0) + types.get('Reel', 0)) / max(total, 1) * 100
    cta_pct = m["posts_with_cta"] / max(m["posts_analyzed"], 1) * 100

    # Recomendacoes
    recs_html = "".join(f"<li>{r}</li>" for r in recommendations(a))

    # Top 10 cards (igual ao simple)
    top = data["top"]
    cards = []
    for i, t in enumerate(top, 1):
        post = t["post"]
        sc = post.get("shortCode") or post.get("code") or ""
        thumb = (
            post.get("displayUrl")
            or post.get("thumbnailUrl")
            or (post.get("images") or [{}])[0].get("url")
            or ""
        )
        cap = (post.get("caption") or "")[:140]
        url = f"https://www.instagram.com/p/{sc}/" if sc else "#"
        ptype = post.get("type") or post.get("productType") or "?"
        cards.append(
            '<a href="' + url + '" target="_blank" style="text-decoration:none;color:inherit;">'
            '<div class="top-card"><div class="top-card-wrap">'
            f'<span class="top-rank">#{i}</span>'
            f'<img src="{thumb}" loading="lazy" onerror="this.style.background=\'#334155\';this.removeAttribute(\'src\')" />'
            "</div><div class=\"top-card-body\">"
            f'<span class="badge">{escape(ptype)}</span>'
            '<div class="top-card-stats">'
            f'<strong>{fmt(t["likes"])}</strong> likes &middot; '
            f'<strong>{fmt(t["comments"])}</strong> comments &middot; '
            f'<strong>{fmt(t["views"])}</strong> views'
            "</div>"
            f'<span class="er-tag">Score: {t["score"]}</span>'
            f"<p class=\"caption\">{escape(cap)}...</p>"
            "</div></div></a>"
        )

    full_html = f"""
    <div class="hero"><h1>Auditoria Completa — @{escape(handle)}</h1><p>Análise 6 dimensões + big benef real vs benchmark</p></div>

    <div class="input-card">
      <div class="input-row">
        <input id="handleInput" type="text" placeholder="@drrenatogallo" value="@{escape(handle)}" />
        <button onclick="location.href='/?handle='+document.getElementById('handleInput').value.replace(/^@/,'')">Analisar outra conta</button>
      </div>
    </div>

    <h2>IG Health Score</h2>
    <div class="grid" style="grid-template-columns: 200px 1fr; gap: 16px; align-items: stretch;">
      <div class="card" style="text-align:center;">
        <div style="font-size:64px; font-weight:800; background:linear-gradient(135deg,#fbbf24,#f59e0b); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;">{ig}</div>
        <div style="color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin-top:4px;">{escape(a['status'].split(' (')[0])}</div>
      </div>
      <div class="card">
        <h3>Breakdown 6 Dimensões</h3>
        <div class="stat"><span>Content Quality</span><span>{badge(s['content_quality'])}</span></div>
        <div class="stat"><span>Engagement Performance</span><span>{badge(s['engagement'])}</span></div>
        <div class="stat"><span>Creative Quality</span><span>{badge(s['creative'])}</span></div>
        <div class="stat"><span>Growth Trajectory</span><span>{badge(s['growth'])}</span></div>
        <div class="stat"><span>Competitive Position</span><span>{badge(s['competitive'])}</span></div>
        <div class="stat"><span>Compliance</span><span>{badge(s['compliance'])}</span></div>
      </div>
    </div>

    <h2>Perfil</h2>
    <div class="card">
      <div class="profile-header">
        <img src="{p.get('profilePicUrlHD','')}" alt="" onerror="this.style.display='none'" />
        <div>
          <h2 style="border:none;padding:0;margin:0;">@{escape(handle)} — {escape(p.get('fullName',''))}</h2>
          <div style="color:#94a3b8; font-size:13px; margin-top:6px;">
            {'<span class="badge good">Verificado</span>' if p.get('verified') else ''}
            {'<span class="badge">Business</span>' if p.get('isBusinessAccount') else ''}
          </div>
          <p style="margin-top:10px; color:#cbd5e1; font-size:13px;">{escape((p.get('biography') or '')[:300])}</p>
        </div>
      </div>
      <div class="grid grid-4" style="margin-top:20px;">
        <div class="metric-big"><span class="num">{fmt(followers)}</span><span class="label">Followers</span></div>
        <div class="metric-big"><span class="num">{fmt(p.get('followsCount',0))}</span><span class="label">Seguindo</span></div>
        <div class="metric-big"><span class="num">{fmt(p.get('postsCount',0))}</span><span class="label">Posts totais</span></div>
        <div class="metric-big"><span class="num">{m['er_pct']}%</span><span class="label">Engagement Rate</span></div>
      </div>
    </div>

    <h2>Métricas-chave ({m['posts_analyzed']} posts analisados · {escape(m['date_range'])})</h2>
    <div class="card">
      <div class="grid grid-4">
        <div class="metric-big"><span class="num">{m['avg_likes']}</span><span class="label">Likes médios</span></div>
        <div class="metric-big"><span class="num">{m['avg_comments']}</span><span class="label">Comments médios</span></div>
        <div class="metric-big"><span class="num">{fmt(m['avg_views'])}</span><span class="label">Views médios</span></div>
        <div class="metric-big"><span class="num">{m['cadencia_per_month']}</span><span class="label">Posts / mês</span></div>
      </div>
    </div>

    <h2>Big Benef Real — vs Benchmark do Nicho</h2>
    <div class="card">
      <p style="color:#94a3b8; font-size:13px; margin-bottom:12px;">Benchmark: contas similares (30-50k seguidores) em nicho de autoridade/servico profissional</p>
      <table>
        <thead><tr><th>Métrica</th><th>Conta</th><th>Benchmark</th><th>Gap</th></tr></thead>
        <tbody>
          {cmp_row("Engagement Rate (%)", m['er_pct'], bench['er'], "{:.3f}")}
          {cmp_row("Cadência (posts/mês)", m['cadencia_per_month'], bench['cadencia'], "{:.1f}", lower_better=True)}
          {cmp_row("Mix Vídeo (%)", video_pct, bench['video_pct'], "{:.0f}")}
          {cmp_row("Hashtags / post", m['hashtags_per_post'], bench['hashtags_per_post'], "{:.1f}")}
          {cmp_row("Posts com CTA (%)", cta_pct, bench['cta_pct'], "{:.0f}")}
        </tbody>
      </table>
    </div>

    <h2>Pilares de Conteúdo</h2>
    <div class="card">
      <table>
        <thead><tr><th>Pilar</th><th>Posts</th><th>%</th></tr></thead>
        <tbody>{pil_rows}</tbody>
      </table>
    </div>

    <h2>Compliance CFM / Boas Práticas</h2>
    <div class="card">
      <table>
        <thead><tr><th>Indicador</th><th>Posts</th><th>%</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>CRM identificado</td><td>{comp['crm']}/{comp['total']}</td><td>{crm_pct}%</td><td>{comp_status(crm_pct, 80)}</td></tr>
          <tr><td>Antes/depois</td><td>{comp['antes_depois']}/{comp['total']}</td><td>{ad_pct}%</td><td>{'<span class="badge warn">Consentimento</span>' if comp['antes_depois'] > 0 else '<span class="badge good">OK</span>'}</td></tr>
          <tr><td>Promessas de resultado</td><td>{comp['promessa']}/{comp['total']}</td><td>{prom_pct}%</td><td>{'<span class="badge bad">Crítico</span>' if comp['promessa'] > 0 else '<span class="badge good">OK</span>'}</td></tr>
          <tr><td>Divulgação de preços</td><td>{comp['preco']}/{comp['total']}</td><td>{preco_pct}%</td><td>{'<span class="badge warn">Atenção</span>' if comp['preco'] > 2 else '<span class="badge good">OK</span>'}</td></tr>
        </tbody>
      </table>
    </div>

    <h2>Top {len(top)} Conteúdos (ranked por engajamento)</h2>
    <div class="top-grid">{"".join(cards)}</div>

    <h2>Recomendações Imediatas</h2>
    <div class="card">
      <ol style="padding-left:20px;">{recs_html}</ol>
    </div>

    <div style="margin-top:20px; text-align:right;">
      <a href="/pdf?handle={escape(handle)}&mode=full" target="_blank" class="btn-pdf">Exportar PDF Completo</a>
    </div>

    <div class="footer">Auditoria gerada via Hermes + Apify + skill <code>ig-audit</code> · {datetime.now().strftime('%Y-%m-%d %H:%M')}</div>
    """

    return HTML_TEMPLATE.replace(
        '<div id="results" class="results"></div>',
        f'<div id="results" class="results show">{full_html}</div>',
    )


def run_job(job_id, handle, mode="full"):
    """Coleta + audita (se mode=full) em background."""
    jp = job_path(job_id)
    try:
        jp.write_text(
            json.dumps({"status": "running", "handle": handle, "mode": mode, "started": datetime.now().isoformat()}),
            encoding="utf-8",
        )
        token = load_token()
        profile, posts = collect(handle, token)
        if not profile:
            raise RuntimeError(f"Perfil @{handle} nao encontrado ou restrito")

        metrics = calc_metrics(profile, posts)
        top = top_posts(posts, 10)

        # Salva dados basicos
        base_data = {
            "handle": handle,
            "profile": profile,
            "metrics": metrics,
            "top": top,
            "generated_at": datetime.now().isoformat(),
        }
        save_cache(handle, base_data)

        # Audita (se full)
        if mode == "full":
            audit = full_audit(handle, profile, posts)
            full_data = {
                "handle": handle,
                "profile": profile,
                "audit": audit,
                "top": top,
                "metrics": metrics,
                "generated_at": datetime.now().isoformat(),
            }
            save_cache(handle, full_data, suffix="_full")

        jp.write_text(
            json.dumps({"status": "done", "handle": handle, "mode": mode, "finished": datetime.now().isoformat()}),
            encoding="utf-8",
        )
    except Exception as e:
        jp.write_text(
            json.dumps({"status": "error", "handle": handle, "mode": mode, "error": str(e), "finished": datetime.now().isoformat()}),
            encoding="utf-8",
        )


def export_pdf(handle, mode="full"):
    """Exporta HTML como PDF via Edge headless."""
    if mode == "full":
        if not cache_valid(handle, suffix="_full"):
            raise RuntimeError(
                f"Cache de auditoria para @{handle} expirado/inexistente. "
                "Colete primeiro via /render?mode=full."
            )
        data = load_cache(handle, suffix="_full")
        html = render_full_html(data)
    else:
        if not cache_valid(handle):
            raise RuntimeError(f"Cache para @{handle} expirado/inexistente.")
        data = load_cache(handle)
        html = render_simple_html(data)

    tmp_html = CACHE_DIR / f"_pdf_{mode}_{handle}.html"
    tmp_html.write_text(html, encoding="utf-8")
    pdf_out = CACHE_DIR / f"relatorio_{mode}_{handle}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    file_url = f"file:///{tmp_html}".replace("C:\\", "").replace("\\", "/")
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        f"--print-to-pdf={pdf_out}",
        file_url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if not pdf_out.exists():
        raise RuntimeError(f"Edge falhou: {result.stderr[:300]}")
    return pdf_out


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a, **k):
        pass

    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)

        try:
            if u.path in ("/", "/index.html"):
                self.send_html(HTML_TEMPLATE)
            elif u.path == "/api/analyze":
                handle = (q.get("handle") or [""])[0].strip().lstrip("@")
                mode = (q.get("mode") or ["full"])[0]
                if not handle:
                    self.send_json({"error": "missing ?handle="}, 400)
                    return
                job_id = str(uuid.uuid4())[:8]
                threading.Thread(target=run_job, args=(job_id, handle, mode), daemon=True).start()
                self.send_json({"job_id": job_id, "handle": handle, "mode": mode, "status": "queued"})
            elif u.path == "/api/status":
                job_id = (q.get("job") or [""])[0]
                if not job_id:
                    self.send_json({"error": "missing ?job="}, 400)
                    return
                jp = job_path(job_id)
                if not jp.exists():
                    self.send_json({"error": "job not found"}, 404)
                    return
                self.send_json(json.loads(jp.read_text(encoding="utf-8")))
            elif u.path == "/api/result":
                handle = (q.get("handle") or [""])[0].strip().lstrip("@")
                mode = (q.get("mode") or ["simple"])[0]
                if not handle:
                    self.send_json({"error": "missing ?handle="}, 400)
                    return
                suffix = "_full" if mode == "full" else ""
                if cache_valid(handle, suffix):
                    self.send_json(load_cache(handle, suffix))
                else:
                    self.send_json({"error": f"no cache ({mode}). run /api/analyze first"}, 404)
            elif u.path == "/api/audit":
                handle = (q.get("handle") or [""])[0].strip().lstrip("@")
                if not handle:
                    self.send_json({"error": "missing ?handle="}, 400)
                    return
                if cache_valid(handle, "_full"):
                    data = load_cache(handle, "_full")
                    self.send_json(data["audit"])
                else:
                    self.send_json({"error": "audit not cached. run /render?mode=full first"}, 404)
            elif u.path == "/render":
                handle = (q.get("handle") or [""])[0].strip().lstrip("@")
                fresh = q.get("fresh", ["0"])[0] == "1"
                mode = (q.get("mode") or ["full"])[0]
                if not handle:
                    self.send_html(HTML_TEMPLATE)
                    return
                suffix = "_full" if mode == "full" else ""
                if fresh or not cache_valid(handle, suffix):
                    try:
                        token = load_token()
                        profile, posts = collect(handle, token)
                        if not profile:
                            self.send_html(f"<h1>Perfil @{escape(handle)} nao encontrado</h1>", 404)
                            return
                        metrics = calc_metrics(profile, posts)
                        top = top_posts(posts, 10)
                        base_data = {
                            "handle": handle,
                            "profile": profile,
                            "metrics": metrics,
                            "top": top,
                            "generated_at": datetime.now().isoformat(),
                        }
                        save_cache(handle, base_data)
                        if mode == "full":
                            audit = full_audit(handle, profile, posts)
                            full_data = {
                                "handle": handle,
                                "profile": profile,
                                "audit": audit,
                                "top": top,
                                "metrics": metrics,
                                "generated_at": datetime.now().isoformat(),
                            }
                            save_cache(handle, full_data, suffix="_full")
                    except Exception as e:
                        self.send_html(f"<h1>Erro ao coletar @{escape(handle)}</h1><pre>{escape(str(e))}</pre>", 500)
                        return
                data = load_cache(handle, suffix)
                html = render_full_html(data) if mode == "full" else render_simple_html(data)
                self.send_html(html)
            elif u.path == "/pdf":
                handle = (q.get("handle") or [""])[0].strip().lstrip("@")
                mode = (q.get("mode") or ["full"])[0]
                if not handle:
                    self.send_json({"error": "missing ?handle="}, 400)
                    return
                try:
                    pdf_path = export_pdf(handle, mode)
                    body = pdf_path.read_bytes()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/pdf")
                    self.send_header(
                        "Content-Disposition",
                        f'attachment; filename="relatorio_{mode}_{handle}.pdf"',
                    )
                    self.send_header("Content-Length", str(len(body)))
                    self.end_headers()
                    self.wfile.write(body)
                except Exception as e:
                    self.send_html(f"<h1>Erro PDF</h1><pre>{escape(str(e))}</pre>", 500)
            else:
                self.send_json({"error": "not found"}, 404)
        except Exception as e:
            self.send_html(f"<h1>Erro interno</h1><pre>{escape(str(e))}</pre>", 500)

    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_html(self, html, code=200):
        body = html.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=9090)
    ap.add_argument("--host", default="127.0.0.1")
    args = ap.parse_args()
    print(f"Instagram Dashboard v3 (auditoria completa) rodando em http://{args.host}:{args.port}")
    print(f"   Cache dir: {CACHE_DIR}")
    print(f"   Job dir:   {JOB_DIR}")
    HTTPServer((args.host, args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()