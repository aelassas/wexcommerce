import { strings } from '@/lang/tos'
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
        <p>{strings.TOS}</p>
      </div>
    </>
  )
}

export default Product
