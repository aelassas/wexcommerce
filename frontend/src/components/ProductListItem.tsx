'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import slugify from '@sindresorhus/slugify'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import {
  ShoppingCart as CartIcon,
  FavoriteBorder as WishlistIcon,
  Favorite as RemoveFromWishlistIcon,
} from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import env from '@/config/env.config'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'
import * as CartService from '@/lib/CartService'
import * as WishlistService from '@/lib/WishlistService'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { CartContextType, useCartContext } from '@/context/CartContext'
import { WishlistContextType, useWishlistContext } from '@/context/WishlistContext'
import { CurrencyContextType, useCurrencyContext } from '@/context/CurrencyContext'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import SoldOut from '@/components/SoldOut'
import ToastCart from '@/components/ToastCart'
import ToastWishlist from '@/components/ToastWishlist'

import styles from '@/styles/product-list-item.module.css'

interface ProductListItemProps {
  product: wexcommerceTypes.Product
  hideActions?: boolean
  disableDragAndDrop?: boolean
  style?: React.CSSProperties
  // eslint-disable-next-line no-unused-vars
  onRemoveWishlistItem?: (productId: string) => void
}

const ProductListItem: React.FC<ProductListItemProps> = (
  {
    product,
    hideActions,
    disableDragAndDrop,
    style,
    onRemoveWishlistItem
  }) => {

  const { currency } = useCurrencyContext() as CurrencyContextType
  const { language } = useLanguageContext() as LanguageContextType
  const { user } = useUserContext() as UserContextType
  const { cartItemCount, setCartItemCount } = useCartContext() as CartContextType
  const { wishlistCount, setWishlistCount } = useWishlistContext() as WishlistContextType
  const [inCart, setInCart] = useState(product.inCart)
  const [inWishlist, setInWishlist] = useState(product.inWishlist)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  const handleDisableDragAndDrop = (e: React.DragEvent<HTMLAnchorElement>) => {
    if (disableDragAndDrop) {
      e.preventDefault()
    }
  }

  return (
    <article key={product._id} className={styles.product} style={style}>
      <Link
        href={product.url || `/product/${product._id}/${slugify(product.name)}`}
        title={product.name}
        onDragStart={handleDisableDragAndDrop}
        onDrop={handleDisableDragAndDrop}
      >
        <div className={styles.thumbnail}>
          <Image
            alt=""
            src={wexcommerceHelper.joinURL(env.CDN_PRODUCTS, product.image)}
            width={0}
            height={0}
            sizes='100vw'
            priority={true}
            className={styles.thumbnail}
          />
        </div>
        {product.soldOut && <SoldOut className={styles.label} />}
        <span className={styles.name} title={product.name}>{product.name}</span>
        <span className={styles.price}>{`${wexcommerceHelper.formatPrice(product.price, currency, language)}`}</span>
      </Link>
      {
        !hideActions &&
        <div className={styles.actions}>
          {!!user && (
            inWishlist ?
              <IconButton
                color="error"
                title={commonStrings.REMOVE_FROM_WISHLIST}
                className={styles.button}
                onClick={async () => {
                  try {
                    const userId = user._id!
                    const wishlistId = await WishlistService.getWishlistId(userId)
                    const res = await WishlistService.deleteItem(wishlistId, product._id)

                    if (res === 200) {
                      const _wishlistCount = wishlistCount - 1
                      setInWishlist(false)
                      setWishlistCount(_wishlistCount)
                      if (onRemoveWishlistItem) {
                        onRemoveWishlistItem(product._id)
                      }

                      if (_wishlistCount === 0) {
                        helper.info(commonStrings.ARTICLE_REMOVED_FROM_WISH_LIST)
                      } else {
                        helper.infoWithComponent(
                          <ToastWishlist action="remove" />
                        )
                      }
                    } else {
                      helper.error()
                    }
                  } catch (err) {
                    console.log(err)
                    helper.error()
                  }
                }}
              >
                <RemoveFromWishlistIcon className={styles.buttonIcon} />
              </IconButton>
              :
              <IconButton
                className={`${styles.button} btn-primary`}
                title={commonStrings.ADD_TO_WISHLIST}
                onClick={async () => {
                  try {
                    const userId = user._id!

                    const res = await WishlistService.addItem(userId, product._id)

                    if (res.status === 200) {
                      setInWishlist(true)
                      setWishlistCount(wishlistCount + 1)

                      helper.infoWithComponent(
                        <ToastWishlist action="add" />
                      )
                    } else {
                      helper.error()
                    }
                  } catch (err) {
                    console.log(err)
                    helper.error()
                  }
                }}
              >
                <WishlistIcon className={styles.buttonIcon} />
              </IconButton>
          )}

          {
            inCart ?
              <IconButton
                color="error"
                title={commonStrings.REMOVE_FROM_CART}
                className={styles.button}
                onClick={async () => {
                  // setOpenDeleteDialog(true)

                  try {
                    const cartId = await CartService.getCartId()
                    const res = await CartService.deleteItem(cartId, product._id)

                    if (res.status === 200) {
                      const _cartItemCount = cartItemCount - res.data.quantity
                      setInCart(false)
                      setCartItemCount(_cartItemCount)

                      if (res.data.cartDeleted) {
                        await CartService.deleteCartId()
                      }

                      setOpenDeleteDialog(false)
                      if (_cartItemCount === 0) {
                        helper.info(commonStrings.ARTICLE_REMOVED)
                      } else {
                        helper.infoWithComponent(
                          <ToastCart action="remove" />
                        )
                      }
                    } else {
                      helper.error()
                    }
                  } catch (err) {
                    helper.error(err)
                  }
                }}
              >
                <CartIcon className={styles.buttonIcon} />
              </IconButton>
              :
              <IconButton
                className={`${styles.button} btn-primary`}
                title={commonStrings.ADD_TO_CART}
                onClick={async () => {
                  try {
                    const cartId = await CartService.getCartId()
                    const userId = user?._id || ''

                    const res = await CartService.addItem(cartId, userId, product._id)

                    if (res.status === 200) {
                      if (!cartId) {
                        await CartService.setCartId(res.data)
                      }
                      setInCart(true)
                      setCartItemCount(cartItemCount + 1)

                      helper.infoWithComponent(
                        <ToastCart action="add" />
                      )
                    } else {
                      helper.error()
                    }
                  } catch (err) {
                    helper.error(err)
                  }
                }}
              >
                <CartIcon className={styles.buttonIcon} />
              </IconButton>
          }

          <Dialog
            disableEscapeKeyDown
            maxWidth="xs"
            open={openDeleteDialog}
          >
            <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
            <DialogContent>{commonStrings.REMOVE_FROM_CART_CONFIRM}</DialogContent>
            <DialogActions className='dialog-actions'>
              <Button onClick={() => setOpenDeleteDialog(false)} variant='outlined'>{commonStrings.CANCEL}</Button>
              <Button
                variant='contained'
                color='primary'
                onClick={async () => {
                  try {
                    const cartId = await CartService.getCartId()
                    const res = await CartService.deleteItem(cartId, product._id)

                    if (res.status === 200) {
                      setInCart(false)
                      setCartItemCount(cartItemCount - 1)

                      if (res.data.cartDeleted) {
                        await CartService.deleteCartId()
                      }

                      setOpenDeleteDialog(false)
                      helper.info(commonStrings.ARTICLE_REMOVED)
                    } else {
                      helper.error()
                    }
                  } catch (err) {
                    helper.error(err)
                  }
                }}>{commonStrings.REMOVE_FROM_CART}</Button>
            </DialogActions>
          </Dialog>
        </div>
      }
    </article>
  )
}

export default ProductListItem
