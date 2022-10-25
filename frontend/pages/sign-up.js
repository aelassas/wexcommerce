import React, { useState, useEffect } from 'react';
import { strings as commonStrings } from '../lang/common';
import { strings } from '../lang/sign-up';
import UserService from '../services/UserService';
import Error from '../components/Error';
import Backdrop from '../components/SimpleBackdrop';
import {
    Input,
    InputLabel,
    FormControl,
    FormHelperText,
    Button,
    Paper
} from '@mui/material';
import validator from 'validator';
import * as Helper from '../common/Helper';
import Env from '../config/env.config';
import { useRouter } from "next/router";
import Header from '../components/Header';

import styles from '../styles/signup.module.css';

export default function SignUp() {
    const router = useRouter();

    const [language, setLanguage] = useState(Env.DEFAULT_LANGUAGE)
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [passwordsDontMatch, setPasswordsDontMatch] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(true);
    const [phone, setPhone] = useState('');
    const [phoneValid, setPhoneValid] = useState(true);
    const [address, setAddress] = useState('');

    useEffect(() => {
        Helper.setLanguage(commonStrings);
        Helper.setLanguage(strings);
    }, []);

    useEffect(() => {
        const currentUser = UserService.getCurrentUser();

        if (currentUser) {
            router.replace('/');
        } else {
            setVisible(true);
            setLanguage(UserService.getLanguage());
        }
    }, [router]);

    const handleOnChangeFullName = (e) => {
        setFullName(e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);

        if (!e.target.value) {
            setEmailError(false);
            setEmailValid(true);
        }
    };

    const validateEmail = async (email) => {
        if (email) {
            if (validator.isEmail(email)) {
                try {
                    const status = await UserService.validateEmail({ email });
                    if (status === 200) {
                        setEmailError(false);
                        setEmailValid(true);
                        return true;
                    } else {
                        setEmailError(true);
                        setEmailValid(true);
                        setError(false);
                        return false;
                    }
                } catch (err) {
                    Helper.error();
                    setError(true);
                    setEmailError(false);
                    setEmailValid(true);
                    return false;
                }
            } else {
                setEmailError(false);
                setEmailValid(false);
                return false;
            }
        } else {
            setEmailError(false);
            setEmailValid(true);
            return false;
        }
    };

    const handleEmailBlur = async (e) => {
        await validateEmail(e.target.value);
    };

    const handleOnChangePassword = (e) => {
        setPassword(e.target.value);
    };

    const handleOnChangeConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
    };

    const validatePhone = (phone) => {
        if (phone) {
            const phoneValid = validator.isMobilePhone(phone);
            setPhoneValid(phoneValid);

            return phoneValid;
        } else {
            setPhoneValid(true);

            return true;
        }
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();

            const emailValid = await validateEmail(email);
            if (!emailValid) {
                return;
            }

            const phoneValid = await validatePhone(phone);
            if (!phoneValid) {
                return;
            }

            if (password.length < 6) {
                setPasswordError(true);
                setPasswordsDontMatch(false);
                setError(false);
                return;
            }

            if (password !== confirmPassword) {
                setPasswordsDontMatch(true);
                setError(false);
                setPasswordError(false);
                return;
            }

            setLoading(true);

            const data = {
                email,
                phone,
                address,
                password,
                fullName,
                language
            };

            const status = await UserService.signup(data);

            if (status === 200) {
                const res = await UserService.signin({ email, password });

                if (res.status === 200) {
                    router.replace('/');
                } else {
                    setError(true);
                    setPasswordError(false);
                    setPasswordsDontMatch(false);
                    setLoading(false);
                }
            } else {
                setError(true);
                setPasswordError(false);
                setPasswordsDontMatch(false);
                setLoading(false);
            }


        } catch (err) {
            setError(true);
            setPasswordError(false);
            setPasswordsDontMatch(false);
            setLoading(false);
        }
    };

    return (
        visible &&
        <>
            <Header hideSearch />
            <div className='content'>
                <Paper className={styles.signupForm} elevation={10}>
                    <h1 className={styles.signupFormTitle}> {strings.SIGN_UP_HEADING} </h1>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <FormControl fullWidth margin="dense">
                                <InputLabel className='required'>{commonStrings.FULL_NAME}</InputLabel>
                                <Input
                                    type="text"
                                    label={commonStrings.FULL_NAME}
                                    value={fullName}
                                    required
                                    onChange={handleOnChangeFullName}
                                    autoComplete="off"
                                />
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel className='required'>{commonStrings.EMAIL}</InputLabel>
                                <Input
                                    type="text"
                                    label={commonStrings.EMAIL}
                                    error={!emailValid || emailError}
                                    value={email}
                                    onBlur={handleEmailBlur}
                                    onChange={handleEmailChange}
                                    required
                                    autoComplete="off"
                                />
                                <FormHelperText error={!emailValid || emailError}>
                                    {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                                    {(emailError && commonStrings.EMAIL_ALREADY_REGISTERED) || ''}
                                </FormHelperText>
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel className='required'>{commonStrings.PHONE}</InputLabel>
                                <Input
                                    type="text"
                                    label={commonStrings.PHONE}
                                    error={!phoneValid}
                                    value={phone}
                                    onBlur={(e) => {
                                        validatePhone(e.target.value);
                                    }}
                                    onChange={(e) => {
                                        setPhone(e.target.value);
                                        setPhoneValid(true);
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
                                        setAddress(e.target.value);
                                    }}
                                    required
                                    multiline
                                    minRows={3}
                                    value={address}
                                />
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel className='required'>{commonStrings.PASSWORD}</InputLabel>
                                <Input
                                    label={commonStrings.PASSWORD}
                                    value={password}
                                    onChange={handleOnChangePassword}
                                    required
                                    type="password"
                                    inputProps={{
                                        autoComplete: 'new-password',
                                        form: {
                                            autoComplete: 'off',
                                        },
                                    }}
                                />
                            </FormControl>
                            <FormControl fullWidth margin="dense">
                                <InputLabel className='required'>{commonStrings.CONFIRM_PASSWORD}</InputLabel>
                                <Input
                                    label={commonStrings.CONFIRM_PASSWORD}
                                    value={confirmPassword}
                                    onChange={handleOnChangeConfirmPassword}
                                    required
                                    type="password"
                                    inputProps={{
                                        autoComplete: 'new-password',
                                        form: {
                                            autoComplete: 'off',
                                        },
                                    }}
                                />
                            </FormControl>
                            <div className="buttons">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className='btn-primary btn-margin-bottom'
                                    size="small"
                                >
                                    {strings.SIGN_UP}
                                </Button>
                                <Button
                                    variant="contained"
                                    className='btn-secondary btn-margin-bottom'
                                    size="small"
                                    onClick={() => {
                                        router.replace('/');
                                    }}
                                >
                                    {commonStrings.CANCEL}
                                </Button>
                            </div>
                        </div>
                        <div className="form-error">
                            {passwordError && <Error message={commonStrings.PASSWORD_ERROR} />}
                            {passwordsDontMatch && <Error message={commonStrings.PASSWORDS_DONT_MATCH} />}
                            {error && <Error message={strings.SIGN_UP_ERROR} />}
                        </div>
                    </form>
                </Paper>
            </div>
            {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
        </>
    );
}