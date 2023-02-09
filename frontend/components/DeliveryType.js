import React from 'react'
import Env from '../config/env.config'
import * as Helper from '../common/Helper'

import styles from '../styles/delivery-type.module.css'

const DeliveryType = ({ value, className, language, onClick }) => {
    return (
        <span
            className={(className ? className + ' ' : '') +
                (value === Env.DELIVERY_TYPE.SHIPPING ? styles.shipping
                    : value === Env.DELIVERY_TYPE.WITHDRAWAL ? styles.withdrawal
                        : '')}
            onClick={(e) => {
                if (onClick) onClick(e)
            }}
        >
            {
                Helper.getDeliveryType(value, language)
            }
        </span>
    )
}

export default DeliveryType