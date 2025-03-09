import React from 'react'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Phone, Email } from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import env from '@/config/env.config'
import { strings } from '../lang/footer'
import { strings as headerStrings } from '../lang/header'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'

import styles from '../styles/footer.module.css'

const Footer: React.FC = () => {
  const { language } = useLanguageContext() as LanguageContextType

  return (
    language &&
    <div className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.content}>
          <div className={styles.mainSection}>
            <div className={styles.title}>{strings.CORPORATE}</div>
            <ul className={styles.links}>
              {/* <li onClick={() => redirect('/about')}>{strings.ABOUT}</li> */}
              <li onClick={() => redirect('/cookie-policy')}>{headerStrings.COOKIE_POLICY}</li>
              <li onClick={() => redirect('/privacy')}>{headerStrings.PRIVACY_POLICY}</li>
              <li onClick={() => redirect('/tos')}>{headerStrings.TOS}</li>
            </ul>
          </div>
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
              src={env.PAYMENT_GATEWAY === wexcommerceTypes.PaymentGateway.Stripe ? '/stripe.png' : '/paypal.png'}
              // className={env.PAYMENT_GATEWAY === wexcommerceTypes.PaymentGateway.Stripe ? styles.stripe : styles.paypal}
              className={styles.payment}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
