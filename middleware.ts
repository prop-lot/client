
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const proplotRatelimit = new Ratelimit({
  redis: kv,
  // 15 requests from the same IP in 10 seconds for 'proplot.wtf'
  limiter: Ratelimit.slidingWindow(15, '10 s'),
});

const defaultRatelimit = new Ratelimit({
  redis: kv,
  // 3 requests from the same IP in 10 seconds for other origins
  limiter: Ratelimit.slidingWindow(3, '10 s'),
});

export const config = {
  matcher: '/api/graphql',
};

export default async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const ip = request.ip ?? '127.0.0.1';

  let ratelimit;

  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  if (origin === 'https://lilnouns.proplot.wtf') {
    ratelimit = proplotRatelimit;
  } else {
    ratelimit = defaultRatelimit;
  }

  // Apply rate limiting
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.redirect(new URL('/blocked', request.url));
  }

  return NextResponse.next();
}
