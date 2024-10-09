'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button, IconButton } from '@mui/material'
import { ArrowRight, ArrowLeft } from '@mui/icons-material'
import { ShoppingCart as CartIcon } from '@mui/icons-material'
import slugify from '@sindresorhus/slugify'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import env from '@/config/env.config'
import * as helper from '@/common/helper'
import { strings as commonStrings } from '@/lang/common'
import * as CartService from '@/lib/CartService'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { CurrencyContextType, useCurrencyContext } from '@/context/CurrencyContext'
import { CartContextType, useCartContext } from '@/context/CartContext'
import { UserContextType, useUserContext } from '@/context/UserContext'
import Slick from './Slick'
import ReactSlick from 'react-slick'

import styles from '@/styles/featured-products.module.css'

interface FeaturedProductsProps {
  title?: string
  products: wexcommerceTypes.Product[]
  autoplay?: boolean
  autoplaySpeed?: number // in milliseconds
  showNavigation?: boolean
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = (
  {
    title,
    products: productsFromProps,
    autoplay,
    autoplaySpeed,
    showNavigation,
  }) => {
  const { language } = useLanguageContext() as LanguageContextType
  const { currency } = useCurrencyContext() as CurrencyContextType
  const { user } = useUserContext() as UserContextType
  const { cartItemCount, setCartItemCount } = useCartContext() as CartContextType
  const [products, setProducts] = useState<wexcommerceTypes.Product[]>(productsFromProps)

  const slider = useRef<ReactSlick>(null)

  const sliderSettings = {
    arrows: false,
    dots: true,
    // eslint-disable-next-line react/no-unstable-nested-components
    appendDots: (dots: React.ReactNode) => (showNavigation || !autoplay) ? (
      <div>
        <ul style={{ margin: '0px', padding: '0px' }}>
          <Button variant="text" className={`${styles.btnSlider} ${styles.btnSliderPrev}`} onClick={() => slider?.current?.slickPrev()}>
            <ArrowLeft />
          </Button>
          {' '}
          {dots}
          {' '}
          <Button variant="text" className={`${styles.btnSlider} ${styles.btnSliderNext}`} onClick={() => slider?.current?.slickNext()}>
            <ArrowRight />
          </Button>
        </ul>
      </div>
    ) : <></>,

    infinite: true,
    autoplay: !!autoplay,
    speed: 500,
    autoplaySpeed: autoplaySpeed || (3 * 1000),
    swipeToSlide: true,

    slidesToShow: 3,
    slidesToScroll: 1,
    variableWidth: false,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          variableWidth: false,
        }
      }
    ]
  }

  const disableDragAndDrop = (e: React.DragEvent<HTMLAnchorElement>) => {
    e.preventDefault()
  }

  if (products.length < 4) {
    return null
  }

  return products.length > 0 && (
    <section className={styles.main}>
      {title && <h1 className={styles.title}>{title}</h1>}
      <Slick ref={slider} className={styles.slider} {...sliderSettings}>
        {
          products.map((product, index) => (
            <article key={product._id} className={styles.product}>
              <Link
                href={`/product/${product._id}/${slugify(product.name)}`}
                title={product.name}
                onDragStart={disableDragAndDrop}
                onDrop={disableDragAndDrop}
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
                <span className={styles.name} title={product.name} onDragStart={(e) => {
                  e.preventDefault()
                  console.log('ddd')
                }} onDrop={(e) => e.preventDefault()}>{product.name}</span>
                <span className={styles.price}>{`${wexcommerceHelper.formatPrice(product.price, currency, language)}`}</span>
              </Link>

              <div className={styles.actions}>
                {
                  product.inCart ?
                    <Button
                      variant="outlined"
                      color='error'
                      className={styles.removeButton}
                      onClick={async () => {
                        try {
                          const cartId = await CartService.getCartId()
                          const res = await CartService.deleteItem(cartId, product._id)

                          if (res.status === 200) {
                            const _products = wexcommerceHelper.cloneArray(products) as wexcommerceTypes.Product[]
                            _products[index].inCart = false
                            setProducts(_products)
                            setCartItemCount(cartItemCount - 1)

                            if (res.data.cartDeleted) {
                              await CartService.deleteCartId()
                            }

                            helper.info(commonStrings.ARTICLE_REMOVED)
                          } else {
                            helper.error()
                          }
                        } catch (err) {
                          helper.error(err)
                        }
                      }}
                    >
                      {commonStrings.REMOVE_FROM_CART}
                    </Button>
                    :
                    <IconButton
                      className={`${styles.button} btn-primary`}
                      title={commonStrings.ADD_TO_CART}
                      onClick={async () => {
                        try {
                          const cartId = await CartService.getCartId()
                          const userId = (user && user._id) || ''

                          const res = await CartService.addItem(cartId, userId, product._id)

                          if (res.status === 200) {
                            if (!cartId) {
                              await CartService.setCartId(res.data)
                            }
                            const _products = wexcommerceHelper.cloneArray(products) as wexcommerceTypes.Product[]
                            _products[index].inCart = true
                            setProducts(_products)
                            setCartItemCount(cartItemCount + 1)
                            helper.info(commonStrings.ARTICLE_ADDED)
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
              </div>
            </article>
          ))
        }
      </Slick >
    </section >
  )
}

export default FeaturedProducts
