import { NextResponse } from 'next/server'

export function proxy(request: Request) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}
