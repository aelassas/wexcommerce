import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styles from '../styles/image-viewer.module.css'

const ImageViewer = (props) => {
    const [currentIndex, setCurrentIndex] = useState(props.currentIndex ?? 0)
    const thumbnails = useMemo(() => [], [])

    const scrollToThumbnail = (el, index) => {
        if (index === 0) {
            el.parentNode.parentNode.scrollLeft = 0
        } else {
            const offset = 15
            const elLeft = el.offsetLeft + el.offsetWidth + offset
            const elParentLeft = el.parentNode.parentNode.offsetLeft + el.parentNode.parentNode.offsetWidth

            // check if element not in view
            if (elLeft >= elParentLeft + el.parentNode.parentNode.scrollLeft) {
                el.parentNode.parentNode.scrollLeft = elLeft - elParentLeft
            } else if (elLeft <= el.parentNode.parentNode.offsetLeft + el.parentNode.parentNode.scrollLeft) {
                el.parentNode.parentNode.scrollLeft = el.offsetLeft - el.parentNode.parentNode.offsetLeft
            }
        }
    }

    const changeImage = useCallback(
        (delta) => {
            let nextIndex = (currentIndex + delta) % props.src.length
            if (nextIndex < 0) nextIndex = props.src.length - 1
            setCurrentIndex(nextIndex)

            if (props.src.length > 1) {
                const thumbnail = thumbnails[nextIndex]
                scrollToThumbnail(thumbnail, nextIndex)
            }
        },
        [currentIndex, props, thumbnails]
    )

    const handleClick = useCallback(
        (event) => {
            if (!event.target || !props.closeOnClickOutside) {
                return
            }

            const checkId = event.target.id === 'ReactSimpleImageViewer'
            const checkClass = event.target.classList.contains('react-simple-image-viewer__slide')

            if (checkId || checkClass) {
                event.stopPropagation()
                props.onClose?.()
            }
        },
        [props]
    )

    const handleKeyDown = useCallback(
        (event) => {
            event.preventDefault()

            if (event.key === 'Escape') {
                props.onClose?.()
            }

            if (['ArrowLeft', 'h'].includes(event.key)) {
                changeImage(-1)
            }

            if (['ArrowRight', 'l'].includes(event.key)) {
                changeImage(1)
            }
        },
        [props, changeImage]
    )

    const handleWheel = useCallback(
        (event) => {
            if (event.wheelDeltaY > 0) {
                changeImage(-1)
            } else {
                changeImage(1)
            }
        },
        [changeImage]
    )

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)

        if (!props.disableScroll) {
            document.addEventListener('wheel', handleWheel)
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)

            if (!props.disableScroll) {
                document.removeEventListener('wheel', handleWheel)
            }
        }
    }, [handleKeyDown, handleWheel, props.disableScroll])

    return (
        <div
            id='ReactSimpleImageViewer'
            className={`${styles.wrapper} react-simple-image-viewer__modal`}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            style={props.backgroundStyle}
        >
            <div className={styles.popup}>
                <span
                    className={`${styles.close} react-simple-image-viewer__close`}
                    onClick={() => props.onClose?.()}
                >
                    {props.closeComponent || '×'}
                </span>

                {props.title && <span className={styles.title}>{props.title}</span>}

                {props.src.length > 1 && (
                    <span
                        className={`${styles.navigation} ${styles.prev} react-simple-image-viewer__previous`}
                        onClick={() => changeImage(-1)}
                    >
                        {props.leftArrowComponent || '❮'}
                    </span>
                )}

                {props.src.length > 1 && (
                    <span
                        className={`${styles.navigation} ${styles.next} react-simple-image-viewer__next`}
                        onClick={() => changeImage(1)}
                    >
                        {props.rightArrowComponent || '❯'}
                    </span>
                )}

                <div
                    className={`${styles.content} react-simple-image-viewer__modal-content`}
                    onClick={handleClick}
                >
                    <div className={`${styles.slide} react-simple-image-viewer__slide`}>
                        <img className={styles.image} src={props.src[currentIndex]} alt='' style={props.imageStyle} />
                    </div>
                </div>

                {
                    props.src.length > 0 &&
                    <div className={styles.thumbnailsContainer}>
                        <div className={styles.thumbnails}>
                            {props.src.map((src, index) => (
                                <div
                                    key={index}
                                    ref={el => thumbnails[index] = el}
                                    className={`${styles.thumbnail}${currentIndex === index ? ` ${styles.selected}` : ''}`}
                                    onClick={() => setCurrentIndex(index)}
                                >
                                    <img className={styles.thumbnail} src={src} alt='' />
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