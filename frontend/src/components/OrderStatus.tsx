'use client'

import React from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import * as helper from '@/common/helper'

import styles from '@/styles/order-status.module.css'

interface OrderStatusProps {
  value: wexcommerceTypes.OrderStatus
  className?: string
  onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void
}

const OrderStatus: React.FC<OrderStatusProps> = (
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
        (value === wexcommerceTypes.OrderStatus.Pending ? styles.pending
          : value === wexcommerceTypes.OrderStatus.Paid ? styles.paid
            : value === wexcommerceTypes.OrderStatus.Confirmed ? styles.confirmed
              : value === wexcommerceTypes.OrderStatus.InProgress ? styles.inProgress
                : value === wexcommerceTypes.OrderStatus.Shipped ? styles.shipped
                  : value === wexcommerceTypes.OrderStatus.Cancelled ? styles.cancelled
                    : '')}
      onClick={(e) => {
        if (onClick) {
          onClick(e)
        }
      }}
    >
      {
        helper.getOrderStatus(value, language)
      }
    </span>
  )
}

export default OrderStatus
