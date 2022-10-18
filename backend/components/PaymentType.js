import React from 'react';
import Env from '../config/env.config';
import { strings as commonStrings } from '../lang/common';

import styles from '../styles/payment-type.module.css';

export default function PaymentType({ value }) {
    return (
        <span className={
            value === Env.PAYMENT_TYPE.CREDIT_CARD ? styles.creditCard
                : value === Env.PAYMENT_TYPE.COD ? styles.cod
                    : value === Env.PAYMENT_TYPE.WIRE_TRANSFER ? styles.wireTransfert
                        : ''}
        >
            {
                value === Env.PAYMENT_TYPE.CREDIT_CARD ? commonStrings.CREDIT_CARD
                    : value === Env.PAYMENT_TYPE.COD ? commonStrings.COD
                        : value === Env.PAYMENT_TYPE.WIRE_TRANSFER ? commonStrings.WIRE_TRANSFER
                            : ''
            }
        </span>
    );
}