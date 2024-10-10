'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import env from '@/config/env.config'
import { strings } from '@/lang/product-list'
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
      onPrevious={() => router.push(`/search?${`p=${page - 1}`}${(categoryId && `&c=${categoryId}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`)}
      onNext={() => router.push(`/search?${`p=${page + 1}`}${(categoryId && `&c=${categoryId}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`)}
    />
  )
}
