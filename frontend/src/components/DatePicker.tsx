'use client'

import React, { useEffect, useState } from 'react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import { fr, enUS } from 'date-fns/locale'
import { TextFieldVariants } from '@mui/material'
import { DateValidationError } from '@mui/x-date-pickers'

interface DatePickerProps {
  value?: Date | null
  label?: string
  minDate?: Date | null
  maxDate?: Date
  required?: boolean
  language?: string
  variant?: TextFieldVariants
  readOnly?: boolean
  onChange?: (value: Date | null) => void
  onError?: (error: DateValidationError, value: Date | null) => void
}

const DatePicker: React.FC<DatePickerProps> = ({
  value: dateValue,
  label,
  minDate: minDateValue,
  maxDate,
  required,
  language,
  variant,
  readOnly,
  onChange,
  onError
}) => {
  const [value, setValue] = useState<Date | null>(null)
  const [minDate, setMinDate] = useState<Date>()

  useEffect(() => {
    setValue(dateValue || null)
  }, [dateValue])

  useEffect(() => {
    if (minDateValue) {
      const _minDate = new Date(minDateValue)
      _minDate.setHours(10, 0, 0, 0)
      setMinDate(_minDate)
    } else {
      setMinDate(undefined)
    }
  }, [minDateValue])

  return (
    <LocalizationProvider adapterLocale={language === 'fr' ? fr : enUS} dateAdapter={AdapterDateFns}>
      <MuiDatePicker
        label={label}
        views={['year', 'month', 'day']}
        value={value}
        readOnly={readOnly}
        onChange={(_value) => {
          setValue(_value)

          if (onChange) {
            onChange(_value)
          }

          if (_value && minDate && _value < minDate && onError) {
            onError('minDate', _value)
          }
        }}
        onError={onError}
        minDate={minDate}
        maxDate={maxDate}
        slotProps={{
          textField: {
            variant: variant || 'standard',
            required,
          },
          actionBar: {
            actions: ['accept', 'cancel', 'clear'],
          },
        }}
      />
    </LocalizationProvider>
  )
}

export default DatePicker
