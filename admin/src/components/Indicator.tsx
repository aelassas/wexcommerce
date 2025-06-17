import React from 'react'
import styles from '@/styles/indicator.module.css'

const Indicator = () => (
  <div className={styles.indicator}>
    <div className={styles.spinnerRolling}>
      <div className={styles.spinner}>
        <div></div>
      </div>
    </div>
  </div>
)

export default Indicator
