'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import * as wexcommerceTypes from ':wexcommerce-types'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import * as UserService from '@/lib/UserService'
import { strings as commonStrings } from '@/lang/common'
import { strings as cpStrings } from '@/lang/change-password'
import { strings as fpStrings } from '@/lang/forgot-password'
import { strings as activateStrings } from '@/lang/activate'
import { strings as dashboardStrings } from '@/lang/dashboard'
import NoMatch from '@/components/NoMatch'
import {
  Button,
  Paper
} from '@mui/material'
import * as helper from '@/utils/helper'
import ScrollToTop from '@/components/ScrollToTop'
import PasswordInput from '@/components/PasswordInput'

import styles from '@/styles/reset-password.module.css'

const ResetPassword: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const { language } = useLanguageContext() as LanguageContextType
  const [resend, setResend] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState(false)
  const [passwordLengthError, setPasswordLengthError] = useState(false)

  useEffect(() => {
    const init = async () => {
      const _userId = searchParams.get('u')
      const _email = searchParams.get('e')
      const _token = searchParams.get('t')

      if (_userId && _email && _token) {
        setUserId(_userId)
        setEmail(_email)
        setToken(_token)
        const isUser = (await UserService.isUser(_email)) === 200

        if (isUser) {
          const status = await UserService.checkToken(_userId, _email, _token)

          if (status !== 200) {
            //
            // Token not valid
            //
            setResend(true)
          }
        } else {
          //
          // User not admin
          //
          setNoMatch(true)
        }
      } else {
        //
        // Search params not found
        //
        setNoMatch(true)
      }
    }

    if (language) {
      init()
    }
  }, [language, searchParams])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)

    if (!e.target.value) {
      setPasswordLengthError(true)
    }
  }

  const handlePasswordBlur = () => {
    if (password && password.length < 6) {
      setPasswordLengthError(true)
      setConfirmPasswordError(false)
    } else {
      setPasswordLengthError(false)
      setConfirmPasswordError(false)
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)

    if (!e.target.value) {
      setConfirmPasswordError(false)
    }
  }

  const handleConfirmPasswordBlur = () => {
    if (password && confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError(true)
    } else {
      setConfirmPasswordError(false)
    }
  }

  const handleConfirmPasswordKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
    try {
      e.preventDefault()

      if (password.length < 6) {
        setPasswordLengthError(true)
        setConfirmPasswordError(false)
        return
      } else {
        setConfirmPasswordError(false)
      }

      if (password !== confirmPassword) {
        setConfirmPasswordError(true)
        return
      } else {
        setConfirmPasswordError(false)
      }

      const data: wexcommerceTypes.ActivatePayload = { userId, token, password }

      const status = await UserService.activate(data)

      if (status === 200) {
        const res = await UserService.signin({ email, password })

        if (res.status === 200) {
          const status = await UserService.deleteTokens(userId)

          if (status === 200) {
            router.push('/')
          } else {
            helper.error()
          }
        } else {
          helper.error()
        }
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  return (
    <>
      <ScrollToTop />

      {resend && email &&
        <div className={styles.resend}>
          <Paper className={styles.resendForm} elevation={10}>
            <h1>{fpStrings.RESET_PASSWORD_HEADING}</h1>
            <div className={styles.resendFormContent}>
              <label>{activateStrings.TOKEN_EXPIRED}</label>
              <Button
                type="button"
                variant="contained"
                size="small"
                className={`btn-primary ${styles.btnResend}`}
                onClick={async () => {
                  try {
                    const status = await UserService.resend(email, true)

                    if (status === 200) {
                      helper.info(commonStrings.RESET_PASSWORD_EMAIL_SENT)
                    } else {
                      helper.error()
                    }
                  } catch (err) {
                    helper.error(err)
                  }
                }}
              >{dashboardStrings.RESEND}</Button>
              <p><Link href="/">{commonStrings.GO_TO_HOME}</Link></p>
            </div>
          </Paper>
        </div>
      }

      {userId && email && token && !noMatch && !resend &&
        <div className={styles.resetUserPassword}>
          <Paper className={styles.resetUserPasswordForm} elevation={10}>
            <h1>{fpStrings.RESET_PASSWORD_HEADING}</h1>
            <form onSubmit={handleSubmit}>

              <PasswordInput
                label={cpStrings.NEW_PASSWORD}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                variant="outlined"
                required
                size="small"
                error={passwordLengthError}
                helperText={(passwordLengthError && commonStrings.PASSWORD_ERROR) || ''}
              />

              <PasswordInput
                label={commonStrings.CONFIRM_PASSWORD}
                onChange={handleConfirmPasswordChange}
                onKeyDown={handleConfirmPasswordKeyDown}
                onBlur={handleConfirmPasswordBlur}
                variant="outlined"
                required
                size="small"
                error={confirmPasswordError}
                helperText={(confirmPasswordError && commonStrings.PASSWORDS_DONT_MATCH) || ''}
              />

              <div className="buttons">
                <Button
                  type="submit"
                  className="btn-primary btn-margin btn-margin-bottom"
                  size="small"
                  variant="contained"
                >
                  {commonStrings.SAVE}
                </Button>
                <Button
                  className="btn-margin-bottom"
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    router.push('/')
                  }}
                >
                  {commonStrings.CANCEL}
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      }

      {noMatch && <NoMatch />}
    </>
  )
}

export default ResetPassword
