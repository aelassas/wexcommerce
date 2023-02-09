import React, { useEffect, useState } from 'react'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/sign-in'
import * as UserService from '../services/UserService'
import Header from '../components/Header'
import Error from '../components/Error'
import {
    Paper,
    FormControl,
    InputLabel,
    Input,
    Button
} from '@mui/material'
import * as Helper from '../common/Helper'
import { useRouter } from "next/router"
import Link from 'next/link'
import * as SettingService from '../services/SettingService'

import styles from '../styles/signin.module.css'

const SignIn = ({ _language }) => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [visible, setVisible] = useState(false)
    const [stayConnected, setStayConnected] = useState(false)

    useEffect(() => {
        if (_language) {
            Helper.setLanguage(commonStrings, _language)
            Helper.setLanguage(strings, _language)
        }
    }, [_language])

    useEffect(() => {
        (async function () {
            try {
                const currentUser = UserService.getCurrentUser()

                if (currentUser) {
                    const status = await UserService.validateAccessToken()

                    if (status === 200) {
                        const user = await UserService.getUser(currentUser.id)
                        if (user) {
                            router.replace('/')
                        } else {
                            UserService.signout()
                        }
                    }
                } else {
                    setVisible(true)
                }
            } catch (err) {
                UserService.signout()
            }
        })()
    }, [router])

    const handleOnChangeEmail = (e) => {
        setEmail(e.target.value)
    }

    const handleOnChangePassword = (e) => {
        setPassword(e.target.value)
    }

    const handleOnPasswordKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e)
        }
    }

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()

            const data = { email, password, stayConnected }

            const res = await UserService.signin(data)

            if (res.status === 200) {
                if (router.query.o) {
                    router.replace(`/?o=${router.query.o}`)
                } else {
                    router.replace('/')
                }
            } else {
                setError(true)
            }
        }
        catch (err) {
            setError(true)
        }
    }

    return (
        _language &&
        <div>
            <Header language={_language} />
            {visible &&
                <div className={styles.signin}>
                    <Paper className={styles.signinForm} elevation={10}>
                        <form onSubmit={handleSubmit}>
                            <h1 className={styles.signinFormTitle}>{strings.SIGN_IN_HEADING}</h1>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>{commonStrings.EMAIL}</InputLabel>
                                <Input
                                    type="text"
                                    onChange={handleOnChangeEmail}
                                    autoComplete="email"
                                    required
                                />
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>{commonStrings.PASSWORD}</InputLabel>
                                <Input
                                    onChange={handleOnChangePassword}
                                    onKeyDown={handleOnPasswordKeyDown}
                                    autoComplete="password"
                                    type="password"
                                    required
                                />
                            </FormControl>

                            <div className={styles.stayConnected}>
                                <input type='checkbox' onChange={(e) => {
                                    setStayConnected(e.currentTarget.checked)
                                }} />
                                <label onClick={(e) => {
                                    const checkbox = e.currentTarget.previousSibling
                                    const checked = !checkbox.checked
                                    checkbox.checked = checked
                                    setStayConnected(checked)
                                }}>{strings.STAY_CONNECTED}</label>
                            </div>

                            <div className={styles.resetPassword}>
                                <Link href='/forgot-password'>{strings.RESET_PASSWORD}</Link>
                            </div>

                            <div className={styles.signinButtons}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="small"
                                    className='btn-primary btn-margin btn-margin-bottom'
                                >
                                    {strings.SIGN_IN}
                                </Button>
                            </div>
                            <div className={styles.formError}>
                                {error && <Error message={strings.ERROR_IN_SIGN_IN} />}
                            </div>
                        </form>
                    </Paper>
                </div>}
        </div>
    )
}

export async function getServerSideProps(context) {

    const _language = await SettingService.getLanguage()

    return {
        props: {
            _language
        }
    }
}

export default SignIn