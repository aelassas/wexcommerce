'use client'

import React from 'react'
import Link from 'next/link'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/no-match'

import styles from '@/styles/no-match.module.css'

const NoMatch: React.FC = () => {

  return (
    <div className={styles.noMatch}>
      <h2>{strings.NO_MATCH}</h2>
      <p><Link href="/">{commonStrings.GO_TO_HOME}</Link></p>
    </div>
  )
}

export default NoMatch
