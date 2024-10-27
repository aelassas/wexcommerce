'use client'

import React from 'react'
import { IconButton } from '@mui/material'
import {
  ArrowBackIos as PreviousPageIcon,
  ArrowForwardIos as NextPageIcon
} from '@mui/icons-material'
import { strings as commonStrings } from '@/lang/common'

import styles from '@/styles/pager.module.css'

interface PagerProps {
  page: number
  pageSize: number
  totalRecords: number
  rowCount: number
  className?: string
  onNext: () => void
  onPrevious: () => void
}

const Pager: React.FC<PagerProps> = ({
  page,
  pageSize,
  totalRecords,
  rowCount,
  className,
  onNext,
  onPrevious
}) => totalRecords > 0 && (page > 1 || rowCount < totalRecords) && (
  <div className={`${styles.pagerContainer} ${className || ''}`}>
    <div className={styles.pager}>
      <div className={styles.rowCount}>{`${(page - 1) * pageSize + 1}-${rowCount} ${commonStrings.OF} ${totalRecords}`}</div>

      {(page > 1 || rowCount < totalRecords) && (
        <div className={styles.actions}>
          <IconButton onClick={onPrevious} disabled={page === 1}>
            <PreviousPageIcon className={styles.icon} />
          </IconButton>

          <IconButton onClick={onNext} disabled={rowCount >= totalRecords}>
            <NextPageIcon className={styles.icon} />
          </IconButton>
        </div>
      )}
    </div>
  </div>
)

export default Pager
