'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import env from '@/config/env.config'
import { strings } from '@/lang/orders'
import { strings as commonStrings } from '@/lang/common'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import PaymentTypeFilter from '@/components/PaymentTypeFilter'
import DeliveryTypeFilter from '@/components/DeliveryTypeFilter'
import OrderStatusFilter from '@/components/OrderStatusFilter'
import OrderDateFilter from '@/components/OrderDateFilter'
import PagerComponent from '@/components/Pager'
import OrderStatus from '@/components/OrderStatus'
import PaymentType from '@/components/PaymentType'
import DeliveryType from '@/components/DeliveryType'

import styles from '@/styles/orders.module.css'
import RowCount from '@/components/RowCount'

interface FiltersProps {
  paymentTypes: wexcommerceTypes.PaymentType[]
  deliveryTypes: wexcommerceTypes.DeliveryType[]
  statuses: wexcommerceTypes.OrderStatus[]
  from: Date | null
  to: Date | null
  keyword: string
  user: string
  sortBy: wexcommerceTypes.SortOrderBy
}

export const Filters: React.FC<FiltersProps> = ({
  paymentTypes,
  deliveryTypes,
  statuses,
  from,
  to,
  keyword,
  user,
  sortBy,
}) => {
  const router = useRouter()

  return (
    <>
      <PaymentTypeFilter
        onChange={(__paymentTypes: wexcommerceTypes.PaymentType[]) => {
          const pt = __paymentTypes.join(',')
          const dt = deliveryTypes.join(',')
          const os = statuses.join(',')
          const url = `/orders?pt=${encodeURIComponent(pt)}${(user && `&u=${user}`) || ''}&dt=${encodeURIComponent(dt)}&os=${encodeURIComponent(os)}${(from && `&from=${from.getTime()}`) || ''}${(to && `&to=${to.getTime()}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(sortBy && `&sb=${sortBy}`) || ''}`
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
          const url = `/orders?pt=${encodeURIComponent(pt)}${(user && `&u=${user}`) || ''}&dt=${encodeURIComponent(dt)}&os=${encodeURIComponent(os)}${(from && `&from=${from.getTime()}`) || ''}${(to && `&to=${to.getTime()}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(sortBy && `&sb=${sortBy}`) || ''}`
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
          const url = `/orders?pt=${encodeURIComponent(pt)}${(user && `&u=${user}`) || ''}&dt=${encodeURIComponent(dt)}&os=${encodeURIComponent(os)}${(from && `&from=${from.getTime()}`) || ''}${(to && `&to=${to.getTime()}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(sortBy && `&sb=${sortBy}`) || ''}`
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
          const url = `/orders?pt=${encodeURIComponent(pt)}${(user && `&u=${user}`) || ''}&dt=${encodeURIComponent(dt)}&os=${encodeURIComponent(os)}${(from && `&from=${from.getTime()}`) || ''}${(to && `&to=${to.getTime()}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(sortBy && `&sb=${sortBy}`) || ''}`
          router.push(url)
        }}
        className={styles.dateFilter}
      />
    </>
  )
}

interface OrdersHeaderProps {
  page: number
  rowCount: number
  totalRecords: number
  paymentTypes: wexcommerceTypes.PaymentType[]
  deliveryTypes: wexcommerceTypes.DeliveryType[]
  statuses: wexcommerceTypes.OrderStatus[]
  from: Date | null
  to: Date | null
  keyword: string
  user: string
  sortBy: wexcommerceTypes.SortOrderBy
}

export const Header: React.FC<OrdersHeaderProps> = (
  {
    page,
    rowCount,
    totalRecords,
    paymentTypes,
    deliveryTypes,
    statuses,
    from,
    to,
    keyword,
    user,
    sortBy,
  }
) => {
  const router = useRouter()

  const { language } = useLanguageContext() as LanguageContextType

  return totalRecords > 0 && language && (
    <div className={styles.header}>
      <RowCount
        page={page}
        rowCount={rowCount}
        totalRecords={totalRecords}
        pageSize={env.ORDERS_PAGE_SIZE}
      />
      {sortBy && (
        <FormControl margin="dense" className={styles.sort}>
          <InputLabel>{commonStrings.SORT_BY}</InputLabel>
          <Select
            variant="outlined"
            size="small"
            label={commonStrings.SORT_BY}
            value={sortBy}
            onChange={(e) => {
              const ob = e.target.value
              const pt = paymentTypes.join(',')
              const dt = deliveryTypes.join(',')
              const os = statuses.join(',')

              const url = `/orders?pt=${encodeURIComponent(pt)}${(user && `&u=${user}`) || ''}&dt=${encodeURIComponent(dt)}&os=${encodeURIComponent(os)}${(from && `&from=${from.getTime()}`) || ''}${(to && `&to=${to.getTime()}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(sortBy && `&sb=${ob}`) || ''}`

              router.push(url)
            }}
          >
            <MenuItem value={wexcommerceTypes.SortOrderBy.dateDesc.toString()}>{strings.ORDER_BY_DATE_DESC}</MenuItem>
            <MenuItem value={wexcommerceTypes.SortOrderBy.dateAsc.toString()}>{strings.ORDER_BY_DATE_ASC}</MenuItem>
          </Select>
        </FormControl>
      )}
    </div>
  )
}

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
  sortBy?: wexcommerceTypes.SortOrderBy
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
  sortBy,
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
      onPrevious={() => router.push(`/orders?pt=${encodeURIComponent(paymentTypes.join(','))}&dt=${encodeURIComponent(deliveryTypes.join(','))}&os=${encodeURIComponent(statuses.join(','))}&${`p=${page - 1}`}${(from && `&from=${from}`) || ''}${(to && `&to=${to}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(sortBy && `&sb=${sortBy}`) || ''}`)}
      onNext={() => router.push(`/orders?pt=${encodeURIComponent(paymentTypes.join(','))}&dt=${encodeURIComponent(deliveryTypes.join(','))}&os=${encodeURIComponent(statuses.join(','))}&${`p=${page + 1}`}${(from && `&from=${from}`) || ''}${(to && `&to=${to}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(sortBy && `&sb=${sortBy}`) || ''}`)}
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

interface ActionsProps {
  orderId: string
}

export const Actions: React.FC<ActionsProps> = ({ orderId }) => {
  const router = useRouter()

  return (
    <div className={styles.orderActions}>
      <IconButton
        onClick={() => {
          router.push(`/order?o=${orderId}`)
        }}>
        <EditIcon />
      </IconButton>
    </div>
  )
}
