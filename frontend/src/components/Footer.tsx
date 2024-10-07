import React from 'react'
import { strings } from '../lang/footer'
import { Phone, Email } from '@mui/icons-material'

import styles from '../styles/footer.module.css'
import { LanguageContextType, useLanguageContext } from "@/context/LanguageContext"
import Image from 'next/image'

const Footer: React.FC = () => {
  const { language } = useLanguageContext() as LanguageContextType

  return (
    language &&
    <div className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.content}>
          <div className={styles.info}>

            <span>{strings.ADDRESS}</span>

            <div className={styles.phone}>
              <span><Phone className={styles.icon} /></span>
              <span>{strings.PHONE}</span>
            </div>

            <div>
              <span><Email className={styles.icon} /></span>
              <span>{strings.EMAIL}</span>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          <span>{strings.COPYRIGHT}</span>
          <div className={styles.payment}>
            <Image
              width={0}
              height={0}
              sizes="100vwh"
              priority={true}
              alt=""
              src="/secure-payment.png"
              className={styles.payment}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
