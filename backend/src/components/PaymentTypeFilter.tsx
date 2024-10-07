'use client'

import React, { useState, useRef, useEffect } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { strings as commonStrings } from '@/lang/common'
import env from '@/config/env.config'
import Accordion from './Accordion'
import PaymentType from './PaymentType'
import * as helper from '@/common/helper'

import styles from '@/styles/payment-type-filter.module.css'

interface PaymentTypeFilterProps {
  selectedOptions: wexcommerceTypes.PaymentType[]
  onChange: (values: wexcommerceTypes.PaymentType[]) => void
  className?: string
}

const paymentTypes = helper.getPaymentTypes()

const PaymentTypeFilter: React.FC<PaymentTypeFilterProps> = (
  {
    selectedOptions,
    onChange,
    className
  }
) => {
  const [checkedPaymentTypes, setCheckedPaymentTypes] = useState(paymentTypes)
  const [allChecked, setAllChecked] = useState(true)
  const refs = useRef<HTMLInputElement[]>([])

  useEffect(() => {
    const paymentTypes = helper.getPaymentTypes()

    if (selectedOptions) {
      refs.current.forEach((checkbox) => {
        const paymentType = checkbox.getAttribute('data-value') as wexcommerceTypes.PaymentType
        if (selectedOptions.includes(paymentType)) {
          checkbox.checked = true
        }

        setAllChecked(selectedOptions.length === paymentTypes.length)
        setCheckedPaymentTypes(selectedOptions)
      })
    } else {
      refs.current.forEach((checkbox) => {
        checkbox.checked = true

        setAllChecked(true)
        setCheckedPaymentTypes(paymentTypes)
      })
    }
  }, [selectedOptions])

  const handlePaymentTypeClick = (e: React.MouseEvent<HTMLElement>) => {
    const checkbox = e.currentTarget.previousSibling as HTMLInputElement
    checkbox.checked = !checkbox.checked
    const event = e
    event.currentTarget = checkbox
    handleCheckPaymentTypeChange(event)
  }

  const handleCheckPaymentTypeChange = (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>) => {
    const paymentType = e.currentTarget.getAttribute('data-value') as wexcommerceTypes.PaymentType

    const _checkedPaymentTypes = wexcommerceHelper.cloneArray(checkedPaymentTypes) as wexcommerceTypes.PaymentType[]
    if ((e.currentTarget as HTMLInputElement).checked) {
      _checkedPaymentTypes.push(paymentType)

      if (_checkedPaymentTypes.length === paymentTypes.length) {
        setAllChecked(true)
      }
    } else {
      const index = _checkedPaymentTypes.findIndex(s => s === paymentType)
      _checkedPaymentTypes.splice(index, 1)

      if (_checkedPaymentTypes.length === 0) {
        setAllChecked(false)
      }
    }

    setCheckedPaymentTypes(_checkedPaymentTypes)
    if (onChange) {
      onChange(_checkedPaymentTypes)
    }
  }

  const handleUncheckAllChange = () => {
    if (allChecked) { // uncheck all
      refs.current.forEach((checkbox) => {
        checkbox.checked = false
      })

      setAllChecked(false)
      setCheckedPaymentTypes([])
    } else { // check all
      refs.current.forEach((checkbox) => {
        checkbox.checked = true
      })

      setAllChecked(true)
      setCheckedPaymentTypes(paymentTypes)

      if (onChange) {
        onChange(paymentTypes)
      }
    }
  }

  return (
    <Accordion
      title={commonStrings.PAYMENT_TYPES}
      collapse={!env.isMobile()}
      className={className}
    >
      <ul className={styles.paymentTypeList}>
        {
          paymentTypes.map((paymentType, index) => (
            <li key={paymentType}>
              <input
                ref={(ref) => {
                  if (ref) {
                    refs.current[index] = ref
                  }
                }}
                type='checkbox' data-value={paymentType}
                className={styles.paymentTypeCheckbox}
                onChange={handleCheckPaymentTypeChange}
              />
              <PaymentType
                value={paymentType}
                className={styles.paymentTypeLabel}
                onClick={handlePaymentTypeClick}
              />
            </li>
          ))
        }
      </ul>
      <div className={styles.filterActions}>
        <span onClick={handleUncheckAllChange} className={styles.uncheckall}>
          {allChecked ? commonStrings.UNCHECK_ALL : commonStrings.CHECK_ALL}
        </span>
      </div>
    </Accordion>
  )
}

export default PaymentTypeFilter
