import React from 'react'
import { ChevronRight as NextIcon, ChevronLeft as PrevIcon } from '@mui/icons-material'

import styles from '@/styles/arrow.module.css'

interface ArrowProps {
  className?: string
  to: 'next' | 'prev'
  visible?: boolean
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const Arrow: React.FC<ArrowProps> = ({ className, to, visible, onClick }) => {
  return (typeof visible === 'undefined' || visible) ? (
    <div className={`${styles.arrow} ${className}`} onClick={onClick}>
      {
        to === 'next' ? <NextIcon className={styles.icon} /> : <PrevIcon className={styles.icon} />
      }
    </div>
  ) : <></>
}

export default Arrow
