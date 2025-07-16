'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Paper,
} from '@mui/material'
import * as wexcommerceTypes from ':wexcommerce-types'
import { UserContextType, useUserContext } from '@/context/UserContext'
import * as UserService from '@/lib/UserService'
import { strings } from '@/lang/change-password'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/utils/helper'
import ScrollToTop from '@/components/ScrollToTop'
import PasswordInput from '@/components/PasswordInput'

import styles from '@/styles/change-password.module.css'

const ChangePassword: React.FC = () => {
  const router = useRouter()

  const { user } = useUserContext() as UserContextType
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState(false)
  const [passwordLengthError, setPasswordLengthError] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)

  useEffect(() => {
    (async function () {
      if (user) {
        const status = await UserService.hasPassword(user!._id!)
        setHasPassword(status === 200)
      }
    })()
  }, [user])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault()

    try {
      if (!user) {
        return
      }

      if (hasPassword) {
        let status = await UserService.checkPassword(user._id!, currentPassword)

        if (status !== 200) {
          setPasswordLengthError(false)
          setConfirmPasswordError(false)
          setCurrentPasswordError(true)
          return
        }
      }

      if (newPassword.length < 6) {
        setPasswordLengthError(true)
        setConfirmPasswordError(false)
        setCurrentPasswordError(false)
        return
      } else {
        setPasswordLengthError(false)
      }

      if (newPassword !== confirmPassword) {
        setPasswordLengthError(false)
        setConfirmPasswordError(true)
        setCurrentPasswordError(false)
        return
      } else {
        setPasswordLengthError(false)
        setConfirmPasswordError(false)
      }

      const payload: wexcommerceTypes.ChangePasswordPayload = {
        _id: user._id!,
        password: currentPassword,
        newPassword,
        strict: hasPassword,
      }

      const status = await UserService.changePassword(payload)

      if (status === 200) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        helper.info(strings.PASSWORD_UPDATE)
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

      {
        user && (
          <div className={styles.content}>
            <Paper className={styles.form} elevation={10}>
              <form onSubmit={handleSubmit}>
                <h1 className={styles.formTitle}>{strings.CHANGE_PASSWORD_HEADING}</h1>

                {hasPassword && (
                  <PasswordInput
                    label={strings.CURRENT_PASSWORD}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value)
                      setCurrentPasswordError(false)
                    }}
                    variant="outlined"
                    required
                    size="small"
                    value={currentPassword}
                    error={currentPasswordError}
                    helperText={(currentPasswordError && strings.CURRENT_PASSWORD_ERROR) || ''}
                  />
                )}

                <PasswordInput
                  label={strings.NEW_PASSWORD}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordLengthError(false)
                    setConfirmPasswordError(false)
                  }}
                  variant="outlined"
                  required
                  size="small"
                  value={newPassword}
                  error={passwordLengthError}
                  helperText={(passwordLengthError && commonStrings.PASSWORD_ERROR) || ''}
                />

                <PasswordInput
                  label={commonStrings.CONFIRM_PASSWORD}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setPasswordLengthError(false)
                    setConfirmPasswordError(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e)
                    }
                  }}

                  variant="outlined"
                  required
                  size="small"
                  value={confirmPassword}
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
                    {commonStrings.RESET_PASSWORD}
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
        )}
    </>
  )
}

export default ChangePassword
