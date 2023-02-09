import React, { useEffect, useRef } from 'react'

import styles from '../styles/accordion.module.css'

export default function Accordion({ title, collapse, children, className, offsetHeight }) {

    const accordionRef = useRef()

    const handleAccordionClick = (e) => {
        e.currentTarget.classList.toggle(styles.accordionActive)
        const panel = e.currentTarget.nextElementSibling
        const collapse = panel.classList.contains(styles.panelCollapse)

        if (panel.style.maxHeight || collapse) {

            if (collapse) {
                panel.classList.remove(styles.panelCollapse)
                panel.classList.add(styles.panel)
            }

            panel.style.maxHeight = null
        } else {
            panel.style.maxHeight = panel.scrollHeight + 'px'
        }
    }

    useEffect(() => {
        if (accordionRef && collapse) {
            const panel = accordionRef.current.nextElementSibling
            accordionRef.current.classList.toggle(styles.accordionActive)
            panel.style.maxHeight = (panel.scrollHeight + panel.offsetHeight) + 'px'
        }
    }, [collapse, accordionRef])

    return (
        <div className={`${className ? `${className} ` : ''}${styles.accordionContainer}`}>
            <label ref={accordionRef} className={styles.accordion} onClick={handleAccordionClick}>{title}</label>
            <div className={collapse ? styles.panelCollapse : styles.panel}>{children}</div>
        </div>
    )
}