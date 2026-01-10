import { NextRequest } from "next/server";

const INTERNAL_BASE = process.env.API_INTERNAL_BASE_URL;

if (!INTERNAL_BASE) {
  console.warn("API_INTERNAL_BASE_URL is not set");
}

async function proxy(req: NextRequest, parts: string[]) {
  if (!INTERNAL_BASE) {
    return new Response(
      JSON.stringify({ error: { code: "CONFIG_ERROR", message: "API_INTERNAL_BASE_URL is not set" } }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const target = `${INTERNAL_BASE}/${parts.join("/")}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const upstream = await fetch(target, {
    method,
    headers,
    body: hasBody ? req.body : undefined,
    // @ts-expect-error - duplex is valid for streaming requests but TypeScript types may not include it
    duplex: hasBody ? "half" : undefined,
    redirect: "manual",
  });

  // Гарантируем: если upstream вернул HTML, мы не отдаём его как есть
  const ct = upstream.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    // читаем немного текста для логов, но клиенту не выдаём HTML
    const text = await upstream.text().catch(() => "");
    console.error("Upstream returned non-JSON:", upstream.status, ct, text.slice(0, 200));

    return new Response(
      JSON.stringify({
        error: {
          code: "UPSTREAM_NON_JSON",
          message: `Upstream returned non-JSON response (${upstream.status}). Check API logs.`,
        },
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  // прокидываем json как есть
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

