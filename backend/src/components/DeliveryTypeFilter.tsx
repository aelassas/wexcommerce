'use client'

import React, { useState, useRef, useEffect } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { strings as commonStrings } from '@/lang/common'
import env from '@/config/env.config'
import Accordion from './Accordion'
import DeliveryType from './DeliveryType'
import * as helper from '@/common/helper'

import styles from '@/styles/delivery-type-filter.module.css'

interface DeliveryTypeFilterProps {
  selectedOptions: wexcommerceTypes.DeliveryType[],
  onChange?: (values: wexcommerceTypes.DeliveryType[]) => void
  className?: string
}

const deliveryTypes = helper.getDeliveryTypes()

const DeliveryTypeFilter: React.FC<DeliveryTypeFilterProps> = (
  {
    selectedOptions,
    onChange,
    className
  }
) => {
  const [checkedDeliveryTypes, setCheckedDeliveryTypes] = useState(deliveryTypes)
  const [allChecked, setAllChecked] = useState(true)
  const refs = useRef<(HTMLInputElement)[]>([])

  useEffect(() => {
    const deliveryTypes = helper.getDeliveryTypes()

    if (selectedOptions) {
      refs.current.forEach((checkbox) => {
        const deliveryType = checkbox.getAttribute('data-value') as wexcommerceTypes.DeliveryType
        if (selectedOptions.includes(deliveryType)) {
          checkbox.checked = true
        }

        setAllChecked(selectedOptions.length === deliveryTypes.length)
        setCheckedDeliveryTypes(selectedOptions)
      })
    } else {
      refs.current.forEach((checkbox) => {
        checkbox.checked = true

        setAllChecked(true)
        setCheckedDeliveryTypes(deliveryTypes)
      })
    }
  }, [selectedOptions])

  const handleDeliveryTypeClick = (e: React.MouseEvent<HTMLElement>) => {
    const checkbox = e.currentTarget.previousSibling as HTMLInputElement
    checkbox.checked = !checkbox.checked
    const event = e
    event.currentTarget = checkbox
    handleCheckDeliveryTypeChange(event)
  }

  const handleCheckDeliveryTypeChange = (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>) => {
    const deliveryType = e.currentTarget.getAttribute('data-value') as wexcommerceTypes.DeliveryType

    const _checkedDeliveryTypes = wexcommerceHelper.cloneArray(checkedDeliveryTypes) as wexcommerceTypes.DeliveryType[]
    if ((e.currentTarget as HTMLInputElement).checked) {
      _checkedDeliveryTypes.push(deliveryType)

      if (_checkedDeliveryTypes.length === deliveryTypes.length) {
        setAllChecked(true)
      }
    } else {
      const index = _checkedDeliveryTypes.findIndex(s => s === deliveryType)
      _checkedDeliveryTypes.splice(index, 1)

      if (_checkedDeliveryTypes.length === 0) {
        setAllChecked(false)
      }
    }

    setCheckedDeliveryTypes(_checkedDeliveryTypes)
    if (onChange) {
      onChange(_checkedDeliveryTypes)
    }
  }

  const handleUncheckAllChange = () => {
    if (allChecked) { // uncheck all
      refs.current.forEach((checkbox) => {
        checkbox.checked = false
      })

      setAllChecked(false)
      setCheckedDeliveryTypes([])
    } else { // check all
      refs.current.forEach((checkbox) => {
        checkbox.checked = true
      })

      setAllChecked(true)
      setCheckedDeliveryTypes(deliveryTypes)

      if (onChange) {
        onChange(deliveryTypes)
      }
    }
  }

  return (
    <Accordion
      title={commonStrings.DELIVERY_TYPE}
      collapse={!env.isMobile()}
      className={className}
    >
      <ul className={styles.deliveryTypeList}>
        {
          deliveryTypes.map((deliveryType, index) => (
            <li key={deliveryType}>
              <input
                ref={(ref) => {
                  if (ref) {
                    refs.current[index] = ref
                  }
                }}
                type='checkbox'
                data-value={deliveryType}
                className={styles.deliveryTypeCheckbox}
                onChange={handleCheckDeliveryTypeChange}
              />
              <DeliveryType
                value={deliveryType}
                className={styles.deliveryTypeLabel}
                onClick={handleDeliveryTypeClick}
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

export default DeliveryTypeFilter
