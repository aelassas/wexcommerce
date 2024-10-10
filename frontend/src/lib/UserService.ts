'use server'

import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import env, { CookieOptions } from '@/config/env.config'
import * as CartService from '@/lib/CartService'
import * as WishlistService from '@/lib/WishlistService'

/**
 * Get auth header.
 *
 * @returns {Promise<[string, string]>}
 */
export const authHeader = async (): Promise<Record<string, string>> => {
  let user

  const userCookie = cookies().get('wc-fe-user')

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
      `/api/sign-up/ `,
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
      `/api/validate-email`,
      data,
      [],
      true
    )
    .then((res) => res.status)

/**
 * Check wether a user is a customer.
 *
 * @param {wexcommerceTypes.IsAdminPayload} data
 * @returns {Promise<number>}
 */
export const isUser = async (email: string): Promise<number> =>
  fetchInstance
    .POST(
      `/api/is-user`,
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
    .then((res) => {
      if (res.data.accessToken) {
        cookies().set('wc-fe-user', JSON.stringify(res.data), CookieOptions)
      }
      return ({ status: res.status, data: res.data })
    })
)

/**
 * Social sign in.
 *
 * @param {wexcommerceTypes.SignInPayload} data
 * @returns {Promise<{ status: number, data: wexcommerceTypes.User }>}
 */
export const socialSignin = async (data: wexcommerceTypes.SignInPayload): Promise<{ status: number, data: wexcommerceTypes.User }> =>
  fetchInstance
    .POST(
      '/api/social-sign-in',
      data,
    )
    .then((res) => {
      cookies().set('wc-fe-user', JSON.stringify(res.data), CookieOptions)
      return { status: res.status, data: res.data }
    })

/**
 * Sign out.
 *
 * @async
 * @param {boolean} [_redirect=true]
 * @param {boolean} [_redirectSignIn=false]
 * @param {boolean} [_deleteCartId=false]
 * @returns {*}
 */
export const signout = async (_redirect = true, _redirectSignIn = false, _deleteCartId = false, _deleteWishlisttId = false) => {
  cookies().delete('wc-fe-user')

  if (_deleteCartId) {
    await CartService.deleteCartId()
  }

  if (_deleteWishlisttId) {
    await WishlistService.deleteWishlistId()
  }

  if (_redirect) {
    redirect('/')
  }

  if (_redirectSignIn) {
    const xURL = headers().get('x-url')

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
    `/api/validate-access-token`,
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
      `/api/resend-link`,
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
      `/api/activate/ `,
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

  const userCookie = cookies().get('wc-fe-user')
  if (userCookie) {
    user = JSON.parse(userCookie.value) as wexcommerceTypes.User
  }

  if (user && user.language) {
    return user.language
  } else {
    let lang: string | undefined
    const langCookie = cookies().get('wc-fe-language')
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
      `/api/update-language`,
      data,
      [await authHeader()],
      true
    )
    .then((res) => {
      if (res.status === 200) {
        let user

        const userCookie = cookies().get('wc-fe-user')
        if (userCookie) {
          user = JSON.parse(userCookie.value)
        }

        if (user) {
          user.language = data.language
          cookies().set('wc-fe-user', JSON.stringify(user), CookieOptions)
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
  cookies().set('wc-fe-language', JSON.stringify(lang), CookieOptions)
}

/**
 * Get current user.
 *
 * @returns {(wexcommerceTypes.User | null)}
 */
export const getCurrentUser = async (): Promise<wexcommerceTypes.User | null> => {
  let user

  const userCookie = cookies().get('wc-fe-user')
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
 * Update user.
 *
 * @param {wexcommerceTypes.UpdateUserPayload} data
 * @returns {Promise<number>}
 */
export const updateUser = async (data: wexcommerceTypes.UpdateUserPayload): Promise<number> =>
  fetchInstance
    .POST(
      `/api/update-user`,
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
    .POST(`/api/change-password/ `,
      data, [await authHeader()],
      true
    )
    .then((res) => res.status)

/**
* Parse JWT token.
* @param {string} token
* @returns {any}
*/
export const parseJwt = async (token: string) => {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''))

  return JSON.parse(jsonPayload)
}

/**
 * Check if password exists.
 *
 * @param {string} id
 * @returns {Promise<bookcarsTypes.User|null>}
 */
export const hasPassword = async (id: string): Promise<number> =>
  fetchInstance
    .GET(
      `/api/has-password/${encodeURIComponent(id)}`,
      [await authHeader()],
      false,
    )
    .then((res) => res.status)

/**
* Persist stayConnected.
*
* @param {string} id
* @returns {void}
*/
export const setStayConnected = async (value: boolean) => {
  cookies().set('wc-stay-connected', JSON.stringify(value), CookieOptions)
}

/**
 * Get stayConnected.
 *
 * @param {string} id
 * @returns {boolean}
 */
export const getStayConnected = async () => {
  const value = JSON.parse(cookies().get('wc-stay-connected')?.value || 'false')
  return value as boolean
}
