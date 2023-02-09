import React, { useState, useRef, useEffect } from 'react'
import { strings as commonStrings } from '../lang/common'
import Env from '../config/env.config'
import Accordion from './Accordion'
import DeliveryType from './DeliveryType'
import * as Helper from '../common/Helper'

import styles from '../styles/delivery-type-filter.module.css'

const DeliveryTypeFilter = ({ selectedOptions, language, onChange, className }) => {
    const deliveryTypes = Helper.getDeliveryTypes()
    const [checkedDeliveryTypes, setCheckedDeliveryTypes] = useState(deliveryTypes)
    const [allChecked, setAllChecked] = useState(true)
    const refs = useRef([])

    useEffect(() => {
        const deliveryTypes = Helper.getDeliveryTypes()

        if (selectedOptions) {
            refs.current.forEach(checkbox => {
                const deliveryType = checkbox.getAttribute('data-value')
                if (selectedOptions.includes(deliveryType)) {
                    checkbox.checked = true
                }

                setAllChecked(selectedOptions.length === deliveryTypes.length)
                setCheckedDeliveryTypes(selectedOptions)
            })
        } else {
            refs.current.forEach(checkbox => {
                checkbox.checked = true

                setAllChecked(true)
                setCheckedDeliveryTypes(deliveryTypes)
            })
        }
    }, [selectedOptions])

    const handleDeliveryTypeClick = (e) => {
        const checkbox = e.currentTarget.previousSibling
        checkbox.checked = !checkbox.checked
        const event = e
        event.currentTarget = checkbox
        handleCheckDeliveryTypeChange(event)
    }

    const handleCheckDeliveryTypeChange = (e) => {
        const deliveryType = e.currentTarget.getAttribute('data-value')

        if (e.currentTarget.checked) {
            checkedDeliveryTypes.push(deliveryType)

            if (checkedDeliveryTypes.length === deliveryTypes.length) {
                setAllChecked(true)
            }
        } else {
            const index = checkedDeliveryTypes.findIndex(s => s === deliveryType)
            checkedDeliveryTypes.splice(index, 1)

            if (checkedDeliveryTypes.length === 0) {
                setAllChecked(false)
            }
        }

        setCheckedDeliveryTypes(checkedDeliveryTypes)
        if (onChange) {
            onChange(checkedDeliveryTypes)
        }
    }

    const handleUncheckAllChange = (e) => {
        if (allChecked) { // uncheck all
            refs.current.forEach(checkbox => {
                checkbox.checked = false
            })

            setAllChecked(false)
            setCheckedDeliveryTypes([])
        } else { // check all
            refs.current.forEach(checkbox => {
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
            collapse={!Env.isMobile()}
            className={className}
        >
            <ul className={styles.deliveryTypeList}>
                {
                    deliveryTypes.map((deliveryType, index) => (
                        <li key={deliveryType}>
                            <input ref={ref => refs.current[index] = ref} type='checkbox' data-value={deliveryType} className={styles.deliveryTypeCheckbox} onChange={handleCheckDeliveryTypeChange} />
                            <DeliveryType value={deliveryType} language={language} className={styles.deliveryTypeLabel} onClick={handleDeliveryTypeClick} />
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
