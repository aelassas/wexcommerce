'use client'

import React, { useRef } from 'react'
import ReactSlick from 'react-slick'
import Link from 'next/link'
import Image from 'next/image'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import env from '@/config/env.config'
import Slick from './Slick'
import Arrow from './Arrow'

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

  const infinite = categories.length > env.CARROUSEL_SIZE

  const sliderSettings = {
    nextArrow: <Arrow to="next" visible={infinite} />,
    prevArrow: <Arrow to="prev" visible={infinite} />,
    dots: true,
    appendDots: (dots: React.ReactNode) => showNavigation ? (
      <div>
        <ul style={{ margin: '0px', padding: '0px' }}>
          {' '}
          {dots}
          {' '}
        </ul>
      </div>
    ) : <></>,

    infinite,
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

  const disableDragAndDrop = (e: React.DragEvent<HTMLAnchorElement>) => {
    e.preventDefault()
  }

  return categories.length >= env.CARROUSEL_SIZE && (
    <section className={styles.main}>
      {title && <h1 className={styles.title}>{title}</h1>}
      <Slick ref={slider} className={styles.slider} {...sliderSettings}>
        {
          categories.map((category) => (
            <article key={category._id} className={styles.category}>
              <Link
                href={`/search?c=${category._id}`}
                title={category.name}
                onDragStart={disableDragAndDrop}
                onDrop={disableDragAndDrop}
              >
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
