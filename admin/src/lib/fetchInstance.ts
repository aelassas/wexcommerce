import env from '@/config/env.config'
import * as wexcommerceHelper from ':wexcommerce-helper'

const skipStatuses = [204, 400, 500]

const getURL = (url: string) =>
  `${wexcommerceHelper.trimEnd(env.isServer() ? env.SERVER_API_HOST! : env.CLIENT_API_HOST!, '/')}/${wexcommerceHelper.trimStart(url, '/')}`

const getContentType = (headers?: Record<string, string>[]) => {
  let contentType = 'text/plain'

  if (headers) {
    const index = headers?.findIndex((kvp) => {
      const key = Object.keys(kvp)[0]

      return key && key.toLowerCase() === 'content-type'
    }) || -1

    if (index > -1) {
      const kvp = headers[index]
      const key = Object.keys(kvp).find((key) => key.toLowerCase() === 'content-type')
      contentType = kvp[key!]
    }
  }
  return contentType
}

const getHeaders = (initialValue: Record<string, string> = {}, headers?: Record<string, string>[]): Record<string, string> => {
  if (headers) {
    for (const kvp of headers) {
      const key = Object.keys(kvp)[0]
      const value = kvp[key]

      if (key && key.toLowerCase() !== 'content-type') {
        initialValue[key] = value
      }
    }
  }
  return initialValue
}

const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  baseDelay: number = 1000,
  timeoutMs: number = 15000, // Timeout support to prevent hanging requests (15000ms default)
): Promise<globalThis.Response> => {
  for (let i = 0; i <= retries; i++) {
    try {
      // Create an AbortController for timeout handling
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeout) // Clear timeout if successful

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response
    } catch (error) {
      console.error(`Fetch failed (attempt ${i + 1}):`, error)

      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error(`Fetch request timed out after ${timeoutMs}ms`)
      }

      if (i < retries - 1) {
        const retryDelay = baseDelay * 2 ** i // Exponential backoff
        console.log(`Retrying in ${retryDelay}ms...`)
        await new Promise((res) => setTimeout(res, retryDelay))
      }
    }
  }
  throw new Error(`Fetch failed after ${retries} retries`)
}

interface Response {
  status: number
  data: any
}

export const GET = async (url: string, headers?: Record<string, string>[], noData?: boolean): Promise<Response> => {
  const res = await fetchWithRetry(getURL(url), {
    method: 'GET',
    headers: getHeaders({}, headers),
    cache: 'no-store',
  })
  const { status } = res
  const data = !noData && !skipStatuses.includes(status) && (await res.json())

  return { status, data }
}

export const POST = async (url: string, body?: any, headers?: Record<string, string>[], noData?: boolean, isFormData?: boolean): Promise<Response> => {
  const _headers = getHeaders({
    'Accept': '*/*',
    'Content-Type': body ? 'application/json' : getContentType(headers),
  }, headers)
  if (isFormData) {
    delete _headers['Content-Type']
  }
  const res = await fetchWithRetry(getURL(url), {
    method: 'POST',
    headers: _headers,
    body: isFormData ? body : JSON.stringify(body),
    cache: 'no-store',
  })

  const { status } = res
  const data = !noData && !skipStatuses.includes(status) && (await res.json())

  return { status, data }
}

export const PUT = async (url: string, body?: any, headers?: Record<string, string>[], noData?: boolean, isFormData?: boolean): Promise<Response> => {
  const _headers = getHeaders({
    'Accept': '*/*',
    'Content-Type': body ? 'application/json' : getContentType(headers),
  }, headers)
  if (isFormData) {
    delete _headers['Content-Type']
  }
  const res = await fetchWithRetry(getURL(url), {
    method: 'PUT',
    headers: _headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const { status } = res
  const data = !noData && !skipStatuses.includes(status) && (await res.json())

  return { status: res.status, data }
}

export const DELETE = async (url: string, headers?: Record<string, string>[], noData?: boolean): Promise<Response> => {
  const res = await fetchWithRetry(getURL(url), {
    method: 'DELETE',
    headers: getHeaders({}, headers),
    cache: 'no-store',
  })

  const { status } = res
  const data = !noData && !skipStatuses.includes(status) && (await res.json())

  return { status, data }
}
