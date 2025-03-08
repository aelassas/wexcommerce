'use client'

import React, { useRef } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import Slick from './Slick'
import ReactSlick from 'react-slick'
import env from '@/config/env.config'
import ProductListItem from './ProductListItem'
import Arrow from './Arrow'

import styles from '@/styles/featured-products.module.css'

interface FeaturedProductsProps {
  title?: string
  products: wexcommerceTypes.Product[]
  autoplay?: boolean
  autoplaySpeed?: number // in milliseconds
  showNavigation?: boolean
  showActions?: boolean
  infinite?: boolean
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = (
  {
    title,
    products,
    autoplay,
    autoplaySpeed,
    showNavigation,
    showActions,
    infinite: infiniteFromProps,
  }) => {

  const slider = useRef<ReactSlick>(null)

  const infinite = infiniteFromProps && products.length > env.CARROUSEL_SIZE

  const sliderSettings = {
    nextArrow: <Arrow to="next" visible={!infiniteFromProps || infinite} />,
    prevArrow: <Arrow to="prev" visible={!infiniteFromProps || infinite} />,
    dots: true,
    appendDots: (dots: React.ReactNode) => showNavigation ? (
      <div>
        <ul style={{ margin: '0px', padding: '0px' }}>
          {' '}
          {dots}
          {' '}
        </ul>
      </div>
    ) : <div></div>,

    infinite,
    autoplay: !!autoplay,
    speed: 500,
    autoplaySpeed: autoplaySpeed || (3 * 1000),
    swipeToSlide: true,

    slidesToShow: products.length === 1 ? 1 : env.CARROUSEL_SIZE,
    slidesToScroll: 1,
    variableWidth: false,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          arrows: false,
          slidesToShow: 1,
          slidesToScroll: 1,
          variableWidth: false,
        }
      }
    ]
  }

  // if (products.length < 4) {
  //   return null
  // }

  return products.length > 0 && (
    <section className={styles.main}>
      {title && <h1 className={styles.title}>{title}</h1>}
      <Slick ref={slider} className={styles.slider} {...sliderSettings}>
        {
          products.map((product) => (
            <ProductListItem
              key={product._id}
              product={product}
              hideActions={!showActions}
              disableDragAndDrop
              style={{ width: 346, maxWidth: 346, marginRight: 'auto', marginLeft: 'auto' }}
            />
          ))
        }
      </Slick>
    </section>
  )
}

export default FeaturedProducts
