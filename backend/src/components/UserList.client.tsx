'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  IconButton
} from '@mui/material'
import { Inventory as OrdersIcon } from '@mui/icons-material'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/user-list'
import env from '@/config/env.config'
import PagerComponent from './Pager'
import EmptyListComponent from './EmptyList'

import styles from '@/styles/user-list.module.css'

export const EmptyList: React.FC = () => (
  <EmptyListComponent text={strings.EMPTY_LIST} marginTop />
)

interface PagerProps {
  page: number
  totalRecords: number
  rowCount: number
  keyword: string
}

export const Pager: React.FC<PagerProps> = ({
  page,
  totalRecords,
  rowCount,
  keyword,
}) => {
  const router = useRouter()

  return (
    <PagerComponent
      page={page}
      pageSize={env.PAGE_SIZE}
      rowCount={rowCount}
      totalRecords={totalRecords}
      alwaysVisible
      className={styles.pager}
      onPrevious={() => router.push(`/users?${`p=${page - 1}`}${(keyword !== '' && `&k=${encodeURIComponent(keyword)}`) || ''}`)}
      onNext={() => router.push(`/users?${`p=${page + 1}`}${(keyword !== '' && `&k=${encodeURIComponent(keyword)}`) || ''}`)}
    />
  )
}

interface OrdersAction {
  userId: string
}

export const Actions: React.FC<OrdersAction> = ({ userId }) => {
  const router = useRouter()

  return (
    <Tooltip title={strings.ORDERS}>
      <IconButton onClick={() => {
        router.push(`/orders?u=${userId}`)
      }}
      >
        <OrdersIcon />
      </IconButton>
    </Tooltip>
  )
}

export const FullName: React.FC = () => (
  <span className={styles.userLabel}>{commonStrings.FULL_NAME}</span>
)

export const Email: React.FC = () => (
  <span className={styles.userLabel}>{commonStrings.EMAIL}</span>
)

export const Phone: React.FC = () => (
  <span className={styles.userLabel}>{commonStrings.PHONE}</span>
)

export const Address: React.FC = () => (
  <span className={styles.userLabel}>{commonStrings.ADDRESS}</span>
)

interface SubscribedAtProps {
  value: Date
}

export const SubscribedAt: React.FC<SubscribedAtProps> = ({ value }) => {
  const { language } = useLanguageContext() as LanguageContextType
  const _fr = language === 'fr'
  const _format = wexcommerceHelper.getDateFormat(language)
  const _locale = _fr ? fr : enUS
  return (
    <>
      <span className={styles.userLabel}>{strings.SUBSCRIBED_AT}</span>
      <span>{wexcommerceHelper.capitalize(format(new Date(value), _format, { locale: _locale }))}</span>
    </>)
}
