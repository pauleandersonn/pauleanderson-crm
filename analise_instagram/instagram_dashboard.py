
"""
Instagram Dashboard Helper — Hermes Agent
Coleta dados via Apify + processa localmente.

Uso:
  python instagram_dashboard.py <handle> [--top 10] [--out relatorio.html]
"""
import os, sys, json, re, statistics, argparse
from pathlib import Path
from datetime import datetime
from collections import Counter
from dotenv import dotenv_values
from apify_client import ApifyClient

def load_token():
    env = dotenv_values(Path.home()/"AppData/Local/hermes/.env.apify.env")
    t = env.get("APIFY_TOKEN")
    if not t:
        sys.exit("APIFY_TOKEN nao encontrado em ~/.hermes/.env.apify.env")
    return t

def collect(handle, token):
    c = ApifyClient(token)
    print(f"[1/3] Coletando perfil @{handle}...")
    run = c.actor("apify/instagram-profile-scraper").call(
        run_input={"usernames":[handle]}
    )
    items = list(c.dataset(run.default_dataset_id).iterate_items())
    profile = items[0] if items else {}
    print(f"      OK: {profile.get('followersCount',0)} seguidores")
    print(f"[2/3] Coletando posts de @{handle}...")
    run2 = c.actor("apify/instagram-post-scraper").call(
        run_input={"username":[handle], "resultsLimit":30}
    )
    posts = list(c.dataset(run2.default_dataset_id).iterate_items())
    print(f"      OK: {len(posts)} posts coletados")
    return profile, posts

def calc_metrics(profile, posts):
    followers = profile.get("followersCount",0) or 1
    n = len(posts)
    if n == 0:
        return {"followers":followers,"n":0}
    likes = [p.get("likesCount",0) or 0 for p in posts]
    comments = [p.get("commentsCount",0) or 0 for p in posts]
    views = [p.get("videoViewCount") or p.get("videoPlayCount") or 0 for p in posts if (p.get("type") or p.get("productType") or "") in ["Video","Reel"]]
    types = Counter((p.get("type") or p.get("productType") or "?") for p in posts)
    total_eng = sum(likes) + sum(comments)
    er = (total_eng / (followers * n) * 100) if followers and n else 0
    return {
        "followers": followers, "n": n,
        "avg_likes": round(sum(likes)/n, 1),
        "avg_comments": round(sum(comments)/n, 1),
        "top_likes": max(likes),
        "top_views": max(views) if views else 0,
        "avg_views": round(sum(views)/len(views), 1) if views else 0,
        "er_pct": round(er, 3),
        "types": dict(types),
    }

def top_posts(posts, n=10):
    scored = []
    for p in posts:
        likes = p.get("likesCount",0) or 0
        comments = p.get("commentsCount",0) or 0
        views = p.get("videoViewCount") or p.get("videoPlayCount") or 0
        score = likes + comments*5 + views*0.05
        scored.append({"score":round(score,1), "post":p, "likes":likes, "comments":comments, "views":views})
    scored.sort(key=lambda x:-x["score"])
    return scored[:n]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("handle", help="instagram handle (sem @)")
    ap.add_argument("--top", type=int, default=10)
    ap.add_argument("--out", default=None)
    args = ap.parse_args()
    token = load_token()
    profile, posts = collect(args.handle, token)
    metrics = calc_metrics(profile, posts)
    top = top_posts(posts, args.top)
    out = {
        "handle": args.handle,
        "profile": profile,
        "posts": posts,
        "metrics": metrics,
        "top": top,
        "generated_at": datetime.now().isoformat(),
    }
    fp = args.out or f"instagram_{args.handle}_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
    Path(fp).write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[3/3] Salvo em: {fp}")

if __name__ == "__main__":
    main()
