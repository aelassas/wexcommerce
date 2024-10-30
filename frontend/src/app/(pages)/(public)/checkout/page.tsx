'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ReCaptcha } from 'next-recaptcha-v3'
import {
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  RadioGroup,
  Radio,
  FormControlLabel,
  CircularProgress
} from '@mui/material'
import {
  Person as UserIcon,
  ShoppingBag as ProductsIcon,
  AttachMoney as PaymentIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material'
import validator from 'validator'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import slugify from '@sindresorhus/slugify'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import * as SettingService from '@/lib/SettingService'
import * as PaymentTypeService from '@/lib/PaymentTypeService'
import * as DeliveryTypeService from '@/lib/DeliveryTypeService'
import * as UserService from '@/lib/UserService'
import * as CartService from '@/lib/CartService'
import * as OrderService from '@/lib/OrderService'
import * as StripeService from '@/lib/StripeService'
import env from '@/config/env.config'
import * as helper from '@/common/helper'
import { strings } from '@/lang/checkout'
import { strings as commonStrings } from '@/lang/common'
import { strings as headerStrings } from '@/lang/header'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { CurrencyContextType, useCurrencyContext } from '@/context/CurrencyContext'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { CartContextType, useCartContext } from '@/context/CartContext'
import Error from '@/components/Error'
import Info from '@/components/Info'
import NoMatch from '@/components/NoMatch'
import ReCaptchaProvider from '@/components/ReCaptchaProvider'

import styles from '@/styles/checkout.module.css'

//
// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
//
const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY)

const Checkout: React.FC = () => {
  const router = useRouter()

  const { language } = useLanguageContext() as LanguageContextType
  const { currency } = useCurrencyContext() as CurrencyContextType
  const { user } = useUserContext() as UserContextType
  const { setCartItemCount } = useCartContext() as CartContextType
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [emailInfo, setEmailInfo] = useState(true)
  const [emailValid, setEmailValid] = useState(true)
  const [emailRegistered, setEmailRegistered] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneValid, setPhoneValid] = useState(true)
  const [address, setAddress] = useState('')

  const [paymentTypes, setPaymentTypes] = useState<wexcommerceTypes.PaymentTypeInfo[]>()
  const [deliveryTypes, setDeliveryTypes] = useState<wexcommerceTypes.DeliveryTypeInfo[]>()
  const [paymentType, setPaymentType] = useState<wexcommerceTypes.PaymentType>()
  const [deliveryType, setDeliveryType] = useState(wexcommerceTypes.DeliveryType.Shipping)
  const [cart, setCart] = useState<wexcommerceTypes.Cart>()

  const [total, setTotal] = useState(0)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string>()
  const [sessionId, setSessionId] = useState<string>()
  const [noMatch, setNoMatch] = useState(false)
  const [recaptchaError, setRecaptchaError] = useState(false)

  useEffect(() => {
    const init = async () => {
      const cartId = await CartService.getCartId()

      let _cart: wexcommerceTypes.Cart | undefined = undefined
      if (cartId) {
        _cart = await CartService.getCart(cartId)
      }

      if (_cart) {
        setCart(_cart)
        setPaymentTypes((await PaymentTypeService.getPaymentTypes()))
        setDeliveryTypes((await DeliveryTypeService.getDeliveryTypes()))
      } else {
        setNoMatch(true)
      }
    }

    init()
  }, [])

  useEffect(() => {
    if (paymentTypes) {
      setPaymentType((paymentTypes && paymentTypes.length === 1 ? (paymentTypes[0].name as wexcommerceTypes.PaymentType) : wexcommerceTypes.PaymentType.CreditCard))
    }
  }, [paymentTypes])

  useEffect(() => {
    if (deliveryTypes && !deliveryTypes.some(dt => dt.name === wexcommerceTypes.DeliveryType.Shipping)) {
      setDeliveryType(wexcommerceTypes.DeliveryType.Withdrawal)
    }
  }, [deliveryTypes])

  useEffect(() => {
    if (cart && deliveryTypes) {

      const total = helper.total(cart.cartItems)

      if (total === 0) {
        router.replace('/')
      } else {
        const _deliveryType = deliveryTypes.find(dt => dt.name === deliveryType)

        if (_deliveryType) {
          setTotal(total + Number(_deliveryType.price))
        }
      }
    }
  }, [cart, deliveryTypes, deliveryType, router])

  const validateEmail = async (_email: string) => {
    if (_email) {
      if (validator.isEmail(_email)) {
        try {
          const status = await UserService.validateEmail({ email: _email })

          if (status === 200) {
            setEmailRegistered(false)
            setEmailValid(true)
            setEmailInfo(true)
            return true
          } else {
            setEmailRegistered(true)
            setEmailValid(true)
            setEmailInfo(false)
            return false
          }
        } catch (err) {
          helper.error(err)
          setEmailRegistered(false)
          setEmailValid(true)
          setEmailInfo(false)
          return false
        }
      } else {
        setEmailRegistered(false)
        setEmailValid(false)
        setEmailInfo(false)
        return false
      }
    } else {
      setEmailRegistered(false)
      setEmailValid(true)
      setEmailInfo(true)
      return false
    }
  }

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

  const handleRecaptchaVerify = useCallback(async (token: string) => {
    try {
      const ip = await UserService.getIP()
      const status = await UserService.verifyRecaptcha(token, ip)
      const valid = status === 200
      setRecaptchaError(!valid)
    } catch (err) {
      helper.error(err)
      setRecaptchaError(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!paymentTypes || !deliveryTypes) {
      helper.error()
      return
    }

    if (env.RECAPTCHA_ENABLED && recaptchaError) {
      return
    }

    if (!user) {
      const emailValid = await validateEmail(email)
      if (!emailValid) {
        return setFormError(true)
      }

      const phoneValid = await validatePhone(phone)
      if (!phoneValid) {
        return setFormError(true)
      }
    }

    try {
      setLoading(true)

      // user
      const authenticated = !!user
      let _user: wexcommerceTypes.User | undefined = undefined
      if (!authenticated) {
        _user = {
          email,
          phone,
          address,
          fullName,
          language
        }
      }

      //
      // Stripe Payment Gateway
      //
      let _customerId: string | undefined
      let _sessionId: string | undefined
      if (paymentType === wexcommerceTypes.PaymentType.CreditCard) {
        const _email = (!authenticated ? email : user.email) as string
        const payload: wexcommerceTypes.CreatePaymentPayload = {
          amount: total,
          currency: (await SettingService.getStripeCurrency()),
          locale: language,
          receiptEmail: _email,
          name: `New order from ${_email}`,
          description: 'wexCommerce',
          customerName: (!authenticated ? fullName : user.fullName) as string,
        }
        const res = await StripeService.createCheckoutSession(payload)
        setClientSecret(res.clientSecret)
        _sessionId = res.sessionId
        _customerId = res.customerId
      }

      // order
      const orderItems: wexcommerceTypes.OrderItem[] = cart!
        .cartItems
        .filter(ci => !ci.product.soldOut)
        .map(ci => ({ product: ci.product._id!, quantity: ci.quantity }))

      const order: wexcommerceTypes.OrderInfo = {
        paymentType: paymentTypes.find(pt => pt.name === paymentType)?._id || '',
        deliveryType: deliveryTypes.find(dt => dt.name === deliveryType)?._id || '',
        total,
        orderItems,
      }

      if (user) {
        order.user = user._id!
      }

      // checkout
      const payload: wexcommerceTypes.CheckoutPayload = {
        user: _user,
        order,
        sessionId: _sessionId,
        customerId: _customerId,
      }
      const { status, orderId: _orderId } = await OrderService.checkout(payload)

      if (status === 200) {
        if (paymentType === wexcommerceTypes.PaymentType.CreditCard) {
          setOrderId(_orderId)
          setSessionId(_sessionId)
        } else {
          const _status = await CartService.clearCart(cart!._id)

          if (_status === 200) {
            await CartService.clearCart()
            await CartService.deleteCartId()
            setCartItemCount(0)
            setSuccess(true)
            window.scrollTo(0, 0)
          } else {
            helper.error()
          }
        }
      } else {
        helper.error()
      }

    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    language &&
    <ReCaptchaProvider>
      <div className={styles.checkout}>
        {(cart && paymentTypes && deliveryTypes && paymentType && total > 0 && !success) &&
          <>
            <form onSubmit={handleSubmit} className={styles.checkoutForm}>

              {!user &&
                <>
                  <div className={styles.signIn}>
                    <p>{strings.REGISTERED}</p>
                    <Button
                      type="button"
                      variant="contained"
                      size='small'
                      className='btn-primary'
                      onClick={() => {
                        router.push('/sign-in?from=checkout')
                      }}
                    >{headerStrings.SIGN_IN}</Button>
                  </div>

                  <div className={styles.box}>
                    <div className={styles.boxInfo}>
                      <UserIcon />
                      <label>{strings.USER_DETAILS}</label>
                    </div>
                    <div className={styles.boxForm}>
                      <FormControl fullWidth margin="normal" size="small">
                        <InputLabel className='required'>{commonStrings.FULL_NAME}</InputLabel>
                        <OutlinedInput
                          type="text"
                          label={commonStrings.FULL_NAME}
                          required
                          onChange={(e) => {
                            setFullName(e.target.value)
                          }}
                          autoComplete="off"
                          size="small"
                          disabled={!!clientSecret}
                        />
                      </FormControl>
                      <FormControl fullWidth margin="normal" size="small">
                        <InputLabel className='required'>{commonStrings.EMAIL}</InputLabel>
                        <OutlinedInput
                          type="text"
                          label={commonStrings.EMAIL}
                          error={!emailValid || emailRegistered}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            setFormError(false)

                            if (!e.target.value) {
                              setEmailRegistered(false)
                              setEmailValid(true)
                              setEmailInfo(true)
                            }
                          }}
                          onBlur={async (e) => {
                            await validateEmail(e.target.value)
                          }}
                          required
                          autoComplete="off"
                          size="small"
                          disabled={!!clientSecret}
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
                      <FormControl fullWidth margin="normal" size="small">
                        <InputLabel className='required'>{commonStrings.PHONE}</InputLabel>
                        <OutlinedInput
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
                          required
                          autoComplete="off"
                          size="small"
                          disabled={!!clientSecret}
                        />
                        <FormHelperText error={!phoneValid}>
                          {(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}
                        </FormHelperText>
                      </FormControl>
                      <FormControl fullWidth margin="normal" size="small">
                        <InputLabel className='required'>{commonStrings.ADDRESS}</InputLabel>
                        <OutlinedInput
                          label={commonStrings.ADDRESS}
                          type="text"
                          onChange={(e) => {
                            setAddress(e.target.value)
                          }}
                          required
                          multiline
                          minRows={3}
                          value={address}
                          size="small"
                          disabled={!!clientSecret}
                        />
                      </FormControl>

                      {env.RECAPTCHA_ENABLED && (
                        <ReCaptcha onValidate={handleRecaptchaVerify} action="page_view" />
                      )}

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
                    cart.cartItems.filter(cartItem => !cartItem.product.soldOut).map(cartItem => (

                      <div key={cartItem._id} className={styles.article}>
                        <Link href={`/product/${cartItem.product._id}/${slugify(cartItem.product.name)}`}>

                          <div className={styles.thumbnail}>
                            <Image
                              width={0}
                              height={0}
                              sizes="100vw"
                              priority={true}
                              className={styles.thumbnail}
                              alt=""
                              src={wexcommerceHelper.joinURL(env.CDN_PRODUCTS, cartItem.product.image)}
                            />
                          </div>

                        </Link>
                        <div className={styles.articleInfo}>
                          <Link href={`/product/${cartItem.product._id}/${slugify(cartItem.product.name)}`}>

                            <span className={styles.name} title={cartItem.product.name}>{cartItem.product.name}</span>

                          </Link>
                          <span className={styles.price}>{wexcommerceHelper.formatPrice(cartItem.product.price, currency, language)}</span>
                          <span className={styles.quantity}>
                            <span className={styles.quantityLabel}>{strings.QUANTITY}</span>
                            <span>{wexcommerceHelper.formatNumber(cartItem.quantity, language)}</span>
                          </span>
                        </div>
                      </div>

                    ))
                  }

                  <div className={styles.boxTotal}>
                    <span className={styles.totalLabel}>{commonStrings.SUBTOTAL}</span>
                    <span className={styles.total}>
                      {wexcommerceHelper.formatPrice(helper.total(cart.cartItems), currency, language)}
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
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setPaymentType(event.target.value as wexcommerceTypes.PaymentType)
                    }}>
                    {
                      paymentTypes.map((paymentType) => (
                        <FormControlLabel
                          key={paymentType.name}
                          value={paymentType.name}
                          control={<Radio />}
                          disabled={!!clientSecret}
                          label={
                            <span className={styles.paymentButton}>
                              <span>{
                                helper.getPaymentType(paymentType.name, language)
                              }</span>
                              <span className={styles.paymentInfo}>{
                                paymentType.name === wexcommerceTypes.PaymentType.CreditCard ? strings.CREDIT_CARD_INFO
                                  : paymentType.name === wexcommerceTypes.PaymentType.Cod ? strings.COD_INFO
                                    : paymentType.name === wexcommerceTypes.PaymentType.WireTransfer ? strings.WIRE_TRANSFER_INFO
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
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setDeliveryType(event.target.value as wexcommerceTypes.DeliveryType)
                    }}>
                    {
                      deliveryTypes.map((deliveryType) => (
                        <FormControlLabel
                          key={deliveryType.name}
                          value={deliveryType.name}
                          control={<Radio />}
                          disabled={!!clientSecret}
                          label={
                            <div className={styles.delivery}>
                              <span>{helper.getDeliveryType(deliveryType.name, language)}</span>
                              <span className={styles.deliveryPrice}>
                                {deliveryType.price === 0 ? strings.FREE : `${deliveryType.price} ${currency}`}
                              </span>
                            </div>
                          } />
                      ))
                    }
                  </RadioGroup>
                </div>
              </div>

              {[
                wexcommerceTypes.PaymentType.CreditCard,
                wexcommerceTypes.PaymentType.Cod,
                wexcommerceTypes.PaymentType.WireTransfer
              ].includes(paymentType) &&
                <div className={`${styles.box} ${styles.boxTotal}`}>
                  <span className={styles.totalLabel}>{strings.TOTAL_LABEL}</span>
                  <span className={styles.total}>{wexcommerceHelper.formatPrice(total, currency, language)}</span>
                </div>
              }

              {
                clientSecret && (
                  <div className={styles.stripe}>
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ clientSecret }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                )
              }


              <div className={styles.buttons}>
                {!clientSecret && (
                  <Button
                    type="submit"
                    variant="contained"
                    className={`${styles.btnCheckout} btn-margin-bottom`}
                    size="small"

                    disabled={loading}>
                    {
                      loading
                        ? <CircularProgress color="inherit" size={24} />
                        : strings.CHECKOUT
                    }
                  </Button>
                )}
                <Button
                  variant="contained"
                  className={`${styles.btnCancel} btn-margin-bottom`}
                  size="small"
                  onClick={async () => {
                    try {
                      if (orderId && sessionId) {
                        //
                        // Delete temporary booking on cancel.
                        // Otherwise, temporary bookings are
                        // automatically deleted through a TTL index.
                        //
                        await OrderService.deleteTempOrder(orderId, sessionId)
                      }
                    } catch (err) {
                      helper.error(err)
                    } finally {
                      router.push('/')
                    }
                  }}
                >
                  {commonStrings.CANCEL}
                </Button>
              </div>


              <div className="form-error">
                {formError && <Error message={commonStrings.FORM_ERROR} />}
                {recaptchaError && <Error message={commonStrings.RECAPTCHA_ERROR} />}
                {error && <Error message={commonStrings.GENERIC_ERROR} />}
              </div>
            </form>
          </>
        }

        {
          success &&
          <Info message={
            paymentType === wexcommerceTypes.PaymentType.CreditCard ? strings.CREDIT_CARD_SUCCESS
              : paymentType === wexcommerceTypes.PaymentType.Cod ? strings.COD_SUCCESS
                : paymentType === wexcommerceTypes.PaymentType.WireTransfer ? strings.WIRE_TRANSFER_SUCCESS
                  : ''
          } />
        }

        {
          !success && noMatch && <NoMatch />
        }
      </div>
    </ReCaptchaProvider>
  )
}

export default Checkout
