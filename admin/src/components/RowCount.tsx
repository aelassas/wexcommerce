import React from 'react'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { strings as commonStrings } from '@/lang/common'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'

import styles from '@/styles/row-count.module.css'

interface RowCountProps {
  page: number
  rowCount: number
  totalRecords: number
  pageSize: number
}

const RowCount: React.FC<RowCountProps> = ({
  page,
  rowCount,
  totalRecords,
  pageSize,
}) => {
  const { language } = useLanguageContext() as LanguageContextType

  // 1-24 of over 100,000 results
  return language && (
    <span className={styles.rowCount}>
      {`${(page - 1) * pageSize + 1}-${rowCount} ${commonStrings.OF_OVER} ${wexcommerceHelper.formatNumber(totalRecords, language)} ${totalRecords === 1 ? commonStrings.RESULT : commonStrings.RESULTS}`}
    </span>
  )
}

export default RowCount
