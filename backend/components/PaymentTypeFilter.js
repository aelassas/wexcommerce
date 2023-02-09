import React, { useState, useRef, useEffect } from 'react'
import { strings as commonStrings } from '../lang/common'
import Env from '../config/env.config'
import Accordion from './Accordion'
import PaymentType from './PaymentType'
import * as Helper from '../common/Helper'

import styles from '../styles/payment-type-filter.module.css'

export default function PaymentTypeFilter({ selectedOptions, language, onChange, className }) {
    const paymentTypes = Helper.getPaymentTypes()
    const [checkedPaymentTypes, setCheckedPaymentTypes] = useState(paymentTypes)
    const [allChecked, setAllChecked] = useState(true)
    const refs = useRef([])

    useEffect(() => {
        const paymentTypes = Helper.getPaymentTypes()

        if (selectedOptions) {
            refs.current.forEach(checkbox => {
                const paymentType = checkbox.getAttribute('data-value')
                if (selectedOptions.includes(paymentType)) {
                    checkbox.checked = true
                }

                setAllChecked(selectedOptions.length === paymentTypes.length)
                setCheckedPaymentTypes(selectedOptions)
            })
        } else {
            refs.current.forEach(checkbox => {
                checkbox.checked = true

                setAllChecked(true)
                setCheckedPaymentTypes(paymentTypes)
            })
        }
    }, [selectedOptions])

    const handlePaymentTypeClick = (e) => {
        const checkbox = e.currentTarget.previousSibling
        checkbox.checked = !checkbox.checked
        const event = e
        event.currentTarget = checkbox
        handleCheckPaymentTypeChange(event)
    }

    const handleCheckPaymentTypeChange = (e) => {
        const paymentType = e.currentTarget.getAttribute('data-value')

        if (e.currentTarget.checked) {
            checkedPaymentTypes.push(paymentType)

            if (checkedPaymentTypes.length === paymentTypes.length) {
                setAllChecked(true)
            }
        } else {
            const index = checkedPaymentTypes.findIndex(s => s === paymentType)
            checkedPaymentTypes.splice(index, 1)

            if (checkedPaymentTypes.length === 0) {
                setAllChecked(false)
            }
        }

        setCheckedPaymentTypes(checkedPaymentTypes)
        if (onChange) {
            onChange(checkedPaymentTypes)
        }
    }

    const handleUncheckAllChange = (e) => {
        if (allChecked) { // uncheck all
            refs.current.forEach(checkbox => {
                checkbox.checked = false
            })

            setAllChecked(false)
            setCheckedPaymentTypes([])
        } else { // check all
            refs.current.forEach(checkbox => {
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
            collapse={!Env.isMobile()}
            className={className}
        >
            <ul className={styles.paymentTypeList}>
                {
                    paymentTypes.map((paymentType, index) => (
                        <li key={paymentType}>
                            <input ref={ref => refs.current[index] = ref} type='checkbox' data-value={paymentType} className={styles.paymentTypeCheckbox} onChange={handleCheckPaymentTypeChange} />
                            <PaymentType value={paymentType} language={language} className={styles.paymentTypeLabel} onClick={handlePaymentTypeClick} />
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
