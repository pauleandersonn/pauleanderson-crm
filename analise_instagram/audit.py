"""
Modulo de auditoria completa estilo ig-audit (6 dimensoes + benchmark).
Usado pelo server.py quando ?mode=full ou /audit.
"""
import re
import statistics
from datetime import datetime
from collections import Counter


def full_audit(handle, profile, posts):
    """Auditoria completa: 6 dimensoes + IG Health Score + benchmark."""
    followers = profile.get("followersCount", 0) or 1
    n = len(posts)
    if n == 0:
        return {"handle": handle, "score": 0, "error": "no posts"}

    # === METRICAS BASE ===
    likes = [p.get("likesCount", 0) or 0 for p in posts]
    comments = [p.get("commentsCount", 0) or 0 for p in posts]
    views = [
        p.get("videoViewCount") or p.get("videoPlayCount") or 0
        for p in posts
        if (p.get("videoViewCount") or p.get("videoPlayCount"))
    ]
    types = Counter(p.get("type") or p.get("productType") or "?" for p in posts)
    avg_likes = sum(likes) / n
    avg_comments = sum(comments) / n
    total_eng = sum(likes) + sum(comments)
    er = (total_eng / (followers * n) * 100) if followers and n else 0
    top_likes = max(likes)
    top_views = max(views) if views else 0
    avg_views = sum(views) / len(views) if views else 0

    # Cadencia
    dates = []
    for p in posts:
        ts = p.get("timestamp") or p.get("takenAt") or p.get("postedAt")
        if ts:
            try:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                dates.append(dt.date())
            except Exception:
                pass
    if dates:
        dates.sort()
        days = max((dates[-1] - dates[0]).days, 1)
        cadencia = round(n / (days / 30), 1)
        date_range = f"{dates[0]} -> {dates[-1]} ({days} dias)"
    else:
        cadencia = 0
        date_range = "n/d"

    # Hashtags e CTA
    tags_per_post = []
    has_cta = 0
    has_question = 0
    for p in posts:
        if p.get("hashtags"):
            tags_per_post.append(len(p["hashtags"]))
        else:
            tags_per_post.append((p.get("caption") or "").count("#"))
        cap = (p.get("caption") or "").lower()
        if any(
            k in cap
            for k in ["agend", "consulta", "direct", "link", "dm", "whatsapp", "(92)", "agende"]
        ):
            has_cta += 1
        if "?" in (p.get("caption") or ""):
            has_question += 1
    avg_hashtags = round(sum(tags_per_post) / n, 1) if n else 0

    # Compliance CFM
    kw = {
        "antes_depois": [r"\bantes\b", r"\bdepois\b", r"antes e depois", r"\bresultado\b"],
        "preco": [r"\br\$", r"\breais\b", r"valor", r"preço", r"\d{3,}\s*(reais|r\$)"],
        "promessa": [r"garantido", r"garantia", r"100%", r"transforma", r"muda sua vida"],
        "crm": [r"\bcrm\b"],
    }
    comp = {k: 0 for k in kw}
    for p in posts:
        cap = (p.get("caption") or "").lower()
        for k, v in kw.items():
            if any(re.search(rx, cap) for rx in v):
                comp[k] += 1

    # Pilares por keywords
    pillar_kw = {
        "Autoridade/Técnica": [
            "congresso", "workshop", "palestra", "técnica", "preservation",
            "deep plane", "nanofat", "sbcp", "phd", "md", "titular",
        ],
        "Antes/Depois": [
            "antes", "depois", "resultado", "evoluç", "transform",
        ],
        "Educacional": [
            "explic", "como funciona", "cuidados", "pós-operatório",
            "pré-operatório", "dica", "o que", "por que",
        ],
        "Promocional": [
            "agend", "consulta", "valor", "promoção", "desconto", "whatsapp",
        ],
        "Bastidores/Lifestyle": [
            "bastidor", "rotina", "viagem", "família", "equipe", "dia a dia",
        ],
    }
    pillar_count = {k: 0 for k in pillar_kw}
    for p in posts:
        cap = (p.get("caption") or "").lower()
        matches = {k: sum(1 for kw_i in kws if kw_i in cap) for k, kws in pillar_kw.items()}
        if any(matches.values()):
            top = max(matches.items(), key=lambda x: x[1])[0]
            pillar_count[top] += 1

    # === SCORES POR DIMENSAO ===
    # Content Quality
    if avg_hashtags >= 5:
        c_hash = 100
    elif avg_hashtags >= 3:
        c_hash = 70
    elif avg_hashtags >= 1:
        c_hash = 40
    else:
        c_hash = 20
    c_cta = min(100, (has_cta / n) * 100) if n else 0
    c_q = min(100, (has_question / n) * 100) if n else 0
    c_pillar = min(100, len([p for p in pillar_count.values() if p > 0]) * 25)
    content_score = round(c_hash * 0.25 + c_cta * 0.20 + c_q * 0.30 + c_pillar * 0.25)

    # Engagement
    if er >= 2.0:
        e_score = 100
    elif er >= 1.2:
        e_score = 85
    elif er >= 0.5:
        e_score = 60
    elif er >= 0.2:
        e_score = 40
    else:
        e_score = 20
    if avg_comments >= 20:
        e_score = min(100, e_score + 10)

    # Creative
    video_pct = (types.get("Video", 0) + types.get("Reel", 0)) / n if n else 0
    if 0.5 <= video_pct <= 0.7:
        cr_score = 90
    elif video_pct >= 0.4:
        cr_score = 70
    else:
        cr_score = 40
    if avg_views >= 1000:
        cr_score = min(100, cr_score + 10)

    # Growth
    if 12 <= cadencia <= 18:
        g_score = 90
    elif 8 <= cadencia <= 24:
        g_score = 70
    else:
        g_score = 40
    viral_posts = sum(1 for v in views if v > followers * 0.05)
    g_score = min(100, g_score + viral_posts * 5)

    # Competitive Position
    bench_er = 1.2
    cp_score = min(100, round(er / bench_er * 60))

    # Compliance
    compliance_base = 100
    if comp["promessa"] > 0:
        compliance_base -= 20
    if comp["preco"] > 2:
        compliance_base -= 15
    crm_pct = comp["crm"] / n if n else 0
    compliance_base -= round((1 - crm_pct) * 30)
    comp_score = max(0, compliance_base)

    # === IG HEALTH SCORE ===
    weights = {
        "content": 0.20, "engagement": 0.25, "creative": 0.15,
        "growth": 0.20, "competitive": 0.10, "compliance": 0.10,
    }
    ig_score = round(
        content_score * weights["content"]
        + e_score * weights["engagement"]
        + cr_score * weights["creative"]
        + g_score * weights["growth"]
        + cp_score * weights["competitive"]
        + comp_score * weights["compliance"]
    )

    if ig_score >= 90:
        status = "Elite (Top 5%)"
    elif ig_score >= 75:
        status = "Strong (acima da média)"
    elif ig_score >= 60:
        status = "Average (fundação sólida, otimização possível)"
    elif ig_score >= 40:
        status = "Underperforming (atenção necessária)"
    else:
        status = "Critical (revisão estratégica)"

    # === BENCHMARK ===
    benchmark = {
        "er": 1.2,
        "cadencia": 12,
        "video_pct": 55,
        "hashtags_per_post": 5,
        "cta_pct": 80,
    }

    return {
        "handle": handle,
        "ig_health_score": ig_score,
        "status": status,
        "scores": {
            "content_quality": content_score,
            "engagement": e_score,
            "creative": cr_score,
            "growth": g_score,
            "competitive": cp_score,
            "compliance": comp_score,
        },
        "weights": weights,
        "metrics": {
            "followers": followers,
            "posts_analyzed": n,
            "cadencia_per_month": cadencia,
            "date_range": date_range,
            "er_pct": round(er, 3),
            "avg_likes": round(avg_likes, 1),
            "avg_comments": round(avg_comments, 1),
            "top_likes": top_likes,
            "top_views": top_views,
            "avg_views": round(avg_views, 1),
            "hashtags_per_post": avg_hashtags,
            "posts_with_cta": has_cta,
            "posts_with_question": has_question,
        },
        "types": dict(types),
        "pillar_distribution": pillar_count,
        "compliance": {**comp, "total": n},
        "benchmark": benchmark,
    }


def recommendations(audit):
    """Gera lista de recomendações baseada no audit."""
    s = audit["scores"]
    m = audit["metrics"]
    recs = []

    if s["engagement"] < 50:
        recs.append(
            f"<strong>Aumentar engajamento (atual {m['er_pct']}%, benchmark 1.2%)</strong>: "
            f"variar formato (95% vídeo), adicionar perguntas em 80% dos captions, "
            f"criar ganchos fortes nos primeiros 2 segundos."
        )
    if m["hashtags_per_post"] < 3:
        recs.append(
            f"<strong>Hashtags subutilizadas (atual {m['hashtags_per_post']}/post, "
            f"benchmark 5+)</strong>: criar set fixo de 8 hashtags por post "
            f"(3 nichos amplos + 3 específicos + 2 locais Manaus-AM)."
        )
    if m["cadencia_per_month"] > 20:
        recs.append(
            f"<strong>Cadência excessiva ({m['cadencia_per_month']}/mês, "
            f"saudável 12-18)</strong>: posts competem entre si, diluem sinais. "
            f"Reduzir para 15-18 com qualidade maior."
        )
    if s["creative"] < 60:
        recs.append(
            "<strong>Mix criativo fraco</strong>: aumentar % de vídeo curto "
            "(15-60s) com thumbnail + texto sobreposto. Adicionar carrosséis educativos."
        )
    pct_cta = m["posts_with_cta"] / max(m["posts_analyzed"], 1)
    if pct_cta > 0.7:
        recs.append(
            f"<strong>CTA saturado ({m['posts_with_cta']}/{m['posts_analyzed']} "
            f"com mesmo bloco)</strong>: variar entre telefone, direct, link, "
            f"pergunta. Telefone em até 25% dos posts."
        )
    pct_q = m["posts_with_question"] / max(m["posts_analyzed"], 1)
    if pct_q < 0.5:
        recs.append(
            f"<strong>Pouca conversa (só {m['posts_with_question']}/"
            f"{m['posts_analyzed']} com pergunta)</strong>: terminar 80% das "
            f"legendas com pergunta direta ao leitor. Dobra comments médios."
        )
    if s["compliance"] < 80:
        recs.append(
            "<strong>Compliance CFM em risco</strong>: incluir CRM em 100% "
            "dos posts com menção a ato médico. Em antes/depois, adicionar "
            "consentimento explícito por escrito."
        )
    if s["growth"] < 60:
        recs.append(
            "<strong>Tração fraca</strong>: replicar padrão dos top 3 posts. "
            "Aumentar cadência de Reels com hook de pergunta nos primeiros 2s."
        )
    if not recs:
        recs.append(
            "Conta em boa saúde. Foco em escalar o que funciona e testar "
            "novos formatos (lives, colaborações, séries)."
        )
    return recs
