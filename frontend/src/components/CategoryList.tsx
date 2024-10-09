'use client'

import React, { useRef } from 'react'
import ReactSlick from 'react-slick'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@mui/material'
import { ArrowRight, ArrowLeft } from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import env from '@/config/env.config'
import Slick from './Slick'

import styles from '@/styles/category-list.module.css'

interface CategoryListProps {
  title?: string,
  categories: wexcommerceTypes.CategoryInfo[]
  autoplay?: boolean
  autoplaySpeed?: number // in milliseconds
  showNavigation?: boolean
}

const CategoryList: React.FC<CategoryListProps> = (
  {
    title,
    categories,
    autoplay,
    autoplaySpeed,
    showNavigation,
  }) => {

  const slider = useRef<ReactSlick>(null)

  const sliderSettings = {
    arrows: false,
    dots: true,
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

  return categories.length >= 4 && (
    <section className={styles.main}>
      {title && <h1 className={styles.title}>{title}</h1>}
      <Slick ref={slider} className={styles.slider} {...sliderSettings}>
        {
          categories.map((category) => (
            <article key={category._id} className={styles.category}>
              <Link href={`/search?c=${category._id}`} title={category.name}>
                <div className={styles.thumbnail}>
                  <Image
                    alt=""
                    src={wexcommerceHelper.joinURL(env.CDN_CATEGORIES, category.image)}
                    width={0}
                    height={0}
                    sizes='100vw'
                    priority={true}
                    className={styles.thumbnail}
                  />
                </div>
                <span className={styles.name} title={category.name}>{category.name}</span>
              </Link>
            </article>
          ))
        }
      </Slick>
    </section>
  )
}

export default CategoryList
