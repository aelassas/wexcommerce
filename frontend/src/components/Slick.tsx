import React, { ComponentPropsWithRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import ReactSlick from 'react-slick'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

/**
 * Threshold from which mouse movement with pressed mouse button
 * is considered a drag instead of a click.
 */
const MoveDragThreshold = 10


function useDragDetection(): {
  handleMouseDown: () => void
  dragging: boolean
} {
  const [mouseDown, setMouseDown] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    let mouseMove = 0

    function handleMouseUp(): void {
      setMouseDown(false)
    }

    function handleMouseMove(e: MouseEvent): void {
      mouseMove += Math.abs(e.movementX) + Math.abs(e.movementY)
      setDragging(mouseMove > MoveDragThreshold)
    }

    if (mouseDown) {
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseDown])

  function handleMouseDown(): void {
    setMouseDown(true)
    setDragging(false)
  }

  return {
    handleMouseDown,
    dragging,
  }
}

interface SlickProps extends ComponentPropsWithRef<typeof ReactSlick> {
  children: React.ReactNode
}

const Slick = forwardRef<ReactSlick, SlickProps>(({ children, ...props }, ref) => {
  const slickRef = useRef<ReactSlick>(null)

  useImperativeHandle(
    ref,
    () =>
    ({
      ...slickRef.current,
    } as ReactSlick),
  )

  const {
    handleMouseDown,
    dragging,
  } = useDragDetection()

  function handleChildClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void {
    if (dragging) {
      e.preventDefault()
    }
  }
  // console.log(props)
  return (
    <ReactSlick
      ref={slickRef}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <div
          onMouseDownCapture={handleMouseDown}
          onClickCapture={handleChildClick}
        >
          {child}
        </div>
      ))}
    </ReactSlick>
  )
})

export default Slick
