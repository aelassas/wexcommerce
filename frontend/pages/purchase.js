import { useEffect, useState } from 'react';
import Header from '../components/Header';
import {
    Button,
    FormControl,
    InputLabel,
    Input,
    FormHelperText,
    RadioGroup,
    Radio,
    FormControlLabel
} from '@mui/material';
import {
    Lock as LockIcon,
    Person as UserIcon,
    Orders as OrdersIcon
} from '@mui/icons-material';
import { strings } from '../lang/purchase';
import { strings as commonStrings } from '../lang/common';
import { strings as masterStrings } from '../lang/master';
import { strings as headerStrings } from '../lang/header';
import * as Helper from '../common/Helper';
import NoMatch from '../components/NoMatch';
import Error from '../components/Error';
import Info from '../components/Info';
import UserService from '../services/UserService';
import CartService from '../services/CartService';
import OrderService from '../services/OrderService';
import { useRouter } from 'next/router';
import validator from 'validator';
import Image from 'next/image';
import Link from 'next/link';

import styles from '../styles/purchase.module.css';

export default function Purchase({ _user, _signout, _noMatch, _cart }) {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [emailInfo, setEmailInfo] = useState(true);
    const [emailValid, setEmailValid] = useState(true);
    const [emailRegistered, setEmailRegistered] = useState(false);

    const [cardNumber, setCardNumber] = useState('');
    const [cardNumberValid, setCardNumberValid] = useState(true);
    const [cardMonth, setCardMonth] = useState('');
    const [cardMonthValid, setCardMonthValid] = useState(true);
    const [cardYear, setCardYear] = useState('');
    const [cardYearValid, setCardYearValid] = useState(true);
    const [cvv, setCvv] = useState('');
    const [cvvValid, setCvvValid] = useState(true);
    const [cardDateError, setCardDateError] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState(false);

    useEffect(() => {
        Helper.setLanguage(strings);
        Helper.setLanguage(commonStrings);
        Helper.setLanguage(masterStrings);
    }, []);

    useEffect(() => {
        if (_signout) {
            UserService.signout(false);
        }
    }, [_signout]);

    const validateEmail = async (_email) => {
        if (_email) {
            if (validator.isEmail(_email)) {
                try {
                    const status = await UserService.validateEmail({ email: _email });

                    if (status === 200) {
                        setEmailRegistered(false);
                        setEmailValid(true);
                        setEmailInfo(true);
                        return true;
                    } else {
                        setEmailRegistered(true);
                        setEmailValid(true);
                        setEmailInfo(false);
                        return false;
                    }
                } catch (err) {
                    Helper.error();
                    setEmailRegistered(false);
                    setEmailValid(true);
                    setEmailInfo(false);
                    return false;
                }
            } else {
                setEmailRegistered(false);
                setEmailValid(false);
                setEmailInfo(false);
                return false;
            }
        } else {
            setEmailRegistered(false);
            setEmailValid(true);
            setEmailInfo(true);
            return false;
        }
    };

    const validateCardNumber = (_cardNumber) => {
        if (_cardNumber) {
            const _cardNumberValid = validator.isCreditCard(_cardNumber);
            setCardNumberValid(_cardNumberValid);

            return cardNumberValid;
        } else {
            setCardNumberValid(true);

            return true;
        }
    };

    const validateCardMonth = (_cardMonth) => {
        if (_cardMonth) {

            if (Helper.isInteger(_cardMonth)) {
                const month = parseInt(_cardMonth);
                const _cardMonthValid = month >= 1 && month <= 12;
                setCardMonthValid(_cardMonthValid);
                setCardDateError(false);

                return _cardMonthValid;
            } else {
                setCardMonthValid(false);
                setCardDateError(false);

                return false;
            }
        } else {
            setCardMonthValid(true);
            setCardDateError(false);

            return true;
        }
    };

    const validateCardYear = (_cardYear) => {
        if (_cardYear) {

            if (Helper.isYear(_cardYear)) {
                const year = parseInt(_cardYear);
                const currentYear = parseInt(new Date().getFullYear().toString().slice(2));
                const _cardYearValid = year >= currentYear;
                setCardYearValid(_cardYearValid);
                setCardDateError(false);

                return _cardYearValid;
            } else {
                setCardYearValid(false);
                setCardDateError(false);

                return false;
            }
        } else {
            setCardYearValid(true);
            setCardDateError(false);

            return true;
        }
    };

    const validateCvv = (_cvv) => {
        if (_cvv) {
            const _cvvValid = Helper.isCvv(_cvv);
            setCvvValid(_cvvValid);

            return _cvvValid;
        } else {
            setCvvValid(true);

            return true;
        }
    };

    const validateCardDate = (_cardMonth, _cardYear) => {
        const today = new Date(), cardDate = new Date();
        const y = parseInt(today.getFullYear().toString().slice(0, 2)) * 100;
        const year = y + parseInt(_cardYear);
        const month = parseInt(_cardMonth);
        cardDate.setFullYear(year, month - 1, 1);

        if (cardDate < today) {
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailValid = await validateEmail(email);
        if (!emailValid) {
            return setFormError(true);
        }

        const cardNumberValid = validateCardNumber(cardNumber);
        if (!cardNumberValid) {
            return;
        }

        const cardMonthValid = validateCardMonth(cardMonth);
        if (!cardMonthValid) {
            return;
        }

        const cardYearValid = validateCardYear(cardYear);
        if (!cardYearValid) {
            return;
        }

        const cvvValid = validateCvv(cvv);
        if (!cvvValid) {
            return;
        }

        const cardDateValid = validateCardDate(cardMonth, cardYear);
        if (!cardDateValid) {
            return setCardDateError(true);
        }

        try {
            // TODO
        } catch (err) {
            console.log(err);
            setError(true);
        }
    };

    return (
        <>
            <Header user={_user} hideSearch hideSignIn />

            <div className={styles.content}>
                {(!_user && subscription && !_noMatch && !success) &&
                    <>
                        <form onSubmit={handleSubmit} className={styles.purchaseForm}>

                            <div className={styles.signIn}>
                                <p>{strings.SIGN_IN}</p>
                                <Button
                                    type="button"
                                    variant="contained"
                                    size='small'
                                    className='btn-primary'
                                    onClick={() => {
                                        router.replace('/sign-in');
                                    }}
                                >{headerStrings.SIGN_IN}</Button>
                            </div>

                            <div className={styles.box}>
                                <div className={styles.boxInfo}>
                                    <UserIcon />
                                    <label>{strings.USER_DETAILS}</label>
                                </div>
                                <div className={styles.boxForm}>
                                    <FormControl fullWidth margin="dense">
                                        <InputLabel className='required'>{commonStrings.FULL_NAME}</InputLabel>
                                        <Input
                                            type="text"
                                            label={commonStrings.FULL_NAME}
                                            required
                                            onChange={(e) => {
                                                setFullName(e.target.value);
                                            }}
                                            autoComplete="off"
                                        />
                                    </FormControl>
                                    <FormControl fullWidth margin="dense">
                                        <InputLabel className='required'>{commonStrings.EMAIL}</InputLabel>
                                        <Input
                                            type="text"
                                            label={commonStrings.EMAIL}
                                            error={!emailValid || emailRegistered}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setFormError(false);

                                                if (!e.target.value) {
                                                    setEmailRegistered(false);
                                                    setEmailValid(true);
                                                    setEmailInfo(true);
                                                }
                                            }}
                                            onBlur={async (e) => {
                                                await validateEmail(e.target.value);
                                            }}
                                            required
                                            autoComplete="off"
                                        />
                                        <FormHelperText error={!emailValid || emailRegistered}>
                                            {(!emailValid && commonStrings.EMAIL_NOT_VALID) || ''}
                                            {(emailRegistered &&
                                                <span>
                                                    <span>{commonStrings.EMAIL_ALREADY_REGISTERED}</span>
                                                    <span> </span>
                                                    <Link href='/sign-in'><a>{strings.SIGN_IN}</a></Link>
                                                </span>
                                            ) || ''}
                                            {(emailInfo && strings.EMAIL_INFO) || ''}
                                        </FormHelperText>
                                    </FormControl>
                                </div>
                            </div>



                            <div className={styles.payment}>

                                <div className={styles.cost}>
                                    <div className={styles.securePaymentLabel}>
                                        <LockIcon className={styles.securePaymentLock} />
                                        <label>{strings.PAYMENT}</label>
                                    </div>
                                    <div className={styles.securePaymentCost}>
                                        <label className={styles.costTitle}>{strings.COST}</label>
                                        <label className={styles.costValue}>{`${subscription.price} ${commonStrings.CURRENCY_PER_MONTH}`}</label>
                                    </div>
                                </div>

                                <div className={styles.securePaymentLogo}>
                                    <div style={{
                                        position: 'relative',
                                        width: 220,
                                        height: 40
                                    }}>
                                        <Image
                                            src='/secure-payment.png'
                                            alt=''
                                            layout='fill'
                                            objectFit='contain'
                                        />
                                    </div>
                                </div>

                                <div className={styles.card}>
                                    <FormControl margin="dense" className={styles.cardNumber} fullWidth>
                                        <InputLabel className='required'>{strings.CARD_NUMBER}</InputLabel>
                                        <Input
                                            type="text"
                                            label={strings.CARD_NUMBER}
                                            error={!cardNumberValid}
                                            onBlur={(e) => {
                                                validateCardNumber(e.target.value);
                                            }}
                                            onChange={(e) => {
                                                setCardNumber(e.target.value);

                                                if (!e.target.value) {
                                                    setCardNumberValid(true);
                                                }
                                            }}
                                            required
                                            autoComplete="off"
                                        />
                                        <FormHelperText error={!cardNumberValid}>
                                            {(!cardNumberValid && strings.CARD_NUMBER_NOT_VALID) || ''}
                                        </FormHelperText>
                                    </FormControl>
                                    <div className='card-date'>
                                        <FormControl margin="dense" className={styles.cardMonth} fullWidth>
                                            <InputLabel className='required'>{strings.CARD_MONTH}</InputLabel>
                                            <Input
                                                type="text"
                                                label={strings.CARD_MONTH}
                                                error={!cardMonthValid}
                                                onBlur={(e) => {
                                                    validateCardMonth(e.target.value);
                                                }}
                                                onChange={(e) => {
                                                    setCardMonth(e.target.value);

                                                    if (!e.target.value) {
                                                        setCardMonthValid(true);
                                                        setCardDateError(false);
                                                    }
                                                }}
                                                required
                                                autoComplete="off"
                                            />
                                            <FormHelperText error={!cardMonthValid}>
                                                {(!cardMonthValid && strings.CARD_MONTH_NOT_VALID) || ''}
                                            </FormHelperText>
                                        </FormControl>
                                        <FormControl margin="dense" className={styles.cardYear} fullWidth>
                                            <InputLabel className='required'>{strings.CARD_YEAR}</InputLabel>
                                            <Input
                                                type="text"
                                                label={strings.CARD_YEAR}
                                                error={!cardYearValid}
                                                onBlur={(e) => {
                                                    validateCardYear(e.target.value);
                                                }}
                                                onChange={(e) => {
                                                    setCardYear(e.target.value);

                                                    if (!e.target.value) {
                                                        setCardYearValid(true);
                                                        setCardDateError(false);
                                                    }
                                                }}
                                                required
                                                autoComplete="off"
                                            />
                                            <FormHelperText error={!cardYearValid}>
                                                {(!cardYearValid && strings.CARD_YEAR_NOT_VALID) || ''}
                                            </FormHelperText>
                                        </FormControl>
                                    </div>
                                    <FormControl margin="dense" className={styles.cvv} fullWidth>
                                        <InputLabel className='required'>{strings.CVV}</InputLabel>
                                        <Input
                                            type="text"
                                            label={strings.CVV}
                                            error={!cvvValid}
                                            onBlur={(e) => {
                                                validateCvv(e.target.value);
                                            }}
                                            onChange={(e) => {
                                                setCvv(e.target.value);

                                                if (!e.target.value) {
                                                    setCvvValid(true);
                                                }
                                            }}
                                            required
                                            autoComplete="off"
                                        />
                                        <FormHelperText error={!cvvValid}>
                                            {(!cvvValid && strings.CVV_NOT_VALID) || ''}
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={styles.securePaymentInfo}>
                                    <LockIcon className={styles.paymentIcon} />
                                    <label>{strings.SECURE_PAYMENT_INFO}</label>
                                </div>

                                <div className={styles.paymentInfo}>
                                    <label className={styles.paymentInfoLabel}>{'*'}</label>
                                    <label>{strings.SUBSCRIPTION_INFO}</label>
                                </div>
                            </div>

                            <div className={styles.buttons}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className={`${styles.btnPurchase}  btn-margin-bottom`}
                                    size="small"
                                >
                                    {strings.PURCHASE}
                                </Button>
                                <Button
                                    variant="contained"
                                    className={`${styles.btnCancel}  btn-margin-bottom`}
                                    size="small"
                                    onClick={() => {
                                        router.replace('/');
                                    }}>
                                    {commonStrings.CANCEL}
                                </Button>
                            </div>

                            <div className="form-error">
                                {cardDateError && <Error message={strings.CARD_DATE_ERROR} />}
                                {formError && <Error message={commonStrings.FORM_ERROR} />}
                                {error && <Error message={commonStrings.GENERIC_ERROR} />}
                            </div>
                        </form>
                    </>
                }

                {success && <Info message={strings.SUCCESS} />}
                {_noMatch && <NoMatch />}
            </div>
        </>
    );
};

export async function getServerSideProps(context) {
    let _user = null, _signout = false, _noMatch = false, _cart = [];

    try {
        const currentUser = UserService.getCurrentUser(context);

        if (currentUser) {
            let status;
            try {
                status = await UserService.validateAccessToken(context);
            } catch (err) {
                console.log('Unauthorized!');
            }

            if (status === 200) {
                _user = await UserService.getUser(context, currentUser.id);

                if (_user) {
                    _noMatch = true;
                } else {
                    _signout = true;
                }
            } else {
                _signout = true;
            }

        } else {
            _signout = true;
        }

        if (!_noMatch) {
            try {
                const language = UserService.getLanguage(context);
                const cartId = CartService.getCartId();
                _cart = await CartService.getCart(cartId);

                if (_cart) {
                    _noMatch = true;
                }
            } catch (err) {
                console.log(err);
                _noMatch = true;
            }
        }

    } catch (err) {
        console.log(err);
        _signout = true;
    }

    return {
        props: {
            _user,
            _signout,
            _noMatch,
            _cart
        }
    };
}
