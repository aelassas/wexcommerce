'use server'

import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import env, { CookieOptions } from '@/config/env.config'

/**
 * Get auth header.
 *
 * @returns {Promise<[string, string]>}
 */
export const authHeader = async (): Promise<Record<string, string>> => {
  let user

  const userCookie = (await cookies()).get('wc-be-user')

  if (userCookie) {
    user = JSON.parse(userCookie.value) as wexcommerceTypes.User
  }

  if (user && user.accessToken) {
    return { 'x-access-token': user.accessToken }
  }

  return {}
}

/**
 * Sign up.
 *
 * @param {wexcommerceTypes.SignUpPayload} data
 * @returns {Promise<number>}
 */
export const signup = async (data: wexcommerceTypes.SignUpPayload): Promise<number> =>
  fetchInstance
    .POST(
      '/api/admin-sign-up/ ',
      data,
      [],
      true
    )
    .then((res) => res.status)

/**
 * Validate email
 *
 * @param {wexcommerceTypes.ValidateEmailPayload} data
 * @returns {Promise<number>}
 */
export const validateEmail = async (data: wexcommerceTypes.ValidateEmailPayload): Promise<number> =>
  fetchInstance
    .POST(
      '/api/validate-email',
      data,
      [],
      true
    )
    .then((res) => res.status)

/**
 * Check wether a user is an admin.
 *
 * @param {wexcommerceTypes.IsAdminPayload} data
 * @returns {Promise<number>}
 */
export const isAdmin = async (email: string): Promise<number> =>
  fetchInstance
    .POST(
      '/api/is-admin',
      { email },
      [],
      true
    )
    .then((res) => res.status)

/**
 * Sign in.
 *
 * @param {wexcommerceTypes.SignInPayload} data
 * @returns {Promise<{ status: number, data: wexcommerceTypes.User }>}
 */
export const signin = async (data: wexcommerceTypes.SignInPayload): Promise<{ status: number, data: wexcommerceTypes.User }> => (
  fetchInstance
    .POST(
      `/api/sign-in/${env.APP_TYPE}`,
      data
    )
    .then(async (res) => {
      if (res.data.accessToken) {
        (await cookies()).set('wc-be-user', JSON.stringify(res.data), CookieOptions)
      }
      return ({ status: res.status, data: res.data })
    })
)

/**
 * Sign out.
 *
 * @param {boolean} [_redirect=true]
 */
export const signout = async (_redirect = true) => {
  (await cookies()).delete('wc-be-user')

  if (_redirect) {
    const xURL = (await headers()).get('x-url')

    if (xURL) {
      const url = new URL(xURL)

      if (url.searchParams.has('o')) {
        redirect(`/sign-in?o=${url.searchParams.get('o')}`)
      } else {
        redirect('/sign-in')
      }
    }
  }
}

/**
 * Validate access token.
 *
 * @returns {Promise<number>}
 */
export const validateAccessToken = async (): Promise<number> => fetchInstance
  .POST(
    '/api/validate-access-token',
    null,
    [await authHeader()],
    true,
  )
  .then((res) => res.status)

/**
 * Resend link.
 *
 * @param {wexcommerceTypes.ResendLinkPayload} data
 * @returns {Promise<number>}
 */
export const resendLink = async (data: wexcommerceTypes.ResendLinkPayload): Promise<number> =>
  fetchInstance
    .POST(
      '/api/resend-link',
      data,
      [await authHeader()],
      true
    )
    .then((res) => res.status)

/**
 * Resend activaton link.
 *
 * @param {string} email
 * @param {boolean} [reset=false]
 * @returns {Promise<number>}
 */
export const resend = async (email: string, reset = false): Promise<number> =>
  fetchInstance
    .POST(
      `/api/resend/${env.APP_TYPE}/${encodeURIComponent(email)}/${reset}`,
      null,
      [],
      true
    )
    .then((res) => res.status)

/**
 * Activate account.
 *
 * @param {wexcommerceTypes.ActivatePayload} data
 * @returns {Promise<number>}
 */
export const activate = async (data: wexcommerceTypes.ActivatePayload): Promise<number> => (
  fetchInstance
    .POST(
      '/api/activate/ ',
      data,
      [await authHeader()],
      true
    )
    .then((res) => res.status)
)

/**
 * Check sign up token.
 *
 * @param {string} userId
 * @param {string} email
 * @param {string} token
 * @returns {Promise<number>}
 */
export const checkToken = async (userId: string, email: string, token: string): Promise<number> =>
  fetchInstance
    .GET(
      `/api/check-token/${env.APP_TYPE}/${encodeURIComponent(userId)}/${encodeURIComponent(email)}/${encodeURIComponent(token)}`,
      [],
      true
    )
    .then((res) => res.status)

/**
 * Delete sign up tokens.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const deleteTokens = async (userId: string): Promise<number> => (
  fetchInstance
    .DELETE(
      `/api/delete-tokens/${encodeURIComponent(userId)}`,
      [],
      true
    )
    .then((res) => res.status)
)

/**
 * Get language.
 *
 * @returns {string}
 */
export const getLanguage = async (): Promise<string> => {
  let user
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('wc-be-user')

  if (userCookie) {
    user = JSON.parse(userCookie.value) as wexcommerceTypes.User
  }

  if (user && user.language) {
    return user.language
  } else {
    let lang: string | undefined
    const langCookie = cookieStore.get('wc-be-language')
    if (langCookie) {
      lang = JSON.parse(langCookie.value) as string
    }

    if (lang && lang.length === 2) {
      return lang
    }
    return env.DEFAULT_LANGUAGE
  }
}

/**
 * Update language.
 *
 * @param {wexcommerceTypes.UpdateLanguagePayload} data
 * @returns {Promise<number>}
 */
export const updateLanguage = async (data: wexcommerceTypes.UpdateLanguagePayload): Promise<number> => {
  return fetchInstance
    .POST(
      '/api/update-language',
      data,
      [await authHeader()],
      true
    )
    .then(async (res) => {
      if (res.status === 200) {
        let user
        const cookieStore = await cookies()

        const userCookie = cookieStore.get('wc-be-user')
        if (userCookie) {
          user = JSON.parse(userCookie.value)
        }

        if (user) {
          user.language = data.language
          cookieStore.set('wc-be-user', JSON.stringify(user), CookieOptions)
        }
      }
      return res.status
    })
}

/**
 * Set language in cookies.
 *
 * @param {string} lang
 */
export const setLanguage = async (lang: string) => {
  (await cookies()).set('wc-be-language', JSON.stringify(lang), CookieOptions)
}

/**
 * Get current user.
 *
 * @returns {(wexcommerceTypes.User | null)}
 */
export const getCurrentUser = async (): Promise<wexcommerceTypes.User | null> => {
  let user

  const userCookie = (await cookies()).get('wc-be-user')
  if (userCookie) {
    user = JSON.parse(userCookie.value)
  }

  if (user && user.accessToken) {
    return user as wexcommerceTypes.User
  }
  return null
}

/**
 * Get user.
 *
 * @param {string} id
 * @returns {Promise<wexcommerceTypes.User>}
 */
export const getUser = async (id: string): Promise<wexcommerceTypes.User> =>
  fetchInstance
    .GET(
      `/api/user/${id}`,
      [await authHeader()]
    )
    .then((res) => res.data)

/**
 * Get users.
 *
 * @param {string} keyword
 * @param {number} page
 * @param {number} size
 * @returns {Promise<wexcommerceTypes.Result<wexcommerceTypes.User>>}
 */
export const getUsers = async (keyword: string, page: number, size: number): Promise<wexcommerceTypes.Result<wexcommerceTypes.User>> =>
  fetchInstance
    .GET(
      `/api/users/${page}/${size}/?s=${encodeURIComponent(keyword)}`,
      [await authHeader()]
    )
    .then((res) => res.data)

/**
 * Update user.
 *
 * @param {wexcommerceTypes.UpdateUserPayload} data
 * @returns {Promise<number>}
 */
export const updateUser = async (data: wexcommerceTypes.UpdateUserPayload): Promise<number> =>
  fetchInstance
    .POST(
      '/api/update-user',
      data,
      [await authHeader()],
      true
    )
    .then((res) => res.status)

/**
 * Check password.
 *
 * @param {string} id
 * @param {string} password
 * @returns {Promise<number>}
 */
export const checkPassword = async (id: string, password: string): Promise<number> =>
  fetchInstance
    .GET(
      `/api/check-password/${encodeURIComponent(id)}/${encodeURIComponent(password)}`,
      [await authHeader()],
      true
    )
    .then((res) => res.status)

/**
 * Change password.
 *
 * @param {wexcommerceTypes.ChangePasswordPayload} data
 * @returns {Promise<number>}
 */
export const changePassword = async (data: wexcommerceTypes.ChangePasswordPayload): Promise<number> =>
  fetchInstance
    .POST('/api/change-password/',
      data, [await authHeader()],
      true
    )
    .then((res) => res.status)

/**
 * Delete users.
 *
 * @param {string[]} ids
 * @returns {Promise<number>}
 */
export const deleteUsers = async (ids: string[]): Promise<number> =>
  fetchInstance
    .POST(
      '/api/delete-users',
      ids,
      [await authHeader()],
      true
    )
    .then((res) => res.status)
