'use client'

import React, { useRef } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import Slick from './Slick'
import ReactSlick from 'react-slick'
import ProductListItem from './ProductListItem'

import styles from '@/styles/featured-products.module.css'

interface FeaturedProductsProps {
  title?: string
  products: wexcommerceTypes.Product[]
  autoplay?: boolean
  autoplaySpeed?: number // in milliseconds
  showNavigation?: boolean
  showActions?: boolean
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = (
  {
    title,
    products,
    autoplay,
    autoplaySpeed,
    showNavigation,
    showActions,
  }) => {

  const slider = useRef<ReactSlick>(null)

  const sliderSettings = {
    arrows: true,
    dots: true,
    // eslint-disable-next-line react/no-unstable-nested-components
    appendDots: (dots: React.ReactNode) => showNavigation ? (
      <div>
        <ul style={{ margin: '0px', padding: '0px' }}>
          {' '}
          {dots}
          {' '}
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
          arrows: false,
          slidesToShow: 1,
          slidesToScroll: 1,
          variableWidth: false,
        }
      }
    ]
  }

  if (products.length < 4) {
    return null
  }

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
              width={346}
            />
          ))
        }
      </Slick >
    </section >
  )
}

export default FeaturedProducts
