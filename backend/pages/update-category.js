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
import { strings } from '../lang/update-category'
import { strings as ccStrings } from '../lang/create-category'
import { strings as commonStrings } from '../lang/common'
import { strings as masterStrings } from '../lang/master'
import * as Helper from '../common/Helper'
import Env from '../config/env.config'
import * as CategoryService from '../services/CategoryService'
import NoMatch from '../components/NoMatch'
import { useRouter } from 'next/router'
import * as SettingService from '../services/SettingService'

import styles from '../styles/update-category.module.css'

const UpdateCategory = ({ _user, _signout, _noMatch, _category, _language }) => {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState([])
  const [valueErrors, setValueErrors] = useState([])
  const [valueChanged, setValueChanged] = useState(false)

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
      Helper.setLanguage(ccStrings, _language)
      Helper.setLanguage(commonStrings, _language)
      Helper.setLanguage(masterStrings, _language)
    }
  }, [_language])

  useEffect(() => {
    if (_category) {
      Env._LANGUAGES.forEach(lang => {
        if (!_category.values.some(value => value.language === lang.code)) {
          _category.values.push({ language: lang.code, value: '' })
        }
      })

      const _values = _category.values.map(value => ({ language: value.language, value: value.value }))
      setValues(_values)

      const _valueErrors = _category.values.map(value => false)
      setValueErrors(_valueErrors)
    }
  }, [_category])

  useEffect(() => {
    const checkValue = () => {
      let _valueChanged = false
      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        if (value.value !== _category.values[i].value) {
          _valueChanged = true
          break
        }
      }

      setValueChanged(_valueChanged)
      return _valueChanged
    }

    checkValue()
  }, [_category, values])

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
        if (value.value !== _category.values[i].value) {
          const _isValid = (await CategoryService.validate(value)) === 200
          isValid = isValid && _isValid
          if (!_isValid) valueErrors[i] = true
        }
      }

      setValueErrors(Helper.cloneArray(valueErrors))

      if (isValid) {
        const status = await CategoryService.update(_category._id, values)

        if (status === 200) {
          for (let i = 0; i < values.length; i++) {
            const value = values[i]
            _category.values[i].value = value.value
          }
          Helper.info(strings.CATEGORY_UPDATED)
          setValueChanged(false)
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
          {_category &&
            <Paper className={styles.form} elevation={10}>
              <h1 className={styles.formTitle}> {strings.UPDATE_CATEGORY_HEADING} </h1>
              <form onSubmit={handleSubmit}>
                {
                  _category.values.map((value, index) => (
                    <FormControl key={index} fullWidth margin="dense">
                      <InputLabel className='required'>{Env._LANGUAGES.filter(l => l.code === value.language)[0].label}</InputLabel>
                      <Input
                        type="text"
                        value={(values[index] && values[index].value) || ''}
                        error={valueErrors[index]}
                        required
                        onChange={(e) => {
                          valueErrors[index] = false
                          values[index].value = e.target.value
                          setValues(Helper.cloneArray(values))
                          setValueErrors(Helper.cloneArray(valueErrors))
                        }}
                        autoComplete="off"
                      />
                      <FormHelperText error={valueErrors[index]}>
                        {(valueErrors[index] && ccStrings.INVALID_CATEGORY) || ''}
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
                  // disabled={!valueChanged}
                  >
                    {commonStrings.SAVE}
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
          }

          {_noMatch && <NoMatch language={_language} />}
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
  let _user = null, _signout = false, _noMatch = false, _category = null, _language = ''

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
        _language = await SettingService.getLanguage()

        if (_user) {
          const { c: categoryId } = context.query
          if (categoryId) {
            try {
              _category = await CategoryService.getCategory(context, _language, categoryId)

              if (!_category) {
                _noMatch = true
              }
            } catch (err) {
              console.log(err)
              _noMatch = true
            }
          } else {
            _noMatch = true
          }
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
      _noMatch,
      _category,
      _language
    }
  }
}

export default UpdateCategory
