'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { CurrencyContextType, useCurrencyContext } from '@/context/CurrencyContext'
import env from '@/config/env.config'
import * as UserService from '@/lib/UserService'
import * as PaymentTypeService from '@/lib/PaymentTypeService'
import * as SettingService from '@/lib/SettingService'
import * as DeliveryTypeService from '@/lib/DeliveryTypeService'
import { strings } from '@/lang/settings'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'

import styles from '@/styles/settings.module.css'

const Settings: React.FC = () => {
  const router = useRouter()

  const { user } = useUserContext() as UserContextType
  const { language, setLanguage } = useLanguageContext() as LanguageContextType
  const { currency, setCurrency } = useCurrencyContext() as CurrencyContextType
  const [stripeCurrency, setStripeCurrency] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(true)
  const [address, setAddress] = useState('')
  const [deliveryTypes, setDeliveryTypes] = useState<wexcommerceTypes.DeliveryTypeInfo[]>([])
  const [deliveryTypesWarning, setDeliveryTypesWarning] = useState(false)
  const [paymentTypes, setPaymentTypes] = useState<wexcommerceTypes.PaymentTypeInfo[]>([])
  const [paymentTypesWarning, setPaymentTypesWarning] = useState(false)
  const [wireTransferWarning, setWireTransferWarning] = useState(false)
  const [bankName, setBankName] = useState<string>()
  const [accountHolder, setAccountHolder] = useState<string>()
  const [rib, setRib] = useState<string>()
  const [iban, setIban] = useState<string>()

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const _deliveryTypes = await DeliveryTypeService.getDeliveryTypes()
        const _paymentTypes = await PaymentTypeService.getPaymentTypes()
        const settings = await SettingService.getSettings()

        setStripeCurrency(settings.stripeCurrency)
        setFullName(user.fullName)
        setPhone(user.phone || '')
        setAddress(user.address || '')
        setDeliveryTypes(_deliveryTypes)
        setPaymentTypes(_paymentTypes)
        setBankName(settings.bankName)
        setAccountHolder(settings.accountHolder)
        setRib(settings.rib)
        setIban(settings.iban)
      }
    }

    fetchData()
  }, [user])

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

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      if (!user) {
        return
      }

      const phoneValid = await validatePhone(phone)
      if (!phoneValid) {
        return
      }

      const payload: wexcommerceTypes.UpdateUserPayload = { _id: user._id!, fullName, phone, address }
      const status = await UserService.updateUser(payload)

      if (status === 200) {
        helper.info(commonStrings.UPDATED)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const handleLocaleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const data: wexcommerceTypes.UpdateSettingsPayload = {
        language,
        currency,
        stripeCurrency,
      }

      const settings = await SettingService.getSettings()
      const status = await SettingService.updateSettings(data)

      if (status === 200) {
        if (settings.language !== language) {
          window.location.reload()
        } else {
          helper.info(commonStrings.UPDATED)
        }
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }


  const handleDeliveryTypesSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const count = deliveryTypes.filter(pt => pt.enabled).length

      if (count > 0) {

        const status = await DeliveryTypeService.updateDeliveryTypes(deliveryTypes)

        if (status === 200) {
          helper.info(commonStrings.UPDATED)
        } else {
          helper.error()
        }
      } else {
        setDeliveryTypesWarning(true)
      }
    } catch (err) {
      helper.error(err)
    }
  }


  const handlePaymentTypesSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {

      const count = paymentTypes.filter(pt => pt.enabled).length

      if (count > 0) {

        const index = paymentTypes.findIndex(pt => pt.enabled && pt.name === wexcommerceTypes.PaymentType.WireTransfer)

        if (index > -1) {
          const setting = await SettingService.getSettings()

          if (!setting.bankName || !setting.accountHolder || !setting.rib || !setting.iban) {
            const _paymentTypes = wexcommerceHelper.cloneArray(paymentTypes) as wexcommerceTypes.PaymentTypeInfo[]
            paymentTypes[index].enabled = false
            setPaymentTypes(_paymentTypes)
            return setWireTransferWarning(true)
          }
        }

        const status = await PaymentTypeService.updatePaymentTypes(paymentTypes)

        if (status === 200) {
          helper.info(commonStrings.UPDATED)
        } else {
          helper.error()
        }
      } else {
        setPaymentTypesWarning(true)
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const handleBankSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const data: wexcommerceTypes.UpdateBankSettingsPayload = { bankName, accountHolder, rib, iban }

      const status = await SettingService.updateBankSettings(data)

      if (status === 200) {
        helper.info(commonStrings.UPDATED)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  return user && (
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
              value={user.email}
              disabled
              autoComplete="off"
            />
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>{commonStrings.PHONE}</InputLabel>
            <Input
              type="text"
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
                router.push('/change-password')
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
                router.push('/')
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
                env._LANGUAGES.map((lang) => (
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

          <FormControl fullWidth margin="dense">
            <InputLabel className='required'>{strings.STRIPE_CURRENCY}</InputLabel>
            <Input
              type="text"
              value={stripeCurrency}
              required
              onChange={(e) => {
                setStripeCurrency(e.target.value)
              }}
              autoComplete="off"
            />
            <a
              href="https://docs.stripe.com/currencies"
              target="_blank"
              className={styles.stripeCurrencies}
            >
              https://docs.stripe.com/currencies
            </a>
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
                router.push('/')
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
                        deliveryType.name === wexcommerceTypes.DeliveryType.Shipping ? commonStrings.SHIPPING
                          : deliveryType.name === wexcommerceTypes.DeliveryType.Withdrawal ? commonStrings.WITHDRAWAL
                            : ''
                      }</span>
                      <div className={styles.price}>
                        <span className={`${styles.priceLabel} required`}>{`${strings.PRICE} (${currency})`}</span>
                        <Input
                          className={styles.priceInput}
                          value={deliveryType.price}
                          type="number"
                          required
                          onChange={(e) => {
                            const __deliveryTypes = wexcommerceHelper.cloneArray(deliveryTypes) as wexcommerceTypes.DeliveryTypeInfo[]
                            const __deliveryType = __deliveryTypes.find(dt => dt.name === deliveryType.name)

                            if (e.target.value) {
                              __deliveryType!.price = Number.parseFloat(e.target.value)
                            } else {
                              __deliveryType!.price = ''
                            }
                            setDeliveryTypes(__deliveryTypes)
                          }}
                        >
                        </Input>
                      </div>
                    </div>
                  }
                  onChange={(e) => {
                    const __deliveryTypes = wexcommerceHelper.cloneArray(deliveryTypes) as wexcommerceTypes.DeliveryTypeInfo[]
                    __deliveryTypes.filter(pt => pt.name === deliveryType.name)[0].enabled = (e.target as HTMLInputElement).checked
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
                router.push('/')
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
                    paymentType.name === wexcommerceTypes.PaymentType.CreditCard ? commonStrings.CREDIT_CARD
                      : paymentType.name === wexcommerceTypes.PaymentType.Cod ? commonStrings.COD
                        : paymentType.name === wexcommerceTypes.PaymentType.WireTransfer ? commonStrings.WIRE_TRANSFER
                          : ''
                  }
                  onChange={(e) => {
                    const __paymentTypes = wexcommerceHelper.cloneArray(paymentTypes) as wexcommerceTypes.PaymentTypeInfo[]
                    __paymentTypes.filter(pt => pt.name === paymentType.name)[0].enabled = (e.target as HTMLInputElement).checked
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
                router.push('/')
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
            <InputLabel>{strings.BANK_NAME}</InputLabel>
            <Input
              type="text"
              value={bankName || ''}
              onChange={(e) => {
                setBankName(e.target.value || undefined)
              }}
              autoComplete="off"
            />
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>{strings.ACCOUNT_HOLDER}</InputLabel>
            <Input
              type="text"
              value={accountHolder || ''}
              onChange={(e) => {
                setAccountHolder(e.target.value || undefined)
              }}
              autoComplete="off"
            />
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>{strings.RIB}</InputLabel>
            <Input
              type="text"
              value={rib || ''}
              onChange={(e) => {
                setRib(e.target.value || undefined)
              }}
              autoComplete="off"
            />
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>{strings.IBAN}</InputLabel>
            <Input
              type="text"
              value={iban || ''}
              onChange={(e) => {
                setIban(e.target.value || undefined)
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
                router.push('/')
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
            if (deliveryTypesWarning) {
              setDeliveryTypesWarning(false)
            }
            if (paymentTypesWarning) {
              setPaymentTypesWarning(false)
            }
            if (wireTransferWarning) {
              setWireTransferWarning(false)
            }
          }} variant='contained' className='btn-secondary'>{commonStrings.CLOSE}</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Settings
