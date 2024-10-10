'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  AddShoppingCart as CartIcon,
  FavoriteBorder as WishlistIcon,
  Favorite as RemoveFromWishlistIcon,
} from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import * as CartService from '@/lib/CartService'
import * as WishlistService from '@/lib/WishlistService'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'
import Env from '@/config/env.config'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { CurrencyContextType, useCurrencyContext } from '@/context/CurrencyContext'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { CartContextType, useCartContext } from '@/context/CartContext'
import { WishlistContextType, useWishlistContext } from '@/context/WishlistContext'
import ImageViewer from '@/components/ImageViewer'
import SoldOut from '@/components/SoldOut'

import styles from '@/styles/product.module.css'

interface ProductProps {
  product: wexcommerceTypes.Product
}

const Product: React.FC<ProductProps> = ({ product: productFromProps }) => {
  const { language } = useLanguageContext() as LanguageContextType
  const { currency } = useCurrencyContext() as CurrencyContextType
  const { user } = useUserContext() as UserContextType
  const { cartItemCount, setCartItemCount } = useCartContext() as CartContextType
  const { wishlistCount, setWishlistCount } = useWishlistContext() as WishlistContextType

  const [product, setProduct] = useState(productFromProps)
  const [image, setImage] = useState<string>()
  const [images, setImages] = useState<string[]>()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [openImageDialog, setOpenImageDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  const productRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const src = (imageFilename: string) => wexcommerceHelper.joinURL(Env.CDN_PRODUCTS, imageFilename)

    if (product) {
      const image = src(product.image!)
      setImage(image)
      const _images = product.images ? product.images.map(src) : []
      const images = [image, ..._images]
      setImages(images)
      setProduct(product)
    }
  }, [product])

  useEffect(() => {
    if (productRef.current) {
      productRef.current.onwheel = (e: globalThis.WheelEvent) => {
        if (openImageDialog) {
          e.preventDefault()
        }
      }

      if (openImageDialog) {
        document.body.classList.add('stop-scrolling')
      } else {
        document.body.classList.remove('stop-scrolling')
      }
    }
  }, [openImageDialog])

  return language && currency && product && image && images && (
    <div ref={productRef} className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.product}>

          <div className={styles.thumbnailContainer}>
            <div className={styles.thumbnail}>
              <Image
                width={0}
                height={0}
                sizes='100vw'
                priority={true}
                className={styles.thumbnail}
                alt=""
                src={image!}
                onClick={() => setOpenImageDialog(true)}
              />
            </div>
            <div className={styles.images}>
              {
                images.map((image, index) => (
                  <div
                    key={index}
                    className={`${styles.image}${currentImageIndex === index ? ` ${styles.selected}` : ''}`}
                    onClick={() => {
                      setCurrentImageIndex(index)
                      setImage(image)
                    }}>
                    <Image
                      width={0}
                      height={0}
                      sizes='100vw'
                      priority={true}
                      alt=""
                      className={styles.image}
                      src={image}
                    />
                  </div>
                ))
              }
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.name}>
              <span className={styles.name}>{product.name}</span>
              <span className={styles.price}>{`${wexcommerceHelper.formatPrice(product.price, currency, language)}`}</span>
              {
                product.soldOut
                  ? <SoldOut />
                  : <span className={styles.stock}>{`${product.quantity} ${product.quantity > 1 ? commonStrings.ARTICLES_IN_STOCK : commonStrings.ARTICLE_IN_STOCK}`}</span>
              }
            </div>

            {
              !product.soldOut &&
              <div className={styles.actions}>

                {
                  product.inCart ?
                    <Button
                      variant="outlined"
                      color='error'
                      className={styles.button}
                      onClick={async () => {
                        try {
                          const cartId = await CartService.getCartId()
                          const res = await CartService.deleteItem(cartId, product._id)

                          if (res.status === 200) {
                            product.inCart = false
                            setProduct(product)
                            setCartItemCount(cartItemCount - 1)

                            if (res.data.cartDeleted) {
                              await CartService.deleteCartId()
                            }

                            setOpenDeleteDialog(false)
                            // helper.info(commonStrings.ARTICLE_REMOVED)
                          } else {
                            helper.error()
                          }
                        } catch (err) {
                          console.log(err)
                          helper.error()
                        }
                      }}
                    >
                      {commonStrings.REMOVE_FROM_CART}
                    </Button>
                    :
                    <Button
                      variant="contained"
                      className={`${styles.button} btn-primary`}
                      startIcon={<CartIcon />}
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
                            product.inCart = true
                            setProduct(product)
                            setCartItemCount(cartItemCount + 1)
                            // helper.info(commonStrings.ARTICLE_ADDED)
                          } else {
                            helper.error()
                          }
                        } catch (err) {
                          console.log(err)
                          helper.error()
                        }
                      }}
                    >
                    </Button>
                }

                {
                  !!user && (
                    product.inWishlist ?
                      <Button
                        variant="outlined"
                        color='error'
                        startIcon={<RemoveFromWishlistIcon />}
                        title={commonStrings.REMOVE_FROM_WISHLIST}
                        className={styles.button}
                        onClick={async () => {
                          try {
                            const wishlistId = await WishlistService.getWishlistId()
                            const res = await WishlistService.deleteItem(wishlistId, product._id)

                            if (res === 200) {
                              product.inWishlist = false
                              setProduct(product)
                              setWishlistCount(wishlistCount - 1)
                            } else {
                              helper.error()
                            }
                          } catch (err) {
                            console.log(err)
                            helper.error()
                          }
                        }}
                      >
                      </Button>
                      :
                      <Button
                        variant="contained"
                        className={`${styles.button} btn-primary`}
                        startIcon={<WishlistIcon />}
                        title={commonStrings.ADD_TO_WISHLIST}
                        onClick={async () => {
                          try {
                            const wishlistId = await WishlistService.getWishlistId()
                            const userId = user?._id || ''

                            const res = await WishlistService.addItem(wishlistId, userId, product._id)

                            if (res.status === 200) {
                              if (!wishlistId) {
                                await WishlistService.setWishlistId(res.data)
                              }
                              product.inWishlist = true
                              setProduct(product)
                              setWishlistCount(wishlistCount + 1)
                            } else {
                              helper.error()
                            }
                          } catch (err) {
                            console.log(err)
                            helper.error()
                          }
                        }}
                      >
                      </Button>
                  )
                }
              </div>
            }
          </div>
        </div>
        <div className={styles.description}>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      </div>

      {
        openImageDialog &&
        <ImageViewer
          src={images}
          currentIndex={currentImageIndex}
          closeOnClickOutside={true}
          title={product.name}
          onClose={() => {
            setOpenImageDialog(false)
          }}
        />
      }

      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={openDeleteDialog}
      >
        <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{commonStrings.REMOVE_FROM_CART_CONFIRM}</DialogContent>
        <DialogActions className='dialog-actions'>
          <Button onClick={() => setOpenDeleteDialog(false)} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
          <Button
            variant='contained'
            color='error'
            onClick={async () => {
              try {
                const cartId = await CartService.getCartId()
                const res = await CartService.deleteItem(cartId, product._id)

                if (res.status === 200) {
                  product.inCart = false
                  setProduct(product)
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
                console.log(err)
                helper.error()
              }
            }}>{commonStrings.REMOVE_FROM_CART}</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Product
