'use client'

import React, { useState, useEffect } from 'react'
import { FormControl, Button } from '@mui/material'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/order-date-filter'
import env from '@/config/env.config'
import Accordion from './Accordion'
import DatePicker from './DatePicker'

import styles from '@/styles/order-date-filter.module.css'

interface OrderDateFilterProps {
  from?: Date | null
  to?: Date | null
  onSubmit: (value: { from: Date | null, to: Date | null }) => void
  className?: string
}

const OrderDateFilter: React.FC<OrderDateFilterProps> = (
  {
    from,
    to,
    onSubmit,
    className
  }
) => {
  const { language } = useLanguageContext() as LanguageContextType
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [minDate, setMinDate] = useState<Date | null>()

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (onSubmit) {
      onSubmit({ from: fromDate, to: toDate })
    }
  }

  return (
    <Accordion
      title={strings.TITLE}
      collapse={!env.isMobile()}
      className={className}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormControl fullWidth margin="normal" size="small">
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
        <FormControl fullWidth margin="normal" size="small">
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

export default OrderDateFilter
