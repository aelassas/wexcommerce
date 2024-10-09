'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import * as wexcommerceTypes from ':wexcommerce-types'
import PaymentTypeFilter from '@/components/PaymentTypeFilter'
import DeliveryTypeFilter from '@/components/DeliveryTypeFilter'
import OrderStatusFilter from '@/components/OrderStatusFilter'
import OrderDateFilter from '@/components/OrderDateFilter'

import styles from '@/styles/orders.module.css'

interface FiltersProps {
  paymentTypes: wexcommerceTypes.PaymentType[]
  deliveryTypes: wexcommerceTypes.DeliveryType[]
  statuses: wexcommerceTypes.OrderStatus[]
  from: Date | null
  to: Date | null
  keyword: string
}

export const Filters: React.FC<FiltersProps> = ({
  paymentTypes,
  deliveryTypes,
  statuses,
  from,
  to,
  keyword
}) => {
  const router = useRouter()

  return (
    <>
      <PaymentTypeFilter
        onChange={(__paymentTypes: wexcommerceTypes.PaymentType[]) => {
          const pt = __paymentTypes.join(',')
          const dt = deliveryTypes.join(',')
          const os = statuses.join(',')
          const url = `/orders?pt=${encodeURIComponent(pt)}&dt=${encodeURIComponent(dt)}&os=${encodeURIComponent(os)}${(from && `&from=${from}`) || ''}${(to && `&to=${to}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`
          router.push(url)
        }}
        selectedOptions={paymentTypes}
        className={styles.paymentTypeFilter}
      />

      <OrderStatusFilter
        onChange={(__statuses: wexcommerceTypes.OrderStatus[]) => {
          const pt = paymentTypes.join(',')
          const dt = deliveryTypes.join(',')
          const os = __statuses.join(',')
          const url = `/orders?pt=${encodeURIComponent(pt)}&dt=${encodeURIComponent(dt)}&os=${encodeURIComponent(os)}${(from && `&from=${from}`) || ''}${(to && `&to=${to}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`
          router.push(url)
        }}
        selectedOptions={statuses}
        className={styles.statusFilter}
      />

      <DeliveryTypeFilter
        onChange={(__deliveryTypes: wexcommerceTypes.DeliveryType[]) => {
          const dt = __deliveryTypes.join(',')
          const pt = paymentTypes.join(',')
          const os = statuses.join(',')
          const url = `/orders?pt=${encodeURIComponent(pt)}&dt=${encodeURIComponent(dt)}&os=${encodeURIComponent(os)}${(from && `&from=${from}`) || ''}${(to && `&to=${to}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`
          router.push(url)
        }}
        selectedOptions={deliveryTypes}
        className={styles.deliveryTypeFilter}
      />

      <OrderDateFilter
        from={from}
        to={to}
        onSubmit={(filter) => {
          const { from, to } = filter

          const pt = paymentTypes.join(',')
          const os = statuses.join(',')
          const dt = deliveryTypes.join(',')
          const url = `/orders?pt=${encodeURIComponent(pt)}&dt=${encodeURIComponent(dt)}&os=${encodeURIComponent(os)}${(from && `&from=${from.getTime()}`) || ''}${(to && `&to=${to.getTime()}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`
          router.push(url)
        }}
        className={styles.dateFilter}
      />
    </>
  )
}
