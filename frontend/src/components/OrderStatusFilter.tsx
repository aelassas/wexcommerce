'use client'

import React, { useState, useRef, useEffect } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { strings as commonStrings } from '@/lang/common'
import Accordion from './Accordion'
import OrderStatus from './OrderStatus'
import * as helper from '@/common/helper'

import styles from '@/styles/order-status-filter.module.css'

interface OrderStatusFilterProps {
  selectedOptions: wexcommerceTypes.OrderStatus[]
  collapse?: boolean
  className?: string
  onChange: (values: wexcommerceTypes.OrderStatus[]) => void
}

const statuses = helper.getOrderStatuses()

const OrderStatusFilter: React.FC<OrderStatusFilterProps> = (
  {
    selectedOptions,
    collapse,
    className,
    onChange,
  }
) => {
  const [checkedStatuses, setCheckedStatuses] = useState(statuses)
  const [allChecked, setAllChecked] = useState(true)
  const refs = useRef<HTMLInputElement[]>([])

  useEffect(() => {
    if (selectedOptions) {
      refs.current.forEach((checkbox) => {
        const status = checkbox.getAttribute('data-value') as wexcommerceTypes.OrderStatus
        if (selectedOptions.includes(status)) {
          checkbox.checked = true
        }

        setAllChecked(selectedOptions.length === statuses.length)
        setCheckedStatuses(selectedOptions)
      })
    } else {
      refs.current.forEach((checkbox) => {
        checkbox.checked = true

        setAllChecked(true)
        setCheckedStatuses(statuses)
      })
    }
  }, [selectedOptions])

  const handleOrderStatusClick = (e: React.MouseEvent<HTMLElement>) => {
    const checkbox = e.currentTarget.previousSibling as HTMLInputElement
    checkbox.checked = !checkbox.checked
    const event = e
    event.currentTarget = checkbox
    handleCheckOrderStatusChange(event)
  }

  const handleCheckOrderStatusChange = (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>) => {
    const status = e.currentTarget.getAttribute('data-value') as wexcommerceTypes.OrderStatus

    const _checkedStatuses = wexcommerceHelper.cloneArray(checkedStatuses) as wexcommerceTypes.OrderStatus[]
    if ((e.currentTarget as HTMLInputElement).checked) {
      _checkedStatuses.push(status)

      if (_checkedStatuses.length === statuses.length) {
        setAllChecked(true)
      }
    } else {
      const index = _checkedStatuses.findIndex(s => s === status)
      _checkedStatuses.splice(index, 1)

      if (_checkedStatuses.length === 0) {
        setAllChecked(false)
      }
    }

    setCheckedStatuses(_checkedStatuses)
    if (onChange) {
      onChange(_checkedStatuses)
    }
  }

  const handleUncheckAllChange = () => {
    if (allChecked) { // uncheck all
      refs.current.forEach((checkbox) => {
        checkbox.checked = false
      })

      setAllChecked(false)
      setCheckedStatuses([])
    } else { // check all
      refs.current.forEach((checkbox) => {
        checkbox.checked = true
      })

      setAllChecked(true)
      setCheckedStatuses(statuses)

      if (onChange) {
        onChange(statuses)
      }
    }
  }

  return (
    <Accordion
      title={commonStrings.STATUS}
      collapse={collapse}
      className={className}
    >
      <ul className={styles.statusList}>
        {
          statuses.map((status, index) => (
            <li key={status}>
              <input
                ref={(ref) => {
                  if (ref) {
                    refs.current[index] = ref
                  }
                }}
                type='checkbox'
                data-value={status}
                className={styles.statusCheckbox}
                onChange={handleCheckOrderStatusChange}
              />
              <OrderStatus
                value={status}
                className={styles.statusLabel}
                onClick={handleOrderStatusClick}
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

export default OrderStatusFilter
