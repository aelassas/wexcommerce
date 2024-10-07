'use client'

import React from 'react'
import { strings as commonStrings } from '@/lang/common'
import Link from 'next/link'

import styles from '@/styles/error.module.css'

interface ErrorProps {
  message?: string
  style?: React.CSSProperties
  className?: string
  homeLink?: boolean
}

const Error: React.FC<ErrorProps> = ({ message, style, className, homeLink }) => {

  return (
    <div style={style} className={className}>
      <div className={styles.error}>
        <span className={styles.message}>{message || commonStrings.GENERIC_ERROR}</span>
      </div>
      {homeLink && <p><Link href='/'>{commonStrings.GO_TO_HOME}</Link></p>}
    </div>
  )
}

export default Error
