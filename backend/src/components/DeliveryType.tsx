'use client'

import React from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import * as helper from '@/common/helper'

import styles from '@/styles/delivery-type.module.css'

interface DeliveryTypeProps {
  value: wexcommerceTypes.DeliveryType
  className?: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const DeliveryType: React.FC<DeliveryTypeProps> = (
  { value,
    className,
    onClick
  }) => {
  const { language } = useLanguageContext() as LanguageContextType

  return language && (
    <span
      className={(className ? className + ' ' : '') +
        (value === wexcommerceTypes.DeliveryType.Shipping ? styles.shipping
          : value === wexcommerceTypes.DeliveryType.Withdrawal ? styles.withdrawal
            : '')}
      onClick={(e) => {
        if (onClick) {
          onClick(e)
        }
      }}
    >
      {
        helper.getDeliveryType(value, language)
      }
    </span>
  )
}

export default DeliveryType
