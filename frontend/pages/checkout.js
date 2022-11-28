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
    ShoppingBag as ProductsIcon,
    AttachMoney as PaymentIcon,
    LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import { strings } from '../lang/checkout';
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
import PaymentTypeService from '../services/PaymentTypeService';
import DeliveryTypeService from '../services/DeliveryTypeService';
import Env from '../config/env.config';
import Backdrop from '../components/SimpleBackdrop';
import SettingService from '../services/SettingService';

import styles from '../styles/checkout.module.css';

const Checkout = ({ _user, _language, _currency, _signout, _noMatch, _cart, _paymentTypes, _deliveryTypes }) => {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [emailInfo, setEmailInfo] = useState(true);
    const [emailValid, setEmailValid] = useState(true);
    const [emailRegistered, setEmailRegistered] = useState(false);
    const [phone, setPhone] = useState('');
    const [phoneValid, setPhoneValid] = useState(true);
    const [address, setAddress] = useState('');
    const [paymentType, setPaymentType] = useState(Env.PAYMENT_TYPE.CREDIT_CARD);
    const [deliveryType, setDeliveryType] = useState(Env.DELIVERY_TYPE.SHIPPING);
    const [total, setTotal] = useState(0);
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
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (_language) {
            Helper.setLanguage(strings, _language);
            Helper.setLanguage(commonStrings, _language);
            Helper.setLanguage(masterStrings, _language);
        }
    }, [_language]);

    useEffect(() => {
        if (_signout) {
            UserService.signout(false);
        }
    }, [_signout]);

    useEffect(() => {
        if (_deliveryTypes && !_deliveryTypes.some(dt => dt.name === Env.DELIVERY_TYPE.SHIPPING)) {
            setDeliveryType(Env.DELIVERY_TYPE.WITHDRAWAL);
        }
    }, [_deliveryTypes]);

    useEffect(() => {
        if (_cart && _deliveryTypes) {

            const total = Helper.total(_cart.cartItems);

            if (total === 0) {
                router.replace('/');
            } else {
                const _deliveryType = _deliveryTypes.find(dt => dt.name === deliveryType);

                if (_deliveryType) {
                    setTotal(total + _deliveryType.price);
                }
            }
        }
    }, [_cart, _deliveryTypes, deliveryType, router]);

    useEffect(() => {
        (async function () {
            const cartId = CartService.getCartId();

            if (cartId) {
                const cartCount = await CartService.getCartCount(cartId);
                setCartCount(cartCount);
            }
        })();
    }, []);

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

        if (!_user) {
            const emailValid = await validateEmail(email);
            if (!emailValid) {
                return setFormError(true);
            }

            const phoneValid = await validatePhone(phone);
            if (!phoneValid) {
                return setFormError(true);;
            }
        }

        // if (paymentType === Env.PAYMENT_TYPE.CREDIT_CARD) {
        //     const cardNumberValid = validateCardNumber(cardNumber);
        //     if (!cardNumberValid) {
        //         return;
        //     }

        //     const cardMonthValid = validateCardMonth(cardMonth);
        //     if (!cardMonthValid) {
        //         return;
        //     }

        //     const cardYearValid = validateCardYear(cardYear);
        //     if (!cardYearValid) {
        //         return;
        //     }

        //     const cvvValid = validateCvv(cvv);
        //     if (!cvvValid) {
        //         return;
        //     }

        //     const cardDateValid = validateCardDate(cardMonth, cardYear);
        //     if (!cardDateValid) {
        //         return setCardDateError(true);
        //     }
        // }

        try {
            setLoading(true);

            // user
            let user;
            if (!_user) {
                user = {
                    email,
                    phone,
                    address,
                    fullName,
                    language: _language
                }
            }

            // order
            const orderItems = _cart.cartItems.filter(ci => !ci.soldOut).map(ci => ({ product: ci.product._id, quantity: ci.quantity }))

            const order = {
                paymentType: _paymentTypes.find(pt => pt.name === paymentType)._id,
                deliveryType: _deliveryTypes.find(dt => dt.name === deliveryType)._id,
                total,
                orderItems
            };
            if (_user) order.user = _user._id;

            // checkout
            const status = await OrderService.createOrder(user, order);

            if (status === 200) {
                const _status = await CartService.clearCart(_cart._id);

                if (_status === 200) {
                    CartService.deleteCartId();
                    setCartCount(0);
                    setSuccess(true);
                } else {
                    Helper.error();
                }
            } else {
                Helper.error();
            }

        } catch (err) {
            console.log(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        _language &&
        <>
            <Header user={_user} language={_language} hideSearch hideSignIn signout={_signout} cartCount={cartCount} />

            <div className={'content'}>
                {(_cart && _paymentTypes && total > 0 && !_noMatch && !success) &&
                    <>
                        <form onSubmit={handleSubmit} className={styles.checkoutForm}>

                            {!_user &&
                                <>
                                    <div className={styles.signIn}>
                                        <p>{strings.SIGN_IN}</p>
                                        <Button
                                            type="button"
                                            variant="contained"
                                            size='small'
                                            className='btn-primary'
                                            onClick={() => {
                                                router.replace('/sign-in?from=checkout');
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
                                                            <Link href='/sign-in'>{strings.SIGN_IN}</Link>
                                                        </span>
                                                    ) || ''}
                                                    {(emailInfo && strings.EMAIL_INFO) || ''}
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
                                        </div>
                                    </div>
                                </>
                            }

                            <div className={styles.box}>
                                <div className={styles.boxInfo}>
                                    <ProductsIcon />
                                    <label>{strings.PRODUCTS}</label>
                                </div>
                                <div className={styles.articles}>
                                    {
                                        _cart.cartItems.filter(cartItem => !cartItem.product.soldOut).map(cartItem => (

                                            <div key={cartItem._id} className={styles.article}>
                                                <Link href={`/product?p=${cartItem.product._id}`}>

                                                    <div className={styles.thumbnail}>
                                                        <img className={styles.thumbnail} alt="" src={Helper.joinURL(Env.CDN_PRODUCTS, cartItem.product.image)} />
                                                    </div>

                                                </Link>
                                                <div className={styles.articleInfo}>
                                                    <Link href={`/product?p=${cartItem.product._id}`}>

                                                        <span className={styles.name} title={cartItem.product.name}>{cartItem.product.name}</span>

                                                    </Link>
                                                    <span className={styles.price}>{`${Helper.formatNumber(cartItem.product.price)} ${_currency}`}</span>
                                                    <span className={styles.quantity}>
                                                        <span className={styles.quantityLabel}>{strings.QUANTITY}</span>
                                                        <span>{Helper.formatNumber(cartItem.quantity)}</span>
                                                    </span>
                                                </div>
                                            </div>

                                        ))
                                    }

                                    <div className={styles.boxTotal}>
                                        <span className={styles.totalLabel}>{commonStrings.SUBTOTAL}</span>
                                        <span className={styles.total}>
                                            {`${Helper.formatNumber(Helper.total(_cart.cartItems))} ${_currency}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.box}>
                                <div className={styles.boxInfo}>
                                    <PaymentIcon />
                                    <label>{strings.PAYMENT_TYPE}</label>
                                </div>
                                <div className={styles.boxForm}>
                                    <RadioGroup
                                        value={paymentType}
                                        onChange={(event) => {
                                            setPaymentType(event.target.value);
                                        }}>
                                        {
                                            _paymentTypes.map((paymentType) => (
                                                <FormControlLabel key={paymentType.name} value={paymentType.name} control={<Radio />} label={
                                                    <span className={styles.paymentButton}>
                                                        <span>{
                                                            Helper.getPaymentType(paymentType.name, _language)
                                                        }</span>
                                                        <span className={styles.paymentInfo}>{
                                                            paymentType.name === Env.PAYMENT_TYPE.CREDIT_CARD ? strings.CREDIT_CARD_INFO
                                                                : paymentType.name === Env.PAYMENT_TYPE.COD ? strings.COD_INFO
                                                                    : paymentType.name === Env.PAYMENT_TYPE.WIRE_TRANSFER ? strings.WIRE_TRANSFER_INFO
                                                                        : ''
                                                        }</span>
                                                    </span>
                                                } />
                                            ))
                                        }
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className={styles.box}>
                                <div className={styles.boxInfo}>
                                    <DeliveryIcon />
                                    <label>{strings.DELIVERY_TYPE}</label>
                                </div>
                                <div className={styles.boxForm}>
                                    <RadioGroup
                                        value={deliveryType}
                                        className={styles.deliveryRadio}
                                        onChange={(event) => {
                                            setDeliveryType(event.target.value);
                                        }}>
                                        {
                                            _deliveryTypes.map((deliveryType) => (
                                                <FormControlLabel
                                                    key={deliveryType.name}
                                                    value={deliveryType.name}
                                                    control={<Radio />} label={
                                                        <div className={styles.delivery}>
                                                            <span>{Helper.getDeliveryType(deliveryType.name, _language)}</span>
                                                            <span className={styles.deliveryPrice}>
                                                                {deliveryType.price === 0 ? strings.FREE : `${deliveryType.price} ${_currency}`}
                                                            </span>
                                                        </div>
                                                    } />
                                            ))
                                        }
                                    </RadioGroup>
                                </div>
                            </div>

                            {[Env.PAYMENT_TYPE.CREDIT_CARD, Env.PAYMENT_TYPE.COD, Env.PAYMENT_TYPE.WIRE_TRANSFER].includes(paymentType) &&
                                <div className={`${styles.box} ${styles.boxTotal}`}>
                                    <span className={styles.totalLabel}>{strings.TOTAL_LABEL}</span>
                                    <span className={styles.total}>{`${Helper.formatNumber(total)} ${_currency}`}</span>
                                </div>
                            }

                            {/* {
                                paymentType === Env.PAYMENT_TYPE.CREDIT_CARD &&
                                <div className={styles.payment}>

                                    <div className={styles.cost}>
                                        <div className={styles.securePaymentLabel}>
                                            <LockIcon className={styles.securePaymentLock} />
                                            <label>{strings.PAYMENT}</label>
                                        </div>
                                        <div className={styles.securePaymentCost}>
                                            <label className={styles.costTitle}>{strings.COST}</label>
                                            <label className={styles.costValue}>{`${Helper.formatNumber(total)} ${_currency}`}</label>
                                        </div>
                                    </div>

                                    <div className={styles.securePaymentLogo}>
                                        <img src='/secure-payment.png' alt='' className={styles.securePaymentLogo} />
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
                                </div>
                            } */}

                            <div className={styles.buttons}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className={`${styles.btnCheckout} btn-margin-bottom`}
                                    size="small"
                                >
                                    {strings.CHECKOUT}
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

                {
                    success &&
                    <Info message={
                        paymentType === Env.PAYMENT_TYPE.CREDIT_CARD ? strings.CREDIT_CARD_SUCCESS
                            : paymentType === Env.PAYMENT_TYPE.COD ? strings.COD_SUCCESS
                                : paymentType === Env.PAYMENT_TYPE.WIRE_TRANSFER ? strings.WIRE_TRANSFER_SUCCESS
                                    : ''
                    } />
                }
                {_noMatch && <NoMatch language={_language} />}
                {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
            </div>
        </>);
};

export async function getServerSideProps(context) {
    let _user = null, _signout = false, _noMatch = false,
        _cart = null, _paymentTypes = [], _deliveryTypes = [], _language = '', _currency = '';

    try {
        _language = await SettingService.getLanguage();
        _currency = await SettingService.getCurrency();

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
            }

            if (!_user || status !== 200) {
                _signout = true;
                CartService.deleteCartId(context);
            }
        } else {
            _signout = true;
        }

        if (!_noMatch) {
            try {
                const cartId = CartService.getCartId(context);
                if (cartId) {
                    _cart = await CartService.getCart(cartId);

                    if (_cart) {
                        _paymentTypes = await PaymentTypeService.getPaymentTypes();
                        _deliveryTypes = await DeliveryTypeService.getDeliveryTypes();
                    } else {
                        _noMatch = true;
                    }
                } else {
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
            _cart,
            _paymentTypes,
            _deliveryTypes,
            _language,
            _currency
        }
    };
}

export default Checkout;
