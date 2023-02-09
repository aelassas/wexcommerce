import React, { useState, useEffect } from 'react'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/order-date-filter'
import Env from '../config/env.config'
import Accordion from './Accordion'
import { FormControl, Button } from '@mui/material'
import DatePicker from './DatePicker'
import * as Helper from '../common/Helper'

import styles from '../styles/order-date-filter.module.css'

export default function OrderDateFilter({ language, from, to, onSubmit, className }) {
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)
    const [minDate, setMinDate] = useState()

    useEffect(() => {
        if (language) {
            Helper.setLanguage(strings, language)
        }
    }, [language])

    useEffect(() => {
        if (from) {
            setFromDate(from)
        } else {
            setFromDate(null)
        }
    }, [from])

    useEffect(() => {
        if (to) {
            setToDate(to)
        } else {
            setToDate(null)
        }
    }, [to])

    const handleSubmit = (e) => {
        e.preventDefault()

        if (onSubmit) onSubmit({ from: fromDate, to: toDate })
    }

    return (
        <Accordion
            title={strings.TITLE}
            collapse={!Env.isMobile()}
            className={className}
        >
            <form onSubmit={handleSubmit} className={styles.form}>
                <FormControl fullWidth margin="dense">
                    <DatePicker
                        label={strings.FROM}
                        value={fromDate}
                        onChange={(from) => {
                            setFromDate(from)
                            setMinDate(from)
                        }}
                        language={language}
                    />
                </FormControl>
                <FormControl fullWidth margin="dense">
                    <DatePicker
                        label={strings.TO}
                        value={toDate}
                        minDate={minDate}
                        onChange={(to) => {
                            setToDate(to)
                        }}
                        language={language}
                    />
                </FormControl>
                <Button
                    type="submit"
                    variant="contained"
                    className={`btn-primary ${styles.btn}`}
                    fullWidth
                >
                    {commonStrings.SEARCH}
                </Button>
            </form>

        </Accordion>
    )
}
