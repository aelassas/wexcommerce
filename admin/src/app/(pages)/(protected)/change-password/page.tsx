'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Input,
  InputLabel,
  FormControl,
  Button,
  Paper,
  FormHelperText
} from '@mui/material'
import * as wexcommerceTypes from ':wexcommerce-types'
import { UserContextType, useUserContext } from '@/context/UserContext'
import * as UserService from '@/lib/UserService'
import { strings } from '@/lang/change-password'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/utils/helper'

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault()

    try {
      if (!user) {
        return
      }

      let status = await UserService.checkPassword(user._id!, currentPassword)

      if (status !== 200) {
        setPasswordLengthError(false)
        setConfirmPasswordError(false)
        setCurrentPasswordError(true)
        return
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
        strict: true
      }

      status = await UserService.changePassword(payload)

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

  return user && (
    <div className={styles.content}>
      <Paper className={styles.form} elevation={10}>
        <form onSubmit={handleSubmit}>
          <h1 className={styles.formTitle}>{strings.CHANGE_PASSWORD_HEADING}</h1>
          <FormControl fullWidth margin="dense">
            <InputLabel
              error={currentPasswordError}
              className="required"
            >
              {strings.CURRENT_PASSWORD}
            </InputLabel>
            <Input
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                setCurrentPasswordError(false)
              }}
              value={currentPassword}
              error={currentPasswordError}
              type="password"
              required
            />
            <FormHelperText
              error={currentPasswordError}
            >
              {(currentPasswordError && strings.CURRENT_PASSWORD_ERROR) || ''}
            </FormHelperText>
          </FormControl>
          <FormControl
            fullWidth
            margin="dense"
          >
            <InputLabel className="required">
              {strings.NEW_PASSWORD}
            </InputLabel>
            <Input
              onChange={(e) => {
                setNewPassword(e.target.value)
                setPasswordLengthError(false)
                setConfirmPasswordError(false)
              }}
              type="password"
              value={newPassword}
              error={passwordLengthError}
              required
            />
            <FormHelperText
              error={passwordLengthError}
            >
              {(passwordLengthError && commonStrings.PASSWORD_ERROR) || ''}
            </FormHelperText>
          </FormControl>
          <FormControl
            fullWidth
            margin="dense"
            error={confirmPasswordError}
          >
            <InputLabel
              error={confirmPasswordError}
              className="required"
            >
              {commonStrings.CONFIRM_PASSWORD}
            </InputLabel>
            <Input
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
              error={confirmPasswordError}
              type="password"
              value={confirmPassword}
              required
            />
            <FormHelperText
              error={confirmPasswordError}
            >
              {confirmPasswordError && commonStrings.PASSWORDS_DONT_MATCH}
            </FormHelperText>
          </FormControl>
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

      </Paper>
    </div>
  )
}

export default ChangePassword
