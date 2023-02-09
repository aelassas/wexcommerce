import React from 'react'
import Env from '../config/env.config'
import * as Helper from '../common/Helper'

import styles from '../styles/order-status.module.css'

export default function OrderStatus({ value, language, className, onClick }) {
    return (
        <span
            className={(className ? className + ' ' : '') +
                (value === Env.ORDER_STATUS.PENDING ? styles.pending
                    : value === Env.ORDER_STATUS.PAID ? styles.paid
                        : value === Env.ORDER_STATUS.CONFIRMED ? styles.confirmed
                            : value === Env.ORDER_STATUS.IN_PROGRESS ? styles.inProgress
                                : value === Env.ORDER_STATUS.SHIPPED ? styles.shipped
                                    : value === Env.ORDER_STATUS.CANCELLED ? styles.cancelled
                                        : '')}
            onClick={(e) => {
                if (onClick) onClick(e)
            }}
        >
            {
                Helper.getOrderStatus(value, language)
            }
        </span>
    )
}