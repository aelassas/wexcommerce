import React from 'react'
import Env from '../config/env.config'
import * as Helper from '../common/Helper'

import styles from '../styles/payment-type.module.css'

export default function PaymentType({ value, className, language, onClick }) {
    return (
        <span
            className={(className ? className + ' ' : '') +
                (value === Env.PAYMENT_TYPE.CREDIT_CARD ? styles.creditCard
                    : value === Env.PAYMENT_TYPE.COD ? styles.cod
                        : value === Env.PAYMENT_TYPE.WIRE_TRANSFER ? styles.wireTransfert
                            : '')}
            onClick={(e) => {
                if (onClick) onClick(e)
            }}
        >
            {
                Helper.getPaymentType(value, language)
            }
        </span>
    )
}