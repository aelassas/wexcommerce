'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import slugify from '@sindresorhus/slugify'
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add as IncrementIcon,
  Remove as DecrementIcon,
  ShoppingCartCheckout as CheckoutIcon,
} from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { CartContextType, useCartContext } from '@/context/CartContext'
import { strings } from '@/lang/cart'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'
import * as CartService from '@/lib/CartService'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { CurrencyContextType, useCurrencyContext } from '@/context/CurrencyContext'
import Env from '@/config/env.config'
import SoldOut from '@/components/SoldOut'
import EmptyList from './EmptyList'

import styles from '@/styles/cart.module.css'

export const EmptyCart: React.FC = () => (
  <EmptyList text={strings.EMPTY} marginTop />
)

interface CartProps {
  cart: wexcommerceTypes.Cart
}

const iconStyle = { borderRadius: 1 }

const Cart: React.FC<CartProps> = ({ cart }) => {
  const router = useRouter()

  const { language } = useLanguageContext() as LanguageContextType
  const { currency } = useCurrencyContext() as CurrencyContextType
  const { cartItemCount, setCartItemCount } = useCartContext() as CartContextType
  const [cartItems, setCartItems] = useState<wexcommerceTypes.CartItem[]>([])
  const [productId, setProductId] = useState<string>()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openClearDialog, setOpenClearDialog] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (cart) {
      setCartItems(cart.cartItems)
      setTotal(helper.total(cart.cartItems))
    }
  }, [cart])

  return cart && cartItems.length === 0 ? (
    <EmptyCart />
  ) : (
    <div className={styles.main}>
      <div className={styles.items}>
        {
          cartItems.map((cartItem) => (
            <article key={cartItem._id} className={styles.item}>
              <div className={styles.product} >
                <Link href={`/product/${cartItem.product._id}/${slugify(cartItem.product.name)}`}>

                  <div className={styles.thumbnailContainer}>
                    <div className={styles.thumbnail}>
                      <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        priority={true}
                        className={styles.thumbnail}
                        alt=""
                        src={wexcommerceHelper.joinURL(Env.CDN_PRODUCTS, cartItem.product.image)}
                      />
                    </div>
                    <div className={styles.name}>
                      <span className={styles.name} title={cartItem.product.name}>{cartItem.product.name}</span>
                      {
                        !cartItem.product.soldOut &&
                        <span className={styles.stock}>{`${cartItem.product.quantity} ${cartItem.product.quantity > 1 ? commonStrings.ARTICLES_IN_STOCK : commonStrings.ARTICLE_IN_STOCK}`}</span>
                      }
                    </div>
                  </div>

                </Link>
                <span className={styles.price}>{wexcommerceHelper.formatPrice(cartItem.product.price, currency, language)}</span>
              </div>
              <div className={styles.actions}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={async () => {
                    setProductId(cartItem.product._id)
                    setOpenDeleteDialog(true)
                  }}
                >
                  {commonStrings.REMOVE_FROM_CART}
                </Button>
                {
                  cartItem.product.soldOut
                    ? <SoldOut className={styles.label} />
                    : <div className={styles.quantity}>
                      <IconButton
                        className="btn-primary"
                        disabled={cartItem.quantity === 1}
                        sx={iconStyle}
                        onClick={async () => {
                          const _cartItems = wexcommerceHelper.cloneArray(cartItems) as wexcommerceTypes.CartItem[]
                          const _cartItem = _cartItems.find((item) => item._id === cartItem._id)
                          const quantity = _cartItem!.quantity - 1

                          if (quantity >= 1) {
                            const status = await CartService.updateQuantity(_cartItem!._id, quantity)
                            if (status === 200) {
                              _cartItem!.quantity = quantity
                              setCartItems(_cartItems)
                              setTotal(helper.total(_cartItems))
                              setCartItemCount(cartItemCount - 1)
                            } else {
                              helper.error()
                            }
                          } else {
                            helper.error()
                          }
                        }}
                      >
                        <DecrementIcon />
                      </IconButton>
                      <span className={styles.quantity}>{cartItem.quantity}</span>
                      <IconButton
                        className="btn-primary"
                        disabled={cartItem.quantity >= cartItem.product.quantity}
                        sx={iconStyle}
                        onClick={async () => {
                          const _cartItems = wexcommerceHelper.cloneArray(cartItems) as wexcommerceTypes.CartItem[]
                          const _cartItem = _cartItems.find((item) => item._id === cartItem._id)
                          const quantity = _cartItem!.quantity + 1

                          if (quantity <= _cartItem!.product.quantity) {
                            const status = await CartService.updateQuantity(_cartItem!._id, quantity)
                            if (status === 200) {
                              _cartItem!.quantity = quantity
                              setCartItems(_cartItems)
                              setTotal(helper.total(_cartItems))
                              setCartItemCount(cartItemCount + 1)
                            } else {
                              helper.error()
                            }
                          } else {
                            helper.error()
                          }
                        }}
                      >
                        <IncrementIcon />
                      </IconButton>
                    </div>
                }
              </div>
            </article>
          ))
        }
      </div>
      <div className={styles.total}>
        <div className={styles.title}>{strings.SUMMARY}</div>
        <div className={styles.price}>
          <span>{commonStrings.SUBTOTAL}</span>
          <span className={styles.price}>{wexcommerceHelper.formatPrice(total, currency, language)}</span>
        </div>
        <div className={styles.action}>
          <Button
            variant="contained"
            className={`btn-primary ${styles.btn}`}
            startIcon={<CheckoutIcon />}
            disabled={total === 0}
            onClick={() => {
              router.push('/checkout')
            }}
          >
            {strings.CHECKOUT}
          </Button>
          <Button
            variant="outlined"
            color="error"
            className={styles.btn}
            onClick={() => {
              setOpenClearDialog(true)
            }}
          >
            {strings.CLEAR_CART}
          </Button>
        </div>
      </div>

      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={openDeleteDialog}
      >
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{commonStrings.REMOVE_FROM_CART_CONFIRM}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">{commonStrings.CANCEL}</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                const cartId = cart._id
                const res = await CartService.deleteItem(cartId, productId!)

                if (res.status === 200) {
                  const _cartItems = wexcommerceHelper.cloneArray(cartItems) as wexcommerceTypes.CartItem[]
                  const cartItem = _cartItems.find((item) => item.product._id === productId)
                  const index = _cartItems.findIndex((item) => item.product._id === productId)
                  _cartItems.splice(index, 1)
                  setCartItems(_cartItems)
                  setCartItemCount(cartItemCount - cartItem!.quantity)
                  setTotal(helper.total(_cartItems))

                  if (res.data.cartDeleted) {
                    await CartService.deleteCartId()
                  }

                  helper.info(commonStrings.ARTICLE_REMOVED)
                  setOpenDeleteDialog(false)
                } else {
                  helper.error()
                }
              } catch (err) {
                console.error(err)
                helper.error()
              }
            }}>{commonStrings.REMOVE_FROM_CART}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={openClearDialog}
      >
        <DialogTitle className="dialog-header">{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{strings.CLEAR_CART_CONFIRM}</DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setOpenClearDialog(false)} variant="outlined">{commonStrings.CANCEL}</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                const cartId = cart._id
                const status = await CartService.clearCart(cartId)

                if (status === 200) {
                  await CartService.deleteCartId()
                  setCartItems([])
                  setCartItemCount(0)
                  setTotal(0)
                } else {
                  helper.error()
                }
              } catch (err) {
                console.error(err)
                helper.error()
              }
              setOpenClearDialog(false)
            }}>{strings.CLEAR_CART}</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Cart
