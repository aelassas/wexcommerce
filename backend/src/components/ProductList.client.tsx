'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import {
  Block as SoldOutIcon,
  VisibilityOff as HiddenIcon
} from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import env from '@/config/env.config'
import { strings } from '@/lang/product-list'
import { strings as commonStrings } from '@/lang/common'
import PagerComponent from './Pager'

import styles from '@/styles/product-list.module.css'

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
  categoryId?: string
  keyword: string
}

export const Pager: React.FC<PagerProps> = ({
  page,
  totalRecords,
  rowCount,
  categoryId,
  keyword,
}) => {
  const router = useRouter()

  return (
    <PagerComponent
      page={page}
      pageSize={env.PAGE_SIZE}
      rowCount={rowCount}
      totalRecords={totalRecords}
      onPrevious={() => router.push(`/products?${`p=${page - 1}`}${(categoryId && `&c=${categoryId}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`)}
      onNext={() => router.push(`/products?${`p=${page + 1}`}${(categoryId && `&c=${categoryId}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`)}
    />
  )
}

interface TagsProps {
  product: wexcommerceTypes.Product
}

export const Tags: React.FC<TagsProps> = ({ product }) => (
  <>
    {
      product.soldOut &&
      <div className={`${styles.label} ${styles.soldOut}`} title={commonStrings.SOLD_OUT_INFO}>
        <SoldOutIcon className={styles.labelIcon} />
        <span>{commonStrings.SOLD_OUT}</span>
      </div>
    }
    {
      product.hidden &&
      <div className={`${styles.label} ${styles.hidden}`} title={commonStrings.HIDDEN_INFO}>
        <HiddenIcon className={styles.labelIcon} />
        <span>{commonStrings.HIDDEN}</span>
      </div>
    }
  </>
)
