'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IResolveParams } from ':reactjs-social-login'
import * as wexcommerceTypes from ':wexcommerce-types'
import { strings as commonStrings } from '@/lang/common'
import env from '@/config/env.config'
import * as UserService from '@/lib/UserService'

import styles from '@/styles/social-login.module.css'

let LoginSocialGoogle = null
let LoginSocialFacebook = null
let LoginSocialApple = null
let REDIRECT_URI = null
if (typeof window === 'object') {
  LoginSocialGoogle = require(':reactjs-social-login').LoginSocialGoogle
  LoginSocialFacebook = require(':reactjs-social-login').LoginSocialFacebook
  LoginSocialApple = require(':reactjs-social-login').LoginSocialApple
  REDIRECT_URI = window.location.href
}

interface SocialLoginProps {
  facebook?: boolean
  apple?: boolean
  google?: boolean
  redirectToHomepage?: boolean
  reloadPage?: boolean
  className?: string
  // eslint-disable-next-line no-unused-vars
  onError?: (error: any) => void
  onSignInError?: () => void
  onBlackListed?: () => void
}

const SocialLogin: React.FC<SocialLoginProps> = ({
  facebook,
  apple,
  google = true,
  reloadPage,
  className,
  onError,
  onSignInError,
  onBlackListed
}) => {
  const router = useRouter()

  const loginSuccess = async (socialSignInType: wexcommerceTypes.SocialSignInType, accessToken: string, email: string, fullName: string, avatar?: string) => {
    const data: wexcommerceTypes.SignInPayload = {
      socialSignInType,
      accessToken,
      email,
      fullName,
      avatar,
      stayConnected: (await UserService.getStayConnected())
    }
    const res = await UserService.socialSignin(data)
    if (res.status === 200) {
      if (res.data.blacklisted) {
        await UserService.signout(false)
        if (onBlackListed) {
          onBlackListed()
        }
      } else {
        if (reloadPage) {
          window.location.reload()
        } else {
          router.replace('/')
        }
      }
    } else if (onSignInError) {
      onSignInError()
    }
  }

  const loginError = (err: any) => {
    console.error(err)
    if (onError) {
      onError(err)
    }
  }

  const getEmail = async (jwtToken: string) => {
    const jwt = await UserService.parseJwt(jwtToken)
    const { email } = jwt
    return email
  }

  return (
    <div className={`${className ? `${className} ` : ''}${styles.SocialLogin}`}>
      <div className={styles.separator}>
        <hr />
        <span>{commonStrings.OR}</span>
        <hr />
      </div>

      <div className={styles.loginButtons}>
        {facebook && (
          <LoginSocialFacebook
            appId={env.FB_APP_ID}
            redirect_uri={REDIRECT_URI}
            onResolve={({ data }: IResolveParams) => {
              loginSuccess(wexcommerceTypes.SocialSignInType.Facebook, data?.accessToken, data?.email, data?.name, data?.picture?.data?.url)
            }}
            onReject={(err: any) => {
              loginError(err)
            }}
            className={styles.social}
          >
            <Image
              width={0}
              height={0}
              sizes="100vw"
              priority={true}
              alt="Facebook"
              src="/facebook-icon.png"
              className={styles.social}
            />
          </LoginSocialFacebook>
        )}

        {apple && (
          <LoginSocialApple
            client_id={env.APPLE_ID}
            scope="name email"
            redirect_uri={REDIRECT_URI}
            onResolve={({ data }: IResolveParams) => {
              const email = data?.user?.email || getEmail(String(data?.id_token))
              loginSuccess(wexcommerceTypes.SocialSignInType.Apple, data?.id_token, email, data?.user ? `${data?.user?.firstName} ${data?.user?.lastName}` : email)
            }}
            onReject={(err: any) => {
              loginError(err)
            }}
            className={styles.social}
          >
            <Image
              width={0}
              height={0}
              sizes="100vw"
              priority={true}
              alt="Apple"
              src="/apple-icon.png"
              className={styles.social}
            />
          </LoginSocialApple>
        )}

        {google && (
          <LoginSocialGoogle
            client_id={env.GG_APP_ID}
            redirect_uri={REDIRECT_URI}
            scope="openid profile email"
            discoveryDocs="claims_supported"
            onResolve={({ data }: IResolveParams) => {
              loginSuccess(wexcommerceTypes.SocialSignInType.Google, data?.access_token, data?.email, data?.name || data?.email, data?.picture)
            }}
            onReject={(err: any) => {
              loginError(err)
            }}
            className={styles.social}
          >
            <Image
              width={0}
              height={0}
              sizes="100vw"
              priority={true}
              alt="Google"
              src="/google-icon.png"
              className={styles.social}
            />
          </LoginSocialGoogle>
        )}
      </div>
    </div>
  )
}

export default SocialLogin
