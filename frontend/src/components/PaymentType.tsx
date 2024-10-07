'use client'

import React from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import * as helper from '@/common/helper'

import styles from '@/styles/payment-type.module.css'

interface PaymentTypeProps {
  value: wexcommerceTypes.PaymentType
  className?: string
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void
}

const PaymentType: React.FC<PaymentTypeProps> = (
  {
    value,
    className,
    onClick
  }
) => {
  const { language } = useLanguageContext() as LanguageContextType

  return language && (
    <span
      className={(className ? className + ' ' : '') +
        (value === wexcommerceTypes.PaymentType.CreditCard ? styles.creditCard
          : value === wexcommerceTypes.PaymentType.Cod ? styles.cod
            : value === wexcommerceTypes.PaymentType.WireTransfer ? styles.wireTransfert
              : '')
      }
      onClick={(e) => {
        if (onClick) {
          onClick(e)
        }
      }}
    >
      {
        helper.getPaymentType(value, language)
      }
    </span>
  )
}

export default PaymentType
