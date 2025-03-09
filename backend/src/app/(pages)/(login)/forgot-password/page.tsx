'use client'

import React, { useEffect, useState } from 'react'
import * as UserService from '@/lib/UserService'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/forgot-password'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
} from '@mui/material'
import validator from 'validator'
import * as helper from '@/common/helper'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import styles from '@/styles/forgot-password.module.css'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'

const ForgotPassword: React.FC = () => {
  const router = useRouter()

  const { language } = useLanguageContext() as LanguageContextType
  const [email, setEmail] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState(false)
  const [emailValid, setEmailValid] = useState(true)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const init = async () => {
      const currentUser = await UserService.getCurrentUser()

      if (currentUser) {
        router.push('/orders')
      } else {
        setVisible(true)
      }
    }

    if (language) {
      init()
    }
  }, [language, router])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    if (!e.target.value) {

      setError(false)
      setEmailValid(true)
    }
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const validateEmail = async (email: string) => {
    if (email) {
      if (validator.isEmail(email)) {
        try {
          const status = await UserService.validateEmail({ email })

          if (status === 200) { // user not found (error)
            setError(true)
            setEmailValid(true)
            return false
          } else {
            setError(false)
            setEmailValid(true)
            return true
          }
        } catch (err) {
          helper.error(err)
          setError(true)
          setEmailValid(true)
          return false
        }
      } else {
        setError(false)
        setEmailValid(false)
        return false
      }
    } else {

      setError(false)
      setEmailValid(true)
      return false
    }
  }

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await validateEmail(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLElement>) => {
    try {
      e.preventDefault()

      const emailValid = await validateEmail(email)
      if (!emailValid) {
        return
      }

      const isAdmin = (await UserService.isAdmin(email)) === 200
      if (!isAdmin) {
        setError(true)
        return
      }

      const status = await UserService.resend(email, true)

      if (status === 200) {
        setError(false)
        setEmailValid(true)
        setSent(true)
      } else {
        setError(true)
        setEmailValid(true)
      }
    } catch (err) {
      console.error(err)
      setError(true)
      setEmailValid(true)
    }
  }

  return (
    visible && (
      <>
        <div className={styles.forgotPassword}>
          <Paper className={styles.forgotPasswordForm} elevation={10}>
            <h1 className={styles.forgotPasswordTitle}> {strings.RESET_PASSWORD_HEADING} </h1>
            {sent &&
              <div>
                <label>{strings.EMAIL_SENT}</label>
                <p>
                  <Link href="/">
                    {commonStrings.GO_TO_HOME}
                  </Link>
                </p>
              </div>}
            {!sent &&
              <form onSubmit={handleSubmit}>
                <label>{strings.RESET_PASSWORD}</label>
                <FormControl fullWidth margin="dense">
                  <InputLabel className="required">
                    {commonStrings.EMAIL}
                  </InputLabel>
                  <Input
                    onChange={handleEmailChange}
                    onKeyDown={handleEmailKeyDown}
                    onBlur={handleEmailBlur}
                    type="text"
                    error={error || !emailValid}
                    autoComplete="off"
                    required
                  />
                  <FormHelperText error={error || !emailValid}>
                    {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                    {(error && strings.EMAIL_ERROR) || ''}
                  </FormHelperText>
                </FormControl>

                <div className="buttons">
                  <Button
                    type="submit"
                    className="btn-primary btn-margin btn-margin-bottom"
                    size="small"
                    variant="contained"
                  >
                    {strings.RESET}
                  </Button>
                  <Button
                    className="btn-secondary btn-margin-bottom"
                    size="small"
                    variant="contained"
                    onClick={() => {
                      router.push('/')
                    }}
                  >
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </form>
            }
          </Paper>
        </div>
      </>
    )
  )
}

export default ForgotPassword
