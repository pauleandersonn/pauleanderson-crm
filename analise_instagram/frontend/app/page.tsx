"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, UserPlus, FileText, Percent, Heart, MessageCircle, Play, Calendar } from "lucide-react";

type Post = {
  type?: string;
  productType?: string;
  likesCount?: number;
  commentsCount?: number;
  videoViewCount?: number;
  videoPlayCount?: number;
  shortCode?: string;
  code?: string;
  displayUrl?: string;
  thumbnailUrl?: string;
  images?: { url?: string }[];
  caption?: string;
};

type TopItem = {
  score: number;
  post: Post;
  likes: number;
  comments: number;
  views: number;
};

type Metrics = {
  followers: number;
  n: number;
  avg_likes: number;
  avg_comments: number;
  top_likes: number;
  top_views: number;
  avg_views: number;
  er_pct: number;
  types: Record<string, number>;
  posts_analyzed: number;
  date_range: string;
  cadencia_per_month: number;
  hashtags_per_post: number;
  posts_with_cta: number;
};

type Audit = {
  handle: string;
  metrics: Metrics;
  scores: {
    content_quality: number;
    engagement: number;
    creative: number;
    growth: number;
    competitive: number;
    compliance: number;
  };
  ig_health_score: number;
  status: string;
  types: Record<string, number>;
  pillar_distribution: Record<string, number>;
  compliance: {
    total: number;
    crm: number;
    antes_depois: number;
    promessa: number;
    preco: number;
  };
  benchmark: {
    er: number;
    cadencia: number;
    video_pct: number;
    hashtags_per_post: number;
    cta_pct: number;
  };
};

type Profile = {
  username?: string;
  fullName?: string;
  biography?: string;
  profilePicUrlHD?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  verified?: boolean;
  isBusinessAccount?: boolean;
};

type Data = {
  handle: string;
  profile: Profile;
  metrics: Metrics;
  top: TopItem[];
  audit?: Audit;
  generated_at: string;
};

function fmt(n: number) {
  return Number(n || 0).toLocaleString("pt-BR");
}

function esc(s: string | undefined) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function scoreBadge(score: number) {
  if (score >= 75) return <Badge className="bg-emerald-500 hover:bg-emerald-600">{score}</Badge>;
  if (score >= 60) return <Badge className="bg-blue-500 hover:bg-blue-600">{score}</Badge>;
  if (score >= 40) return <Badge className="bg-amber-500 hover:bg-amber-600">{score}</Badge>;
  return <Badge className="bg-red-500 hover:bg-red-600">{score}</Badge>;
}

function compStatus(pct: number, threshold = 80) {
  if (pct >= threshold) return <Badge className="bg-emerald-500 hover:bg-emerald-600">OK</Badge>;
  if (pct >= 40) return <Badge className="bg-amber-500 hover:bg-amber-600">Atenção</Badge>;
  return <Badge className="bg-red-500 hover:bg-red-600">Crítico</Badge>;
}

export default function Home() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addLog = useCallback((msg: string, type = "") => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const tryCache = useCallback(async (h: string) => {
    try {
      const r1 = await fetch(`/api/result?handle=${encodeURIComponent(h)}&mode=full`);
      if (r1.ok) {
        const d = await r1.json();
        if (d && d.audit) {
          addLog("Cache FULL encontrado. Renderizando auditoria.", "ok");
          return d;
        }
      }
      const r2 = await fetch(`/api/result?handle=${encodeURIComponent(h)}`);
      if (r2.ok) {
        const d = await r2.json();
        if (d && d.profile) {
          addLog("Cache SIMPLE encontrado (sem auditoria).", "warn");
          return d;
        }
      }
    } catch {}
    return null;
  }, [addLog]);

  const pollStatus = useCallback(async (jobId: string, h: string) => {
    for (let attempts = 0; attempts < 75; attempts++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const r = await fetch(`/api/status?job=${jobId}`);
        if (!r.ok) continue;
        const s = await r.json();
        setProgressStage(s.status === "running" ? "Coletando + auditando..." : s.status);
        setProgressPct(30 + attempts * 1);
        if (s.status === "done") {
          addLog("Coleta + auditoria concluída!", "ok");
          const cached = await tryCache(h);
          if (cached) setData(cached);
          else addLog("Erro: cache não foi populado.", "err");
          return;
        }
        if (s.status === "error") {
          addLog("Erro: " + (s.error || "desconhecido"), "err");
          setError(s.error || "Erro desconhecido");
          return;
        }
      } catch {}
    }
    addLog("Timeout. Tente novamente.", "err");
  }, [addLog, tryCache]);

  const analyze = useCallback(async () => {
    const h = handle.trim().replace(/^@/, "").toLowerCase();
    if (!h) return;
    clearLogs();
    setData(null);
    setError(null);
    setLoading(true);
    setProgressPct(0);

    addLog(`Verificando cache para @${h}...`);
    setProgressStage("Verificando cache...");
    setProgressPct(10);

    const cached = await tryCache(h);
    if (cached) {
      setData(cached);
      setLoading(false);
      setProgressStage("");
      setProgressPct(0);
      return;
    }

    addLog("Cache expirado/inexistente. Iniciando coleta + auditoria...", "warn");
    setProgressStage("Coletando (perfil + posts)...");
    setProgressPct(30);

    try {
      const startResp = await fetch(`/api/analyze?handle=${encodeURIComponent(h)}&mode=full`);
      if (!startResp.ok) {
        addLog("Erro ao iniciar job: HTTP " + startResp.status, "err");
        setLoading(false);
        setProgressStage("");
        setProgressPct(0);
        return;
      }
      const { job_id } = await startResp.json();
      addLog("Job iniciado: " + job_id);
      addLog("Apify pode levar 60-90s + auditoria. Aguarde...");
      await pollStatus(job_id, h);
    } catch (e: any) {
      addLog("Erro: " + (e?.message || e), "err");
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
      setProgressStage("");
      setProgressPct(0);
    }
  }, [handle, clearLogs, addLog, tryCache, pollStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auto = params.get("handle");
    if (auto) {
      setHandle(auto);
      setTimeout(() => analyze(), 200);
    }
  }, [analyze]);

  const p = data?.profile;
  const m = data?.metrics;
  const a = data?.audit;
  const top = data?.top || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <Card className="mb-6 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Análise Instagram
          </h1>
          <p className="text-slate-400 mt-2">Análise automática com auditoria 6D + benchmark do nicho</p>
        </Card>

        {/* Input */}
        <Card className="mb-6 bg-slate-900 border-slate-800">
          <div className="flex gap-3">
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@drrenatogallo"
              className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
              onKeyDown={(e) => e.key === "Enter" && analyze()}
            />
            <Button onClick={analyze} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Coletando..." : "Analisar"}
            </Button>
          </div>
          <div className="flex gap-2 mt-3 text-xs text-slate-400">
            <span>Exemplos:</span>
            {["drrenatogallo", "dreulerfilho", "midiacriativadoreino"].map((ex) => (
              <button
                key={ex}
                onClick={() => setHandle(ex)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </Card>

        {/* Progress */}
        {loading && (
          <Card className="mb-6 bg-slate-900 border-slate-800">
            <p className="text-sm text-slate-400 mb-2">{progressStage}</p>
            <Progress value={progressPct} className="h-2" />
            <p className="text-xs text-slate-500 mt-2">Isso pode levar 30-90 segundos (1ª vez).</p>
          </Card>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <Card className="mb-6 bg-slate-900 border-slate-800 font-mono text-xs max-h-60 overflow-y-auto">
            {logs.map((l, i) => (
              <div key={i} className={`py-1 ${l.includes("ok") ? "text-emerald-400" : l.includes("warn") || l.includes("Erro") ? "text-amber-400" : "text-red-400"}`}>
                {l}
              </div>
            ))}
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="mb-6 bg-red-950 border-red-800 text-red-200">
            <p className="font-semibold">Erro</p>
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* IG Health Score + 6D Breakdown */}
            {a && (
              <>
                <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                  <Card className="bg-slate-900 border-slate-800 flex flex-col items-center justify-center">
                    <div className="text-5xl font-extrabold bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text text-transparent">
                      {a.ig_health_score}
                    </div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-widest mt-1">
                      {a.status.split(" (")[0]}
                    </div>
                  </Card>
                  <Card className="bg-slate-900 border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3">Breakdown 6 Dimensões</h3>
                    <div className="space-y-2">
                      {[
                        ["Content Quality", a.scores.content_quality],
                        ["Engagement Performance", a.scores.engagement],
                        ["Creative Quality", a.scores.creative],
                        ["Growth Trajectory", a.scores.growth],
                        ["Competitive Position", a.scores.competitive],
                        ["Compliance", a.scores.compliance],
                      ].map(([label, score]) => (
                        <div key={label} className="flex justify-between items-center py-1 border-b border-slate-800 last:border-0">
                          <span className="text-sm text-slate-300">{label}</span>
                          {scoreBadge(score as number)}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Metrics */}
                <Card className="bg-slate-900 border-slate-800">
                  <h2 className="text-lg font-semibold mb-4 text-slate-200">Métricas-chave</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-400"><Heart className="h-4 w-4" /></div>
                      <div className="text-2xl font-bold text-slate-100">{m.avg_likes}</div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider">Likes médios</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-400"><MessageCircle className="h-4 w-4" /></div>
                      <div className="text-2xl font-bold text-slate-100">{m.avg_comments}</div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider">Comments médios</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-400"><Play className="h-4 w-4" /></div>
                      <div className="text-2xl font-bold text-slate-100">{fmt(m.avg_views)}</div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider">Views médios</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-amber-400"><Calendar className="h-4 w-4" /></div>
                      <div className="text-2xl font-bold text-slate-100">{a ? a.metrics.cadencia_per_month : "—"}</div>
                      <div className="text-[11px] text-slate-500 uppercase tracking-wider">Posts / mês</div>
                    </div>
                  </div>
                </Card>

                {/* Benchmark */}
                <Card className="bg-slate-900 border-slate-800">
                  <h2 className="text-lg font-semibold mb-2 text-slate-200">Big Benef Real — vs Benchmark</h2>
                  <p className="text-xs text-slate-500 mb-4">Benchmark: contas similares em nicho de autoridade/serviço profissional</p>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-slate-800/50">
                        <TableHead className="text-slate-400">Métrica</TableHead>
                        <TableHead className="text-slate-400">Conta</TableHead>
                        <TableHead className="text-slate-400">Benchmark</TableHead>
                        <TableHead className="text-slate-400">Gap</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const bench = a.benchmark;
                        const am = a.metrics;
                        const videoPct = ((a.types["Video"] || 0) + (a.types["Reel"] || 0)) / Math.max(am.posts_analyzed || 1, 1) * 100;
                        const ctaPct = (am.posts_with_cta || 0) / Math.max(am.posts_analyzed || 1, 1) * 100;
                        const rows = [
                          ["Engagement Rate (%)", am.er_pct, bench.er, (v: number) => v.toFixed(3)],
                          ["Cadência (posts/mês)", am.cadencia_per_month, bench.cadencia, (v: number) => v.toFixed(1), true],
                          ["Mix Vídeo (%)", videoPct, bench.video_pct, (v: number) => Math.round(v).toString()],
                          ["Hashtags / post", am.hashtags_per_post, bench.hashtags_per_post, (v: number) => v.toFixed(1)],
                          ["Posts com CTA (%)", ctaPct, bench.cta_pct, (v: number) => Math.round(v).toString()],
                        ];
                        return rows.map(([label, val, bv, fmtS, lowerBetter], i) => {
                          let diff = (val as number) - (bv as number);
                          if (lowerBetter) diff = -diff;
                          const ok = diff >= 0;
                          return (
                            <TableRow key={i} className="border-slate-800 hover:bg-slate-800/50">
                              <TableCell className="text-slate-300">{label as string}</TableCell>
                              <TableCell className="text-slate-300">{(fmtS as (v: number) => string)(val as number)}</TableCell>
                              <TableCell className="text-slate-300">{(fmtS as (v: number) => string)(bv as number)}</TableCell>
                              <TableCell>
                                <span className={ok ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                                  {(diff >= 0 ? "+" : "") + diff.toFixed(2)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                </Card>

                {/* Pillars */}
                <Card className="bg-slate-900 border-slate-800">
                  <h2 className="text-lg font-semibold mb-4 text-slate-200">Pilares de Conteúdo</h2>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-slate-800/50">
                        <TableHead className="text-slate-400">Pilar</TableHead>
                        <TableHead className="text-slate-400">Posts</TableHead>
                        <TableHead className="text-slate-400">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(a.pillar_distribution)
                        .sort((x, y) => y[1] - x[1])
                        .map(([k, v]) => {
                          const total = Object.values(a.pillar_distribution).reduce((x, y) => x + y, 0) || 1;
                          return (
                            <TableRow key={k} className="border-slate-800 hover:bg-slate-800/50">
                              <TableCell className="text-slate-300">{k}</TableCell>
                              <TableCell className="text-slate-300">{v}</TableCell>
                              <TableCell className="text-slate-300">{Math.round((v / total) * 100)}%</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </Card>

                {/* Compliance */}
                <Card className="bg-slate-900 border-slate-800">
                  <h2 className="text-lg font-semibold mb-4 text-slate-200">Compliance CFM / Boas Práticas</h2>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-slate-800/50">
                        <TableHead className="text-slate-400">Indicador</TableHead>
                        <TableHead className="text-slate-400">Posts</TableHead>
                        <TableHead className="text-slate-400">%</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const comp = a.compliance;
                        const tot = comp.total || 1;
                        const pct = (n: number) => Math.round(((n || 0) / tot) * 100);
                        return (
                          <>
                            <TableRow className="border-slate-800 hover:bg-slate-800/50">
                              <TableCell className="text-slate-300">CRM identificado</TableCell>
                              <TableCell className="text-slate-300">{comp.crm}/{tot}</TableCell>
                              <TableCell className="text-slate-300">{pct(comp.crm)}%</TableCell>
                              <TableCell>{compStatus(pct(comp.crm), 80)}</TableCell>
                            </TableRow>
                            <TableRow className="border-slate-800 hover:bg-slate-800/50">
                              <TableCell className="text-slate-300">Antes/depois</TableCell>
                              <TableCell className="text-slate-300">{comp.antes_depois}/{tot}</TableCell>
                              <TableCell className="text-slate-300">{pct(comp.antes_depois)}%</TableCell>
                              <TableCell>
                                {comp.antes_depois > 0 ? (
                                  <Badge className="bg-amber-500 hover:bg-amber-600">Consentimento</Badge>
                                ) : (
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600">OK</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                            <TableRow className="border-slate-800 hover:bg-slate-800/50">
                              <TableCell className="text-slate-300">Promessas de resultado</TableCell>
                              <TableCell className="text-slate-300">{comp.promessa}/{tot}</TableCell>
                              <TableCell className="text-slate-300">{pct(comp.promessa)}%</TableCell>
                              <TableCell>
                                {comp.promessa > 0 ? (
                                  <Badge className="bg-red-500 hover:bg-red-600">Crítico</Badge>
                                ) : (
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600">OK</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                            <TableRow className="border-slate-800 hover:bg-slate-800/50">
                              <TableCell className="text-slate-300">Divulgação de preços</TableCell>
                              <TableCell className="text-slate-300">{comp.preco}/{tot}</TableCell>
                              <TableCell className="text-slate-300">{pct(comp.preco)}%</TableCell>
                              <TableCell>
                                {comp.preco > 2 ? (
                                  <Badge className="bg-amber-500 hover:bg-amber-600">Atenção</Badge>
                                ) : (
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600">OK</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      })()}
                    </TableBody>
                  </Table>
                </Card>

                {/* Recommendations */}
                {(() => {
                  const am = a.metrics;
                  const recs: string[] = [];
                  if (a.scores.engagement < 50)
                    recs.push(`<strong>Aumentar engajamento (atual ${am.er_pct}%, benchmark ${a.benchmark.er}%)</strong>: variar formato (95% vídeo), adicionar perguntas em 80% dos captions, criar ganchos fortes nos primeiros 2 segundos.`);
                  if ((am.hashtags_per_post || 0) < 3)
                    recs.push(`<strong>Hashtags subutilizadas (atual ${am.hashtags_per_post}/post, benchmark 5+)</strong>: criar set fixo de 8 hashtags por post (3 nichos amplos + 3 específicos + 2 locais).`);
                  if ((am.cadencia_per_month || 0) > 20)
                    recs.push(`<strong>Cadência excessiva (${am.cadencia_per_month}/mês, saudável 12-18)</strong>: posts competem entre si. Reduzir para 15-18 com qualidade maior.`);
                  if ((a.scores.creative || 0) < 60)
                    recs.push(`<strong>Mix criativo fraco</strong>: aumentar % de vídeo curto (15-60s) com thumbnail + texto sobreposto. Adicionar carrosséis educativos.`);
                  if (!recs.length) recs.push("Conta em boa saúde. Foco em escalar o que funciona e testar novos formatos (lives, colaborações, séries).");

                  return (
                    <Card className="bg-slate-900 border-slate-800">
                      <h2 className="text-lg font-semibold mb-3 text-slate-200">Recomendações Imediatas</h2>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                        {recs.map((r, i) => (
                          <li key={i} dangerouslySetInnerHTML={{ __html: r }} />
                        ))}
                      </ol>
                    </Card>
                  );
                })()}
              </>
            )}

            {/* Profile Card */}
            <Card className="bg-slate-900 border-slate-800">
              <div className="flex gap-5 items-start">
                {p?.profilePicUrlHD && (
                  <img
                    src={p.profilePicUrlHD}
                    alt=""
                    className="w-20 h-20 rounded-full border-2 border-blue-500 flex-shrink-0"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-100">
                    @{esc(data.handle)} — {esc(p?.fullName)}
                  </h2>
                  <div className="flex gap-2 mt-2">
                    {p?.verified && <Badge className="bg-emerald-500 hover:bg-emerald-600">Verificado</Badge>}
                    {p?.isBusinessAccount && <Badge className="bg-blue-500 hover:bg-blue-600">Business</Badge>}
                  </div>
                  <p className="mt-3 text-sm text-slate-400 line-clamp-3">{esc(p?.biography)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-blue-400"><Users className="h-4 w-4" /></div>
                  <div className="text-xl font-bold text-slate-100">{fmt(p?.followersCount || 0)}</div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider">Followers</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-emerald-400"><UserPlus className="h-4 w-4" /></div>
                  <div className="text-xl font-bold text-slate-100">{fmt(p?.followsCount || 0)}</div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider">Seguindo</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-purple-400"><FileText className="h-4 w-4" /></div>
                  <div className="text-xl font-bold text-slate-100">{fmt(p?.postsCount || 0)}</div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider">Posts totais</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-amber-400"><Percent className="h-4 w-4" /></div>
                  <div className="text-xl font-bold text-slate-100">{m?.er_pct || 0}%</div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider">Engagement Rate</div>
                </div>
              </div>
            </Card>

            {/* Top Posts */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-slate-200">Top {top.length} Conteúdos</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {top.map((t, i) => {
                  const post = t.post;
                  const sc = post.shortCode || post.code || "";
                  const thumb = post.displayUrl || post.thumbnailUrl || (post.images?.[0]?.url) || "";
                  const cap = (post.caption || "").substring(0, 140);
                  const ptype = post.type || post.productType || "?";
                  return (
                    <Card key={i} className="bg-slate-900 border-slate-800 overflow-hidden hover:border-blue-500 transition-colors">
                      <a
                        href={sc ? `https://www.instagram.com/p/${sc}/` : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block no-underline text-inherit"
                      >
                        <div className="relative">
                          {thumb && (
                            <img
                              src={thumb}
                              alt=""
                              className="w-full h-48 object-cover bg-slate-800"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-amber-500 text-slate-900 font-bold">#{i + 1}</Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300">{ptype}</Badge>
                            <span className="text-xs text-amber-400 font-semibold">Score: {t.score}</span>
                          </div>
                          <div className="flex gap-3 text-xs text-slate-400 mb-2">
                            <span><strong className="text-slate-200">{fmt(t.likes)}</strong> likes</span>
                            <span><strong className="text-slate-200">{fmt(t.comments)}</strong> comments</span>
                            <span><strong className="text-slate-200">{fmt(t.views)}</strong> views</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">{esc(cap)}...</p>
                        </div>
                      </a>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
