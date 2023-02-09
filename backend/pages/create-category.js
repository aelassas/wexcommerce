import { useEffect, useState } from 'react'
import * as UserService from '../services/UserService'
import Header from '../components/Header'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper
} from '@mui/material'
import { strings } from '../lang/create-category'
import { strings as commonStrings } from '../lang/common'
import { strings as masterStrings } from '../lang/master'
import * as Helper from '../common/Helper'
import * as CategoryService from '../services/CategoryService'
import Env from '../config/env.config'
import { useRouter } from 'next/router'
import * as SettingService from '../services/SettingService'

import styles from '../styles/create-category.module.css'

const CreateCategory = ({ _user, _signout, _language }) => {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState([])
  const [valueErrors, setValueErrors] = useState([])

  useEffect(() => {
    if (_user) {
      setLoading(false)
    }
  }, [_user])

  useEffect(() => {
    if (_signout) {
      UserService.signout()
    }
  }, [_signout])

  useEffect(() => {
    if (_language) {
      Helper.setLanguage(strings, _language)
      Helper.setLanguage(commonStrings, _language)
      Helper.setLanguage(masterStrings, _language)
    }
  }, [_language])

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
      let isValid = true

      for (let i = 0; i < valueErrors.length; i++) valueErrors[i] = false

      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        const _isValid = (await CategoryService.validate(value)) === 200
        isValid = isValid && _isValid
        if (!_isValid) valueErrors[i] = true
      }

      setValueErrors(Helper.cloneArray(valueErrors))

      if (isValid) {
        const status = await CategoryService.create(values)

        if (status === 200) {
          for (let i = 0; i < values.length; i++) values[i].value = ''
          setValues(Helper.cloneArray(values))
          Helper.info(strings.CATEGORY_CREATED)
        } else {
          Helper.error()
        }
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
        <div className={'content'}>
          <Paper className={styles.form} elevation={10}>
            <h1 className={styles.formTitle}> {strings.NEW_CATEGORY_HEADING} </h1>
            <form onSubmit={handleSubmit}>
              {
                Env._LANGUAGES.map((language, index) => (
                  <FormControl key={index} fullWidth margin="dense">
                    <InputLabel className='required'>{language.label}</InputLabel>
                    <Input
                      type="text"
                      value={(values[index] && values[index].value) || ''}
                      error={valueErrors[index]}
                      required
                      onChange={(e) => {
                        values[index] = { language: language.code, value: e.target.value }
                        valueErrors[index] = false
                        setValues(Helper.cloneArray(values))
                        setValueErrors(Helper.cloneArray(valueErrors))
                      }}
                      autoComplete="off"
                    />
                    <FormHelperText error={valueErrors[index]}>
                      {(valueErrors[index] && strings.INVALID_CATEGORY) || ''}
                    </FormHelperText>
                  </FormControl>
                ))
              }

              <div className="buttons">
                <Button
                  type="submit"
                  variant="contained"
                  className='btn-primary btn-margin-bottom'
                  size="small"
                >
                  {commonStrings.CREATE}
                </Button>
                <Button
                  variant="contained"
                  className='btn-secondary btn-margin-bottom'
                  size="small"
                  onClick={() => {
                    router.replace('/categories')
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

export default CreateCategory