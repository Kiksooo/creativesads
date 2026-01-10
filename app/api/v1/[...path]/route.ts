// Proxy route for /api/v1/* - forwards requests to external API
// This handles all /api/v1/* endpoints by proxying to API_INTERNAL_BASE_URL

import { NextRequest, NextResponse } from 'next/server';

// Handle CORS preflight - returns 204 No Content
export async function OPTIONS(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Proxy function that forwards requests to external API
async function proxy(
  req: NextRequest,
  pathSegments: string[] = []
): Promise<NextResponse> {
  const INTERNAL_BASE = process.env.API_INTERNAL_BASE_URL;

  // Check if API_INTERNAL_BASE_URL is configured
  if (!INTERNAL_BASE) {
    return NextResponse.json(
      {
        error: {
          code: 'CONFIG_ERROR',
          message: 'API_INTERNAL_BASE_URL is not set',
        },
      },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Build target URL
  const path = pathSegments.join('/');
  const search = new URL(req.url).search; // Preserve query string
  const targetUrl = `${INTERNAL_BASE.replace(/\/$/, '')}/${path}${search}`;

  // Prepare headers - copy from request but remove problematic ones
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    // Skip host and content-length - let fetch set these
    if (lowerKey !== 'host' && lowerKey !== 'content-length') {
      headers.set(key, value);
    }
  });

  // Prepare body for non-GET/HEAD requests
  let body: ArrayBuffer | undefined;
  const method = req.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      body = await req.arrayBuffer();
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            code: 'FETCH_ERROR',
            message: `Failed to read request body: ${error instanceof Error ? error.message : String(error)}`,
          },
        },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Forward request to external API
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      redirect: 'manual', // Don't follow redirects automatically
    });

    // Read response body
    const responseBody = await response.arrayBuffer();

    // Build response headers - copy from upstream
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    // Ensure Content-Type is set if not present
    if (!responseHeaders.has('content-type')) {
      responseHeaders.set('content-type', 'application/json');
    }

    // Return upstream response as-is
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    // Handle fetch errors (network, timeout, etc.)
    return NextResponse.json(
      {
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : String(error),
        },
      },
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Export handlers for all HTTP methods
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const params = await ctx.params;
  const pathSegments = params.path || [];
  return proxy(req, pathSegments);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const params = await ctx.params;
  const pathSegments = params.path || [];
  return proxy(req, pathSegments);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const params = await ctx.params;
  const pathSegments = params.path || [];
  return proxy(req, pathSegments);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const params = await ctx.params;
  const pathSegments = params.path || [];
  return proxy(req, pathSegments);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const params = await ctx.params;
  const pathSegments = params.path || [];
  return proxy(req, pathSegments);
}

