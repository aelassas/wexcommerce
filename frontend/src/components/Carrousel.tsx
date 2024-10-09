'use client'

import React, { useRef } from 'react'
import ReactSlick from 'react-slick'
import Link from 'next/link'
import Image from 'next/image'
import Slick from './Slick'

import styles from '@/styles/carrousel.module.css'

interface CarrouselProps {
  title?: string
  images: string[]
  autoplay?: boolean
  autoplaySpeed?: number // in milliseconds
  showNavigation?: boolean
}

const Carrousel: React.FC<CarrouselProps> = ({
  title,
  images,
  autoplay,
  autoplaySpeed,
  showNavigation,
}) => {

  const slider = useRef<ReactSlick>(null)

  const sliderSettings = {
    arrows: false,
    dots: true,
    // eslint-disable-next-line react/no-unstable-nested-components
    appendDots: (dots: React.ReactNode) => (showNavigation || !autoplay) ? (
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

    // centerMode: true,

    slidesToShow: 1,
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

  return (
    <section className={styles.main}>
      {title && <h1 className={styles.title}>{title}</h1>}
      <Slick ref={slider} className={styles.slider} {...sliderSettings}>
        {
          images.map((image, index) => (
            <Link key={index} href="/search">
              <article className={styles.image}>
                <Image
                  alt=""
                  src={image}
                  width={0}
                  height={0}
                  sizes='100vw'
                  priority={true}
                  className={styles.image}
                />
              </article>
            </Link>
          ))
        }
      </Slick>
    </section>
  )
}

export default Carrousel
