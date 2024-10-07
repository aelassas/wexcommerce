'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper
} from '@mui/material'
import validator from 'validator'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as UserService from '@/lib/UserService'
import { strings } from '@/lang/settings'
import { strings as commonStrings } from '@/lang/common'
import { strings as headerStrings } from '@/lang/header'
import * as helper from '@/common/helper'
import { UserContextType, useUserContext } from '@/context/UserContext'

import styles from '@/styles/settings.module.css'

const Settings: React.FC = () => {
  const router = useRouter()

  const { user } = useUserContext() as UserContextType
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(true)
  const [address, setAddress] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setFullName(user.fullName)
        setPhone(user.phone || '')
        setAddress(user.address || '')
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  return user && (
    <Paper className={styles.form} elevation={10}>
      <form onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>{headerStrings.SETTINGS}</h1>
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
          <InputLabel className='required'>{commonStrings.PHONE}</InputLabel>
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
            required
            autoComplete="off"
          />
          <FormHelperText error={!phoneValid}>
            {(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}
          </FormHelperText>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel className='required'>{commonStrings.ADDRESS}</InputLabel>
          <Input
            type="text"
            onChange={(e) => {
              setAddress(e.target.value)
            }}
            required
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
  )
}

export default Settings
