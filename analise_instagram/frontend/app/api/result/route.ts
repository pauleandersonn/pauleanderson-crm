export const runtime = "edge";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:9090";

async function proxyFetch(url: string) {
  const res = await fetch(`${BACKEND}${url}`, {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  return proxyFetch(`/api/result${query ? `?${query}` : ""}`);
}
