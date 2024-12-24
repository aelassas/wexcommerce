'use client'

import React, { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import styles from '@/styles/image-viewer.module.css'
import Image from 'next/image'

interface ImageViewerProps {
  title?: string
  currentIndex?: number
  src: string[]
  closeOnClickOutside?: boolean
  disableScroll?: boolean
  backgroundStyle?: React.CSSProperties
  closeComponent?: React.ReactNode
  leftArrowComponent?: React.ReactNode
  rightArrowComponent?: React.ReactNode
  imageStyle?: React.CSSProperties
  onClose?: () => void
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  title,
  currentIndex: ivCurentIndex,
  src,
  closeOnClickOutside,
  disableScroll,
  backgroundStyle,
  closeComponent,
  leftArrowComponent,
  rightArrowComponent,
  imageStyle,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(ivCurentIndex ?? 0)
  const thumbnails = useMemo<(HTMLDivElement | null)[]>(() => [], [])

  const imageViewerRef = useRef<HTMLDivElement>(null)

  const scrollToThumbnail = (el: HTMLDivElement | null, index: number) => {
    if (el?.parentNode?.parentNode) {
      const parentNode = el.parentNode?.parentNode as HTMLDivElement
      if (index === 0) {
        parentNode.scrollLeft = 0
      } else {
        const offset = 15
        const elLeft = el.offsetLeft + el.offsetWidth + offset
        const elParentLeft = parentNode.offsetLeft + parentNode.offsetWidth

        // check if element not in view
        if (elLeft >= elParentLeft + parentNode.scrollLeft) {
          parentNode.scrollLeft = elLeft - elParentLeft
        } else if (elLeft <= parentNode.offsetLeft + parentNode.scrollLeft) {
          parentNode.scrollLeft = el.offsetLeft - parentNode.offsetLeft
        }
      }
    }
  }

  const changeImage = useCallback(
    (delta: 1 | -1) => {
      let nextIndex = (currentIndex + delta) % src.length
      if (nextIndex < 0) {
        nextIndex = src.length - 1
      }
      setCurrentIndex(nextIndex)

      if (src.length > 1) {
        const thumbnail = thumbnails[nextIndex]
        scrollToThumbnail(thumbnail, nextIndex)
      }
    },
    [currentIndex, thumbnails] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!event.target || !closeOnClickOutside) {
        return
      }

      const checkId = 'id' in event.target && event.target.id === 'image-viewer'

      if (checkId) {
        event.stopPropagation()
        onClose?.()
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      event.preventDefault()
      const { key } = event

      if (key === 'Escape') {
        onClose?.()
      }

      if (['ArrowLeft', 'h'].includes(key)) {
        changeImage(-1)
      }

      if (['ArrowRight', 'l'].includes(key)) {
        changeImage(1)
      }
    },
    [changeImage] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleWheel = useCallback(
    (event: globalThis.WheelEvent) => {
      const { deltaY } = event

      if (deltaY > 0) {
        changeImage(1)
      } else {
        changeImage(-1)
      }
    },
    [changeImage]
  )

  useEffect(() => {
    if (!disableScroll) {
      document.addEventListener('wheel', handleWheel)
    }

    return () => {
      if (!disableScroll) {
        document.removeEventListener('wheel', handleWheel)
      }
    }
  }, [handleWheel, disableScroll])

  useEffect(() => {
    imageViewerRef.current?.focus()
  }, [])

  return (
    <div
      id="image-viewer"
      className={`${styles.wrapper}`}
      ref={imageViewerRef}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      style={backgroundStyle}
    >
      <div className={styles.popup}>
        <span
          className={`${styles.close}`}
          onClick={() => onClose?.()}
        >
          {closeComponent || '×'}
        </span>

        {title && <span className={styles.title}>{title}</span>}

        {src.length > 1 && (
          <span
            className={`${styles.navigation} ${styles.prev}`}
            onClick={() => changeImage(-1)}
          >
            {leftArrowComponent || '❮'}
          </span>
        )}

        {src.length > 1 && (
          <span
            className={`${styles.navigation} ${styles.next}`}
            onClick={() => changeImage(1)}
          >
            {rightArrowComponent || '❯'}
          </span>
        )}

        <div
          className={styles.content}
          onClick={handleClick}
        >
          <div className={styles.slide}>
            <Image
              alt=""
              src={src[currentIndex]}
              width={0}
              height={0}
              sizes='100vw'
              priority={true}
              className={styles.image}
              style={imageStyle}
            />
          </div>
        </div>

        {
          src.length > 0 &&
          <div className={styles.thumbnailsContainer}>
            <div className={styles.thumbnails}>
              {src.map((srcItem, index) => (
                <div
                  key={srcItem}
                  ref={(el) => {
                    // thumbnails[index] = el
                    thumbnails.splice(index, 0, el)
                  }}
                  className={`${styles.thumbnail}${currentIndex === index ? ` ${styles.selected}` : ''}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <Image
                    alt=""
                    src={srcItem}
                    width={0}
                    height={0}
                    sizes='100vw'
                    priority={true}
                    className={styles.thumbnail}
                  />
                </div>
              ))}
            </div>
          </div>
        }
      </div>
    </div>
  )
}

export default ImageViewer
