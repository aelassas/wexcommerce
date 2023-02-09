
import React from 'react'
import { strings } from '../lang/sold-out'
import { Block as SoldOutIcon } from '@mui/icons-material'

import styles from '../styles/sold-out.module.css'

const SoldOut = ({ className }) => (
    <div className={`${styles.label} ${styles.soldOut}${className ? ` ${className}` : ''}`} title={strings.SOLD_OUT_INFO}>
        <SoldOutIcon className={styles.labelIcon} />
        <span>{strings.SOLD_OUT}</span>
    </div>
)

export default SoldOut