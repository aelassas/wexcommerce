'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import * as wexcommerceTypes from ':wexcommerce-types'
import env from '@/config/env.config'
import { strings } from '@/lang/order-list'
import PagerComponent from './Pager'
import OrderStatus from './OrderStatus'
import PaymentType from './PaymentType'
import DeliveryType from './DeliveryType'

import styles from '@/styles/order-list.module.css'

export const EmptyList: React.FC = () => (
  <Card variant="outlined" className={styles.emptyList}>
    <CardContent>
      <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
    </CardContent>
  </Card>
)

interface PagerProps {
  page: number
  totalRecords: number
  rowCount: number
  keyword: string
  paymentTypes: wexcommerceTypes.PaymentType[]
  deliveryTypes: wexcommerceTypes.DeliveryType[]
  statuses: wexcommerceTypes.OrderStatus[]
  from?: number
  to?: number
  className?: string
}

export const Pager: React.FC<PagerProps> = ({
  page,
  totalRecords,
  rowCount,
  keyword,
  paymentTypes,
  deliveryTypes,
  statuses,
  from,
  to,
  className,
}) => {
  const router = useRouter()

  return (
    <PagerComponent
      page={page}
      pageSize={env.ORDERS_PAGE_SIZE}
      rowCount={rowCount}
      totalRecords={totalRecords}
      className={className}
      onPrevious={() => router.push(`/orders?pt=${encodeURIComponent(paymentTypes.join(','))}&dt=${encodeURIComponent(deliveryTypes.join(','))}&os=${encodeURIComponent(statuses.join(','))}&${`p=${page - 1}`}${(from && `&from=${from}`) || ''}${(to && `&to=${to}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`)}
      onNext={() => router.push(`/orders?pt=${encodeURIComponent(paymentTypes.join(','))}&dt=${encodeURIComponent(deliveryTypes.join(','))}&os=${encodeURIComponent(statuses.join(','))}&${`p=${page + 1}`}${(from && `&from=${from}`) || ''}${(to && `&to=${to}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`)}
    />
  )
}

interface OdrerStatusFieldProps {
  value: wexcommerceTypes.OrderStatus
}

export const OdrerStatusField: React.FC<OdrerStatusFieldProps> = ({ value }) => (
  <span><OrderStatus value={value} /></span>
)

interface PaymentTypeFieldProps {
  value: wexcommerceTypes.PaymentType
}

export const PaymentTypeField: React.FC<PaymentTypeFieldProps> = ({ value }) => (
  <span><PaymentType value={value} /></span>
)

interface DeliveryTypeFieldProps {
  value: wexcommerceTypes.DeliveryType
}

export const DeliveryTypeField: React.FC<DeliveryTypeFieldProps> = ({ value }) => (
  <span><DeliveryType value={value} /></span>
)
