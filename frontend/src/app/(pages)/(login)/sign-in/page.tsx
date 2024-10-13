'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Paper,
  FormControl,
  InputLabel,
  OutlinedInput,
  Button
} from '@mui/material'
import * as wexcommerceTypes from ':wexcommerce-types'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/sign-in'
import * as UserService from '@/lib/UserService'
import Error from '@/components/Error'
import SocialLogin from '@/components/SocialLogin'

import styles from '@/styles/signin.module.css'

const SignIn: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { setUser } = useUserContext() as UserContextType
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)

  const signout = async (redirect: boolean) => {
    setUser(null)
    await UserService.signout(redirect)
  }

  useEffect(() => {
    (async function () {
      try {
        const currentUser = await UserService.getCurrentUser()

        if (currentUser) {
          const status = await UserService.validateAccessToken()

          if (status === 200) {
            const user = await UserService.getUser(currentUser._id!)
            if (user) {
              router.push('/orders')
            } else {
              await signout(false)
            }
          } else {
            await signout(false)
          }
        } else {
          await setVisible(true)
        }
      } catch (err) {
        console.error(err)
        await signout(false)
      }
    })()
  }, [router]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleOnChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleOnPasswordKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLElement>) => {
    try {
      e.preventDefault()

      const data: wexcommerceTypes.SignInPayload = {
        email,
        password,
        stayConnected: (await UserService.getStayConnected()),
      }

      const res = await UserService.signin(data)

      if (res.status === 200) {
        const fromCheckout = searchParams.has('from') && searchParams.get('from') === 'checkout'
        if (fromCheckout) {
          router.push(`/checkout`)
        } else {
          const o = searchParams.get('o')
          if (o) {
            router.push(`/orders?o=${o}`)
          } else {
            router.push('/')
          }
        }



      } else {
        setError(true)
      }
    } catch (err) {
      console.error(err)
      setError(true)
    }
  }

  return visible && (
    <div className={styles.signin}>
      <Paper className={styles.signinForm} elevation={10}>
        <form onSubmit={handleSubmit}>
          <h1 className={styles.signinFormTitle}>{strings.SIGN_IN_HEADING}</h1>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>{commonStrings.EMAIL}</InputLabel>
            <OutlinedInput
              type="text"
              label={commonStrings.EMAIL}
              onChange={handleOnChangeEmail}
              autoComplete="email"
              size="small"
              required
            />
          </FormControl>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>{commonStrings.PASSWORD}</InputLabel>
            <OutlinedInput
              label={commonStrings.PASSWORD}
              onChange={handleOnChangePassword}
              onKeyDown={handleOnPasswordKeyDown}
              autoComplete="password"
              type="password"
              size="small"
              required
            />
          </FormControl>

          <div className={styles.stayConnected}>
            <input type='checkbox' onChange={async (e) => {
              await UserService.setStayConnected(e.currentTarget.checked)
            }} />
            <label onClick={async (e) => {
              const checkbox = e.currentTarget.previousSibling as HTMLInputElement
              const checked = !checkbox.checked
              checkbox.checked = checked
              await UserService.setStayConnected(checked)
            }}>{strings.STAY_CONNECTED}</label>
          </div>

          <div className={styles.resetPassword}>
            <Link href='/forgot-password'>{strings.RESET_PASSWORD}</Link>
          </div>

          <SocialLogin />

          <div className={styles.signinButtons}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                router.push('/sign-up')
              }}
              className='btn-secondary btn-margin btn-margin-bottom'
            >
              {strings.SIGN_UP}
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
              className='btn-primary btn-margin btn-margin-bottom'
            >
              {strings.SIGN_IN}
            </Button>
          </div>
          <div className={styles.formError}>
            {error && <Error message={strings.ERROR_IN_SIGN_IN} />}
          </div>
        </form>
      </Paper>
    </div>)
}

export default SignIn
