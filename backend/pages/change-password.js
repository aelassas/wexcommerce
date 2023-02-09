import { useEffect, useState } from 'react'
import * as UserService from '../services/UserService'
import Header from '../components/Header'
import { strings } from '../lang/change-password'
import { strings as commonStrings } from '../lang/common'
import { strings as masterStrings } from '../lang/master'
import { strings as headerStrings } from '../lang/header'
import * as Helper from '../common/Helper'
import { useRouter } from 'next/router'
import {
  Input,
  InputLabel,
  FormControl,
  Button,
  Paper,
  FormHelperText
} from '@mui/material'
import * as SettingService from '../services/SettingService'

import styles from '../styles/change-password.module.css'

const ChangePassword = ({ _user, _signout, _language }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState(false)
  const [passwordLengthError, setPasswordLengthError] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState(false)

  useEffect(() => {
    if (_language) {
      Helper.setLanguage(strings, _language)
      Helper.setLanguage(commonStrings, _language)
      Helper.setLanguage(masterStrings, _language)
      Helper.setLanguage(headerStrings, _language)
    }
  }, [_language])

  useEffect(() => {
    if (_user) {
      setLoading(false)
    }
  }, [_user])

  useEffect(() => {
    if (_signout) {
      UserService.signout(false, true)
    }
  }, [_signout])

  const handleResend = async (e) => {
    try {
      e.preventDefault()
      const data = { email: _user.email }

      const status = await UserService.resendLink(data)

      if (status === 200) {
        Helper.info(masterStrings.VALIDATION_EMAIL_SENT)
      } else {
        Helper.error(masterStrings.VALIDATION_EMAIL_ERROR)
      }

    } catch (err) {
      Helper.error(masterStrings.VALIDATION_EMAIL_ERROR)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      let status = await UserService.checkPassword(_user._id, currentPassword)

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

      const payload = {
        _id: _user._id,
        password: currentPassword,
        newPassword,
        strict: true
      }

      status = await UserService.changePassword(payload)

      if (status === 200) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        Helper.info(strings.PASSWORD_UPDATE)
      } else {
        Helper.error()
      }
    }
    catch (err) {
      UserService.signout()
    }
  }

  return (
    !loading && _user && _language &&
    <>
      <Header user={_user} language={_language} />
      {
        _user.verified &&
        <div className={styles.content}>
          <Paper className={styles.form} elevation={10}>
            <form onSubmit={handleSubmit}>
              <h1 className={styles.formTitle}>{strings.CHANGE_PASSWORD_HEADING}</h1>
              <FormControl fullWidth margin="dense">
                <InputLabel
                  error={currentPasswordError}
                  className='required'
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
                  type='password'
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
                <InputLabel className='required'>
                  {strings.NEW_PASSWORD}
                </InputLabel>
                <Input
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordLengthError(false)
                    setConfirmPasswordError(false)
                  }}
                  type='password'
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
                  className='required'
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
                  type='password'
                  value={confirmPassword}
                  required
                />
                <FormHelperText
                  error={confirmPasswordError}
                >
                  {confirmPasswordError && commonStrings.PASSWORDS_DONT_MATCH}
                </FormHelperText>
              </FormControl>
              <div className='buttons'>
                <Button
                  type="submit"
                  className='btn-primary btn-margin btn-margin-bottom'
                  size="small"
                  variant='contained'
                >
                  {commonStrings.RESET_PASSWORD}
                </Button>
                <Button
                  className='btn-secondary btn-margin-bottom'
                  size="small"
                  variant='contained'
                  onClick={() => {
                    router.replace('/')
                  }}
                >
                  {commonStrings.CANCEL}
                </Button>
              </div>
            </form>

          </Paper>
        </div>
      }

      {
        !_user.verified &&
        <div className="validate-email">
          <span>{masterStrings.VALIDATE_EMAIL}</span>
          <Button
            type="button"
            variant="contained"
            size="small"
            className="btn-primary btn-resend"
            onClick={handleResend}
          >{masterStrings.RESEND}</Button>
        </div>
      }
    </>
  )
}

export async function getServerSideProps(context) {
  let _user = null, _signout = false, _language = ''

  try {
    const currentUser = UserService.getCurrentUser(context)

    if (currentUser) {
      let status
      try {
        status = await UserService.validateAccessToken(context)
      } catch (err) {
        console.log('Unauthorized!')
      }

      if (status === 200) {
        _user = await UserService.getUser(context, currentUser.id)

        if (_user) {
          _language = await SettingService.getLanguage()
        } else {
          _signout = true
        }
      } else {
        _signout = true
      }
    } else {
      _signout = true
    }
  } catch (err) {
    console.log(err)
    _signout = true
  }

  return {
    props: {
      _user,
      _signout,
      _language
    }
  }
}

export default ChangePassword
