'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import validator from 'validator'
import {
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper
} from '@mui/material'
import * as wexcommerceTypes from ':wexcommerce-types'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/sign-up'
import * as UserService from '@/lib/UserService'
import * as helper from '@/common/helper'
import Error from '@/components/Error'
import Backdrop from '@/components/SimpleBackdrop'
import SocialLogin from '@/components/SocialLogin'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { RecaptchaContextType, useRecaptchaContext } from '@/context/RecaptchaContext'

import styles from '@/styles/signup.module.css'

const SignUp: React.FC = () => {
  const router = useRouter()
  const { reCaptchaLoaded, generateReCaptchaToken } = useRecaptchaContext() as RecaptchaContextType

  const { language } = useLanguageContext() as LanguageContextType
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailValid, setEmailValid] = useState(true)
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(true)
  const [address, setAddress] = useState('')
  const [recaptchaError, setRecaptchaError] = useState(false)

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

  const validatePhone = (phone: string) => {
    if (phone) {
      const phoneValid = validator.isMobilePhone(phone)
      setPhoneValid(phoneValid)

      return phoneValid
    } else {
      setPhoneValid(true)

      return true
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()

      const emailValid = await validateEmail(email)
      if (!emailValid) {
        return
      }

      const phoneValid = await validatePhone(phone)
      if (!phoneValid) {
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

      let recaptchaToken = ''
      if (reCaptchaLoaded) {
        recaptchaToken = await generateReCaptchaToken()
        if (!(await helper.verifyReCaptcha(recaptchaToken))) {
          recaptchaToken = ''
        }
      }

      if (reCaptchaLoaded && !recaptchaToken) {
        setRecaptchaError(true)
        return
      }

      setLoading(true)

      const data: wexcommerceTypes.SignUpPayload = {
        email,
        phone,
        address,
        password,
        fullName,
        language,
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
      helper.error(err)
      setError(true)
      setPasswordError(false)
      setPasswordsDontMatch(false)
      setLoading(false)
    }
  }

  return (
    <div className={styles.signup}>
      <Paper className={styles.signupForm} elevation={10}>
        <h1 className={styles.signupFormTitle}> {strings.SIGN_UP_HEADING} </h1>
        <form onSubmit={handleSubmit}>
          <div>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel className='required'>{commonStrings.FULL_NAME}</InputLabel>
              <OutlinedInput
                type="text"
                label={commonStrings.FULL_NAME}
                value={fullName}
                required
                onChange={handleOnChangeFullName}
                autoComplete="off"
                size="small"
              />
            </FormControl>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel className='required'>{commonStrings.EMAIL}</InputLabel>
              <OutlinedInput
                type="text"
                label={commonStrings.EMAIL}
                error={!emailValid || emailError}
                value={email}
                onBlur={handleEmailBlur}
                onChange={handleEmailChange}
                required
                autoComplete="off"
                size="small"
              />
              <FormHelperText error={!emailValid || emailError}>
                {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                {(emailError && commonStrings.EMAIL_ALREADY_REGISTERED) || ''}
              </FormHelperText>
            </FormControl>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel className='required'>{commonStrings.PHONE}</InputLabel>
              <OutlinedInput
                type="text"
                label={commonStrings.PHONE}
                error={!phoneValid}
                value={phone}
                onBlur={(e) => {
                  validatePhone(e.target.value)
                }}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setPhoneValid(true)
                }}
                required
                autoComplete="off"
                size="small"
              />
              <FormHelperText error={!phoneValid}>
                {(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}
              </FormHelperText>
            </FormControl>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel className='required'>{commonStrings.ADDRESS}</InputLabel>
              <OutlinedInput
                type="text"
                label={commonStrings.ADDRESS}
                onChange={(e) => {
                  setAddress(e.target.value)
                }}
                required
                multiline
                minRows={3}
                value={address}
                size="small"
              />
            </FormControl>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel className='required'>{commonStrings.PASSWORD}</InputLabel>
              <OutlinedInput
                label={commonStrings.PASSWORD}
                value={password}
                onChange={handleOnChangePassword}
                required
                type="password"
                inputProps={{
                  autoComplete: 'new-password',
                  form: {
                    autoComplete: 'off',
                  },
                }}
                size="small"
              />
            </FormControl>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel className='required'>{commonStrings.CONFIRM_PASSWORD}</InputLabel>
              <OutlinedInput
                label={commonStrings.CONFIRM_PASSWORD}
                value={confirmPassword}
                onChange={handleOnChangeConfirmPassword}
                required
                type="password"
                inputProps={{
                  autoComplete: 'new-password',
                  form: {
                    autoComplete: 'off',
                  },
                }}
                size="small"
              />
            </FormControl>

            <SocialLogin />

            <div className="buttons">
              <Button
                type="submit"
                variant="contained"
                className='btn-primary btn-margin-bottom'
                size="small"
              >
                {strings.SIGN_UP}
              </Button>
              <Button
                variant="contained"
                className='btn-secondary btn-margin-bottom'
                size="small"
                onClick={() => {
                  router.push('/')
                }}
              >
                {commonStrings.CANCEL}
              </Button>
            </div>
          </div>
          <div className="form-error">
            {passwordError && <Error message={commonStrings.PASSWORD_ERROR} />}
            {passwordsDontMatch && <Error message={commonStrings.PASSWORDS_DONT_MATCH} />}
            {recaptchaError && <Error message={commonStrings.RECAPTCHA_ERROR} />}
            {error && <Error message={strings.SIGN_UP_ERROR} />}
          </div>
        </form>
      </Paper>

      {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
    </div>
  )
}

export default SignUp
