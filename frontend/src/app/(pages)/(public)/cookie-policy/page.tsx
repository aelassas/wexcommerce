import React from 'react'
import { strings } from '@/lang/cookie-policy'
import ScrollToTop from '@/components/ScrollToTop'
import * as SettingService from '@/lib/SettingService'

import styles from '@/styles/content.module.css'

const Product = async () => {
  const language = await SettingService.getLanguage()
  strings.setLanguage(language)

  return (
    <>
      <ScrollToTop />

      <div className={styles.content}>
        <h1>{strings.TITLE}</h1>
        <p>{strings.POLICY}</p>
      </div>
    </>
  )
}

export default Product
