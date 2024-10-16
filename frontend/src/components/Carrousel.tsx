'use client'

import React, { useRef } from 'react'
import ReactSlick from 'react-slick'
import Link from 'next/link'
import Image from 'next/image'
import env from '@/config/env.config'
import Slick from './Slick'

import styles from '@/styles/carrousel.module.css'
import Arrow from './Arrow'

interface CarrouselProps {
  title?: string
  images: string[]
  autoplay?: boolean
  autoplaySpeed?: number // in milliseconds
  showArrows?: boolean
  showDots?: boolean
}

const Carrousel: React.FC<CarrouselProps> = ({
  title,
  images,
  autoplay,
  autoplaySpeed,
  showArrows,
  showDots,
}) => {

  const slider = useRef<ReactSlick>(null)

  const infinite = images.length > env.CARROUSEL_SIZE

  const sliderSettings = {
    nextArrow: <Arrow to="next" visible={showArrows} />,
    prevArrow: <Arrow to="prev" visible={showArrows} />,
    dots: true,
    // eslint-disable-next-line react/no-unstable-nested-components
    appendDots: (dots: React.ReactNode) => showDots ? (
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

  const disableDragAndDrop = (e: React.DragEvent<HTMLAnchorElement>) => {
    e.preventDefault()
  }

  return (
    <section className={styles.main}>
      {title && <h1 className={styles.title}>{title}</h1>}
      <Slick ref={slider} className={styles.slider} {...sliderSettings}>
        {
          images.map((image, index) => (
            <article key={index} className={styles.image}>
              <Link
                href="/search"
                onDragStart={disableDragAndDrop}
                onDrop={disableDragAndDrop}
              >
                <Image
                  alt=""
                  src={image}
                  width={0}
                  height={0}
                  sizes='100vw'
                  priority={true}
                  className={styles.image}
                />
              </Link>
            </article>
          ))
        }
      </Slick>
    </section>
  )
}

export default Carrousel
