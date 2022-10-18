import React from 'react';
import Env from '../config/env.config';
import { strings } from '../lang/order-status';

import styles from '../styles/order-status.module.css';

export default function OrderStatus({ value }) {
    return (
        <span className={
            value === Env.ORDER_STATUS.PENDING ? styles.pending
                : value === Env.ORDER_STATUS.PAID ? styles.paid
                    : value === Env.ORDER_STATUS.CONFIRMED ? styles.confirmed
                        : value === Env.ORDER_STATUS.IN_PROGRESS ? styles.inProgress
                            : value === Env.ORDER_STATUS.SHIPPED ? styles.shipped
                                : value === Env.ORDER_STATUS.CANCELLED ? styles.cancelled
                                    : ''}
        >
            {
                value === Env.ORDER_STATUS.PENDING ? strings.PENDING
                    : value === Env.ORDER_STATUS.PAID ? strings.PAID
                        : value === Env.ORDER_STATUS.CONFIRMED ? strings.CONFIRMED
                            : value === Env.ORDER_STATUS.IN_PROGRESS ? strings.IN_PROGRESS
                                : value === Env.ORDER_STATUS.SHIPPED ? strings.SHIPPED
                                    : value === Env.ORDER_STATUS.CANCELLED ? strings.CANCELLED
                                        : ''
            }
        </span>
    );
}