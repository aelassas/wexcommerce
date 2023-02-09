import React, { useState, useRef, useEffect } from 'react'
import { strings as commonStrings } from '../lang/common'
import Env from '../config/env.config'
import Accordion from './Accordion'
import OrderStatus from './OrderStatus'
import * as Helper from '../common/Helper'

import styles from '../styles/order-status-filter.module.css'

const OrderStatusFilter = ({ language, selectedOptions, onChange, className }) => {
    const statuses = Helper.getOrderStatuses()
    const [checkedStatuses, setCheckedStatuses] = useState(statuses)
    const [allChecked, setAllChecked] = useState(true)
    const refs = useRef([])

    useEffect(() => {
        const statuses = Helper.getOrderStatuses()

        if (selectedOptions) {
            refs.current.forEach(checkbox => {
                const status = checkbox.getAttribute('data-value')
                if (selectedOptions.includes(status)) {
                    checkbox.checked = true
                }

                setAllChecked(selectedOptions.length === statuses.length)
                setCheckedStatuses(selectedOptions)
            })
        } else {
            refs.current.forEach(checkbox => {
                checkbox.checked = true

                setAllChecked(true)
                setCheckedStatuses(statuses)
            })
        }
    }, [selectedOptions])

    const handleOrderStatusClick = (e) => {
        const checkbox = e.currentTarget.previousSibling
        checkbox.checked = !checkbox.checked
        const event = e
        event.currentTarget = checkbox
        handleCheckOrderStatusChange(event)
    }

    const handleCheckOrderStatusChange = (e) => {
        const status = e.currentTarget.getAttribute('data-value')

        if (e.currentTarget.checked) {
            checkedStatuses.push(status)

            if (checkedStatuses.length === statuses.length) {
                setAllChecked(true)
            }
        } else {
            const index = checkedStatuses.findIndex(s => s === status)
            checkedStatuses.splice(index, 1)

            if (checkedStatuses.length === 0) {
                setAllChecked(false)
            }
        }

        setCheckedStatuses(checkedStatuses)
        if (onChange) {
            onChange(checkedStatuses)
        }
    }

    const handleUncheckAllChange = (e) => {
        if (allChecked) { // uncheck all
            refs.current.forEach(checkbox => {
                checkbox.checked = false
            })

            setAllChecked(false)
            setCheckedStatuses([])
        } else { // check all
            refs.current.forEach(checkbox => {
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
            collapse={!Env.isMobile()}
            className={className}
        >
            <ul className={styles.statusList}>
                {
                    statuses.map((status, index) => (
                        <li key={status}>
                            <input ref={ref => refs.current[index] = ref} type='checkbox' data-value={status} className={styles.statusCheckbox} onChange={handleCheckOrderStatusChange} />
                            <OrderStatus value={status} language={language} className={styles.statusLabel} onClick={handleOrderStatusClick} />
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
