'use client'

import React, { useRef } from 'react'
import Slider from 'react-slick'
import Image from 'next/image'
import { Button } from '@mui/material'
import { ArrowRight, ArrowLeft } from '@mui/icons-material'
import { strings as commonStrings } from '@/lang/common'

import styles from '@/styles/carrousel.module.css'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

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

  const slider = useRef<Slider>(null)

  const sliderSettings = {
    arrows: false,
    dots: true,
    // eslint-disable-next-line react/no-unstable-nested-components
    appendDots: (dots: React.ReactNode) => (showNavigation || !autoplay) ? (
      <div>
        <ul style={{ margin: '0px', padding: '0px' }}>
          <Button variant="text" className={`${styles.btnSlider} ${styles.btnSliderPrev}`} onClick={() => slider?.current?.slickPrev()}>
            <ArrowLeft />
            {commonStrings.BACK}
          </Button>
          {' '}
          {dots}
          {' '}
          <Button variant="text" className={`${styles.btnSlider} ${styles.btnSliderNext}`} onClick={() => slider?.current?.slickNext()}>
            {commonStrings.NEXT}
            <ArrowRight />
          </Button>
        </ul>
      </div>
    ) : <></>,

    infinite: true,
    speed: 500,
    autoplay: !!autoplay,
    autoplaySpeed: autoplaySpeed || (3 * 1000),

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
      <Slider ref={slider} className={styles.slider} {...sliderSettings}>
        {
          images.map((image, index) => (
            <article key={index} className={styles.image}>
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
          ))
        }
      </Slider>
    </section>
  )
}

export default Carrousel
