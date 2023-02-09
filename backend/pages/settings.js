import { useEffect, useState } from 'react'
import * as UserService from '../services/UserService'
import * as PaymentTypeService from '../services/PaymentTypeService'
import Header from '../components/Header'
import { strings } from '../lang/settings'
import { strings as commonStrings } from '../lang/common'
import { strings as masterStrings } from '../lang/master'
import { strings as headerStrings } from '../lang/header'
import * as Helper from '../common/Helper'
import { useRouter } from 'next/router'
import {
  Input,
  InputLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  Button,
  Paper,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import validator from 'validator'
import Env from '../config/env.config'
import * as SettingService from '../services/SettingService'
import * as DeliveryTypeService from '../services/DeliveryTypeService'

import styles from '../styles/settings.module.css'

const Settings = ({ _user, _signout, _deliveryTypes, _paymentTypes, _settings }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(true)
  const [address, setAddress] = useState('')
  const [deliveryTypes, setDeliveryTypes] = useState([])
  const [deliveryTypesWarning, setDeliveryTypesWarning] = useState(false)
  const [paymentTypes, setPaymentTypes] = useState([])
  const [paymentTypesWarning, setPaymentTypesWarning] = useState(false)
  const [wireTransferWarning, setWireTransferWarning] = useState(false)

  const [language, setLanguage] = useState('')
  const [currency, setCurrency] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [rib, setRib] = useState('')
  const [iban, setIban] = useState('')

  useEffect(() => {
    if (_settings) {
      Helper.setLanguage(strings, _settings.language)
      Helper.setLanguage(commonStrings, _settings.language)
      Helper.setLanguage(masterStrings, _settings.language)
      Helper.setLanguage(headerStrings, _settings.language)

      setLanguage(_settings.language)
      setCurrency(_settings.currency)
      setBankName(_settings.bankName || '')
      setAccountHolder(_settings.accountHolder || '')
      setRib(_settings.rib || '')
      setIban(_settings.iban || '')
    }
  }, [_settings])

  useEffect(() => {
    if (_user) {
      setLoading(false)
      setFullName(_user.fullName)
      setPhone(_user.phone || '')
      setAddress(_user.address || '')
    }
  }, [_user])

  useEffect(() => {
    if (_signout) {
      UserService.signout()
    }
  }, [_signout])

  useEffect(() => {
    if (_paymentTypes && _paymentTypes.length > 0) {
      setPaymentTypes(_paymentTypes)
    }
  }, [_paymentTypes])

  useEffect(() => {
    if (_deliveryTypes && _deliveryTypes.length > 0) {
      setDeliveryTypes(_deliveryTypes)
    }
  }, [_deliveryTypes])

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

  const validatePhone = (phone) => {
    if (phone) {
      const phoneValid = validator.isMobilePhone(phone)
      setPhoneValid(phoneValid)

      return phoneValid
    } else {
      setPhoneValid(true)

      return true
    }
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()

    try {
      const phoneValid = await validatePhone(phone)
      if (!phoneValid) {
        return
      }

      const payload = { _id: _user._id, fullName, phone, address }
      const status = await UserService.updateUser(payload)

      if (status === 200) {
        Helper.info(commonStrings.UPDATED)
      } else {
        Helper.error()
      }
    }
    catch (err) {
      UserService.signout()
    }
  }

  const handleLocaleSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = { language, currency }

      const status = await SettingService.updateSettings(data)

      if (status === 200) {
        if (_settings.language !== language) {
          router.reload()
        } else {
          Helper.info(commonStrings.UPDATED)
        }
      } else {
        Helper.error()
      }
    }
    catch (err) {
      UserService.signout()
    }
  }

  const handlePaymentTypesSubmit = async (e) => {
    e.preventDefault()

    try {

      const count = paymentTypes.filter(pt => pt.enabled).length

      if (count > 0) {

        const index = paymentTypes.findIndex(pt => pt.enabled && pt.name === Env.PAYMENT_TYPE.WIRE_TRANSFER)

        if (index > -1) {
          const setting = await SettingService.getSettings()

          if (!setting.bankName || !setting.accountHolder || !setting.rib || !setting.iban) {
            const _paymentTypes = Helper.cloneArray(paymentTypes)
            paymentTypes[index].enabled = false
            setPaymentTypes(_paymentTypes)
            return setWireTransferWarning(true)
          }
        }

        const status = await PaymentTypeService.updatePaymentTypes(paymentTypes)

        if (status === 200) {
          Helper.info(commonStrings.UPDATED)
        } else {
          Helper.error()
        }
      } else {
        setPaymentTypesWarning(true)
      }
    }
    catch (err) {
      UserService.signout()
    }
  }

  const handleDeliveryTypesSubmit = async (e) => {
    e.preventDefault()

    try {
      const count = deliveryTypes.filter(pt => pt.enabled).length

      if (count > 0) {

        const status = await DeliveryTypeService.updateDeliveryTypes(deliveryTypes)

        if (status === 200) {
          Helper.info(commonStrings.UPDATED)
        } else {
          Helper.error()
        }
      } else {
        setDeliveryTypesWarning(true)
      }
    }
    catch (err) {
      // UserService.signout()
      console.log(err)
    }
  }

  const handleBankSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = { bankName, accountHolder, rib, iban }

      const status = await SettingService.updateBankSettings(data)

      if (status === 200) {
        Helper.info(commonStrings.UPDATED)
      } else {
        Helper.error()
      }
    }
    catch (err) {
      UserService.signout()
    }
  }

  return (
    !loading && _user && _settings &&
    <>
      <Header user={_user} language={_settings.language} />
      {
        _user.verified &&
        <div className={'content'}>
          <div className={styles.settings}>
            <Paper className={styles.form} elevation={10}>
              <form onSubmit={handleUserSubmit}>
                <h1 className={styles.formTitle}>{strings.USER_SETTINGS}</h1>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{commonStrings.FULL_NAME}</InputLabel>
                  <Input
                    type="text"
                    value={fullName}
                    required
                    onChange={(e) => {
                      setFullName(e.target.value)
                    }}
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{commonStrings.EMAIL}</InputLabel>
                  <Input
                    type="text"
                    value={_user.email}
                    disabled
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel>{commonStrings.PHONE}</InputLabel>
                  <Input
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
                    autoComplete="off"
                  />
                  <FormHelperText error={!phoneValid}>
                    {(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}
                  </FormHelperText>
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel>{commonStrings.ADDRESS}</InputLabel>
                  <Input
                    type="text"
                    onChange={(e) => {
                      setAddress(e.target.value)
                    }}
                    multiline
                    minRows={5}
                    value={address}
                  />
                </FormControl>

                <div className="buttons">
                  <Button
                    variant="contained"
                    className='btn-primary btn-margin-bottom'
                    size="small"
                    onClick={() => {
                      router.replace('/change-password')
                    }}
                  >
                    {strings.CHANGE_PASSWORD}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    className='btn-primary btn-margin-bottom'
                    size="small"
                  >
                    {commonStrings.SAVE}
                  </Button>
                  <Button
                    variant="contained"
                    className='btn-secondary btn-margin-bottom'
                    size="small"
                    onClick={() => {
                      router.replace('/')
                    }}
                  >
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </form>

            </Paper>

            <Paper className={styles.form} elevation={10}>
              <form onSubmit={handleLocaleSubmit}>
                <h1 className={styles.formTitle}>{strings.LOCALE_SETTINGS}</h1>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{strings.LANGUAGE}</InputLabel>

                  <Select
                    variant="standard"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value)
                    }}
                  >
                    {
                      Env._LANGUAGES.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code} >{lang.label}</MenuItem>
                      ))
                    }
                  </Select>

                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{strings.CURRENCY}</InputLabel>
                  <Input
                    type="text"
                    value={currency}
                    required
                    onChange={(e) => {
                      setCurrency(e.target.value)
                    }}
                    autoComplete="off"
                  />
                </FormControl>


                <div className="buttons">
                  <Button
                    type="submit"
                    variant="contained"
                    className='btn-primary btn-margin-bottom'
                    size="small"
                  >
                    {commonStrings.SAVE}
                  </Button>
                  <Button
                    variant="contained"
                    className='btn-secondary btn-margin-bottom'
                    size="small"
                    onClick={() => {
                      router.replace('/')
                    }}
                  >
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </form>
            </Paper>

            <Paper className={styles.form} elevation={10}>
              <form onSubmit={handleDeliveryTypesSubmit}>
                <h1 className={styles.formTitle}>{strings.DELIVERY_SETTINGS}</h1>

                {
                  deliveryTypes.map((deliveryType) => (
                    <FormControl key={deliveryType._id} fullWidth margin="dense">
                      <FormControlLabel
                        control={<Checkbox checked={deliveryType.enabled} />}
                        label={
                          <div className={styles.deliveryTypeControl}>
                            <span>{
                              deliveryType.name === Env.DELIVERY_TYPE.SHIPPING ? commonStrings.SHIPPING
                                : deliveryType.name === Env.DELIVERY_TYPE.WITHDRAWAL ? commonStrings.WITHDRAWAL
                                  : ''
                            }</span>
                            <div className={styles.price}>
                              <span className={styles.priceLabel}>{`${strings.PRICE} (${currency})`}</span>
                              <Input
                                className={styles.priceInput}
                                value={deliveryType.price}
                                type="number"
                                required
                                onChange={(e) => {
                                  const __deliveryTypes = Helper.cloneArray(deliveryTypes)
                                  const __deliveryType = __deliveryTypes.find(dt => dt.name === deliveryType.name)

                                  if (e.target.value) {
                                    __deliveryType.price = parseFloat(e.target.value)
                                  } else {
                                    __deliveryType.price = ''
                                  }
                                  setDeliveryTypes(__deliveryTypes)
                                }}
                              >
                              </Input>
                            </div>
                          </div>
                        }
                        onChange={(e) => {
                          const __deliveryTypes = Helper.clone(deliveryTypes)
                          __deliveryTypes.filter(pt => pt.name === deliveryType.name)[0].enabled = e.target.checked
                          setDeliveryTypes(__deliveryTypes)
                        }}
                        className={styles.deliveryType}
                      />
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
                    {commonStrings.SAVE}
                  </Button>
                  <Button
                    variant="contained"
                    className='btn-secondary btn-margin-bottom'
                    size="small"
                    onClick={() => {
                      router.replace('/')
                    }}
                  >
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </form>

            </Paper>

            <Paper className={styles.form} elevation={10}>
              <form onSubmit={handlePaymentTypesSubmit}>
                <h1 className={styles.formTitle}>{strings.PAYMENT_SETTINGS}</h1>

                {
                  paymentTypes.map((paymentType) => (
                    <FormControl key={paymentType._id} fullWidth margin="dense">
                      <FormControlLabel
                        control={<Checkbox checked={paymentType.enabled} />}
                        label={
                          paymentType.name === Env.PAYMENT_TYPE.CREDIT_CARD ? commonStrings.CREDIT_CARD
                            : paymentType.name === Env.PAYMENT_TYPE.COD ? commonStrings.COD
                              : paymentType.name === Env.PAYMENT_TYPE.WIRE_TRANSFER ? commonStrings.WIRE_TRANSFER
                                : ''
                        }
                        onChange={(e) => {
                          const __paymentTypes = Helper.clone(paymentTypes)
                          __paymentTypes.filter(pt => pt.name === paymentType.name)[0].enabled = e.target.checked
                          setPaymentTypes(__paymentTypes)
                        }}
                        className={styles.paymentType}
                      />
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
                    {commonStrings.SAVE}
                  </Button>
                  <Button
                    variant="contained"
                    className='btn-secondary btn-margin-bottom'
                    size="small"
                    onClick={() => {
                      router.replace('/')
                    }}
                  >
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </form>

            </Paper>


            <Paper className={styles.form} elevation={10}>
              <form onSubmit={handleBankSubmit}>
                <h1 className={styles.formTitle}>{strings.BANK_SETTINGS}</h1>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{strings.BANK_NAME}</InputLabel>
                  <Input
                    type="text"
                    value={bankName}
                    required
                    onChange={(e) => {
                      setBankName(e.target.value)
                    }}
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{strings.ACCOUNT_HOLDER}</InputLabel>
                  <Input
                    type="text"
                    value={accountHolder}
                    required
                    onChange={(e) => {
                      setAccountHolder(e.target.value)
                    }}
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{strings.RIB}</InputLabel>
                  <Input
                    type="text"
                    value={rib}
                    required
                    onChange={(e) => {
                      setRib(e.target.value)
                    }}
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{strings.IBAN}</InputLabel>
                  <Input
                    type="text"
                    value={iban}
                    required
                    onChange={(e) => {
                      setIban(e.target.value)
                    }}
                    autoComplete="off"
                  />
                </FormControl>

                <div className="buttons">
                  <Button
                    type="submit"
                    variant="contained"
                    className='btn-primary btn-margin-bottom'
                    size="small"
                  >
                    {commonStrings.SAVE}
                  </Button>
                  <Button
                    variant="contained"
                    className='btn-secondary btn-margin-bottom'
                    size="small"
                    onClick={() => {
                      router.replace('/')
                    }}
                  >
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </form>
            </Paper>

            <Dialog
              disableEscapeKeyDown
              maxWidth="xs"
              open={deliveryTypesWarning || paymentTypesWarning || wireTransferWarning}
            >
              <DialogTitle className='dialog-header'>{commonStrings.INFO}</DialogTitle>
              <DialogContent>
                {
                  deliveryTypesWarning ? strings.DELIVERY_SETTINGS_WARNING
                    : paymentTypesWarning ? strings.PAYMENT_SETTINGS_WARNING
                      : wireTransferWarning ? strings.WIRE_TRANSFER_WARNING
                        : ''
                }
              </DialogContent>
              <DialogActions className='dialog-actions'>
                <Button onClick={() => {
                  if (deliveryTypesWarning) setDeliveryTypesWarning(false)
                  if (paymentTypesWarning) setPaymentTypesWarning(false)
                  if (wireTransferWarning) setWireTransferWarning(false)
                }} variant='contained' className='btn-secondary'>{commonStrings.CLOSE}</Button>
              </DialogActions>
            </Dialog>
          </div>
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
  let _user = null, _signout = false, _deliveryTypes = [],
    _paymentTypes = [], _settings = null

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
          _settings = await SettingService.getSettings(context)
          _deliveryTypes = await DeliveryTypeService.getDeliveryTypes(context)
          _paymentTypes = await PaymentTypeService.getPaymentTypes(context)
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
      _deliveryTypes,
      _paymentTypes,
      _settings
    }
  }
}

export default Settings
