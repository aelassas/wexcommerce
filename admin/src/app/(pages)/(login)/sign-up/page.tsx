'use client'

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/sign-up'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as UserService from '@/lib/UserService'
import Error from '@/components/Error'
import Backdrop from '@/components/SimpleBackdrop'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper
} from '@mui/material'
import validator from 'validator'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import * as helper from '@/utils/helper'
import { useRouter } from 'next/navigation'
import PasswordInput from '@/components/PasswordInput'

import styles from '@/styles/signup.module.css'

const SignUp: React.FC = () => {
  const router = useRouter()

  const { language } = useLanguageContext() as LanguageContextType
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailValid, setEmailValid] = useState(true)

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

  if (process.env.NODE_ENV === 'production') {
    return notFound()
  }

  const handleOnChangeFullName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    if (!e.target.value) {
      setEmailError(false)
      setEmailValid(true)
    }
  }

  const validateEmail = async (email: string) => {
    if (email) {
      if (validator.isEmail(email)) {
        try {
          const status = await UserService.validateEmail({ email })
          if (status === 200) {
            setEmailError(false)
            setEmailValid(true)
            return true
          } else {
            setEmailError(true)
            setEmailValid(true)
            setError(false)
            return false
          }
        } catch (err) {
          helper.error(err)
          setError(true)
          setEmailError(false)
          setEmailValid(true)
          return false
        }
      } else {
        setEmailError(false)
        setEmailValid(false)
        return false
      }
    } else {
      setEmailError(false)
      setEmailValid(true)
      return false
    }
  }

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await validateEmail(e.target.value)
  }

  const handleOnChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleOnChangeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const emailValid = await validateEmail(email)
      if (!emailValid) {
        return
      }

      if (password.length < 6) {
        setPasswordError(true)
        setPasswordsDontMatch(false)
        setError(false)
        return
      }

      if (password !== confirmPassword) {
        setPasswordsDontMatch(true)
        setError(false)
        setPasswordError(false)
        return
      }

      setLoading(true)

      const data: wexcommerceTypes.SignUpPayload = {
        email,
        password,
        fullName,
        language: language
      }

      const status = await UserService.signup(data)

      if (status === 200) {
        const res = await UserService.signin({ email, password })

        if (res.status === 200) {
          router.push('/')
        } else {
          setError(true)
          setPasswordError(false)
          setPasswordsDontMatch(false)
          setLoading(false)
        }
      } else {
        setError(true)
        setPasswordError(false)
        setPasswordsDontMatch(false)
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setError(true)
      setPasswordError(false)
      setPasswordsDontMatch(false)
      setLoading(false)
    }
  }

  return visible && (
    <div className={styles.signup}>
      <Paper className={styles.signupForm} elevation={10}>
        <h1 className={styles.signupFormTitle}> {strings.SIGN_UP_HEADING} </h1>
        <form onSubmit={handleSubmit}>
          <div>
            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
              <Input
                type="text"
                value={fullName}
                required
                onChange={handleOnChangeFullName}
                autoComplete="off"
              />
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
              <Input
                type="text"
                error={!emailValid || emailError}
                value={email}
                onBlur={handleEmailBlur}
                onChange={handleEmailChange}
                required
                autoComplete="off"
              />
              <FormHelperText error={!emailValid || emailError}>
                {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                {(emailError && commonStrings.EMAIL_ALREADY_REGISTERED) || ''}
              </FormHelperText>
            </FormControl>

            <PasswordInput
              label={commonStrings.PASSWORD}
              value={password}
              variant="outlined"
              onChange={handleOnChangePassword}
              required
              inputProps={{
                autoComplete: 'new-password',
                form: {
                  autoComplete: 'off',
                },
              }}
              size="small"
            />

            <PasswordInput
              label={commonStrings.CONFIRM_PASSWORD}
              value={confirmPassword}
              variant="outlined"
              onChange={handleOnChangeConfirmPassword}
              required
              inputProps={{
                autoComplete: 'new-password',
                form: {
                  autoComplete: 'off',
                },
              }}
              size="small"
            />

            <div className="buttons">
              <Button
                type="submit"
                variant="contained"
                className="btn-primary btn-margin-bottom"
                size="small"
              >
                {strings.SIGN_UP}
              </Button>
              <Button
                variant="contained"
                className="btn-secondary btn-margin-bottom"
                size="small"
                onClick={() => {
                  router.push('/')
                }}> {commonStrings.CANCEL}
              </Button>
            </div>
          </div>
          <div className="form-error">
            {passwordError && <Error message={commonStrings.PASSWORD_ERROR} />}
            {passwordsDontMatch && <Error message={commonStrings.PASSWORDS_DONT_MATCH} />}
            {error && <Error message={strings.SIGN_UP_ERROR} />}
          </div>
        </form>
      </Paper>

      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </div>
  )
}

export default SignUp
