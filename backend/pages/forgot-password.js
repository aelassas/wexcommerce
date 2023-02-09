import React, { useEffect, useState } from 'react'
import * as UserService from '../services/UserService'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/forgot-password'
import {
    Input,
    InputLabel,
    FormControl,
    FormHelperText,
    Button,
    Paper,
} from '@mui/material'
import validator from 'validator'
import * as Helper from '../common/Helper'
import Header from '../components/Header'
import { useRouter } from "next/router"
import Link from 'next/link'
import * as SettingService from '../services/SettingService'

import styles from '../styles/forgot-password.module.css'

const ForgotPassword = ({ _language }) => {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [visible, setVisible] = useState(false)
    const [error, setError] = useState(false)
    const [emailValid, setEmailValid] = useState(true)
    const [sent, setSent] = useState(false)

    useEffect(() => {
        if (_language) {
            Helper.setLanguage(commonStrings, _language)
            Helper.setLanguage(strings, _language)
        }
    }, [_language])

    useEffect(() => {
        const currentUser = UserService.getCurrentUser()

        if (currentUser) {
            router.replace('/')
        } else {
            setVisible(true)
        }
    }, [router])

    const handleEmailChange = (e) => {
        setEmail(e.target.value)

        if (!e.target.value) {

            setError(false)
            setEmailValid(true)
        }
    }

    const handleEmailKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e)
        }
    }

    const validateEmail = async (email) => {
        if (email) {
            if (validator.isEmail(email)) {
                try {
                    const status = await UserService.validateEmail({ email })

                    if (status === 200) { // user not found (error)
                        setError(true)
                        setEmailValid(true)
                        return false
                    } else {
                        setError(false)
                        setEmailValid(true)
                        return true
                    }
                } catch (err) {
                    Helper.error()
                    setError(true)
                    setEmailValid(true)
                    return false
                }
            } else {
                setError(false)
                setEmailValid(false)
                return false
            }
        } else {

            setError(false)
            setEmailValid(true)
            return false
        }
    }

    const handleEmailBlur = async (e) => {
        await validateEmail(e.target.value)
    }

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()

            const emailValid = await validateEmail(email)
            if (!emailValid) {
                return
            }

            const isAdmin = (await UserService.isAdmin({ email })) === 200
            if (!isAdmin) {
                setError(true)
                return
            }

            const status = await UserService.resend(email, true)

            if (status === 200) {
                setError(false)
                setEmailValid(true)
                setSent(true)
            } else {
                setError(true)
                setEmailValid(true)
            }
        } catch (err) {
            setError(true)
            setEmailValid(true)
        }
    }

    return (
        visible && _language &&
        <>
            <Header language={_language} />
            <div className='content'>
                <div className={styles.forgotPassword}>
                    <Paper className={styles.forgotPasswordForm} elevation={10}>
                        <h1 className={styles.forgotPasswordTitle}> {strings.RESET_PASSWORD_HEADING} </h1>
                        {sent &&
                            <div>
                                <label>{strings.EMAIL_SENT}</label>
                                <p>
                                    <Link href='/'>
                                        {commonStrings.GO_TO_HOME}
                                    </Link>
                                </p>
                            </div>}
                        {!sent &&
                            <form onSubmit={handleSubmit}>
                                <label>{strings.RESET_PASSWORD}</label>
                                <FormControl fullWidth margin="dense">
                                    <InputLabel className='required'>
                                        {commonStrings.EMAIL}
                                    </InputLabel>
                                    <Input
                                        onChange={handleEmailChange}
                                        onKeyDown={handleEmailKeyDown}
                                        onBlur={handleEmailBlur}
                                        type='text'
                                        error={error || !emailValid}
                                        autoComplete='off'
                                        required
                                    />
                                    <FormHelperText error={error || !emailValid}>
                                        {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                                        {(error && strings.EMAIL_ERROR) || ''}
                                    </FormHelperText>
                                </FormControl>

                                <div className='buttons'>
                                    <Button
                                        type="submit"
                                        className='btn-primary btn-margin btn-margin-bottom'
                                        size="small"
                                        variant='contained'
                                    >
                                        {strings.RESET}
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
                        }
                    </Paper>
                </div>
            </div>
        </>)
}

export async function getServerSideProps(context) {

    const _language = await SettingService.getLanguage()

    return {
        props: {
            _language
        }
    }
}

export default ForgotPassword