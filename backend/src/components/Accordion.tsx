'use client'

import React, { ReactNode, useEffect, useRef } from 'react'

import styles from '@/styles/accordion.module.css'

interface AccordionProps {
  title?: string
  className?: string
  collapse?: boolean
  offsetHeight?: number
  children: ReactNode
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  className,
  collapse,
  children
}) => {
  const accordionRef = useRef<HTMLSpanElement>(null)

  const handleAccordionClick = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.classList.toggle(styles.accordionActive)
    const panel = e.currentTarget.nextElementSibling as HTMLDivElement
    const _collapse = panel.classList.contains(styles.panelCollapse)

    if (panel.style.maxHeight || _collapse) {
      if (_collapse) {
        panel.classList.remove(styles.panelCollapse)
        panel.classList.add(styles.panel)
      }

      panel.style.maxHeight = ''
    } else {
      panel.style.maxHeight = panel.scrollHeight + 'px'
    }
  }

  useEffect(() => {
    if (collapse && accordionRef.current) {
      const panel = accordionRef.current.nextElementSibling as HTMLDivElement
      accordionRef.current.classList.add(styles.accordionActive)
      panel.style.maxHeight = (panel.scrollHeight + panel.offsetHeight) + 'px'
    }
  }, [collapse, accordionRef])

  return (
    <div className={`${className ? `${className} ` : ''}${styles.accordionContainer}`}>
      <span
        ref={accordionRef}
        className={styles.accordion}
        onClick={handleAccordionClick}
        role="button"
        tabIndex={0}
      >
        {title}
      </span>
      <div className={collapse ? styles.panelCollapse : styles.panel}>{children}</div>
    </div>
  )
}

export default Accordion
