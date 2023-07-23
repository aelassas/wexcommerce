
import React, { useEffect, useState } from 'react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import { fr, enUS } from "date-fns/locale"

export default function DatePicker({ label, language, value, minDate, required, onChange }) {
    const [date, setDate] = useState(value || null)

    useEffect(() => {
        setDate(value)
    }, [value])

    return (
        <LocalizationProvider adapterLocale={language === 'fr' ? fr : enUS} dateAdapter={AdapterDateFns}>
            <MuiDatePicker
                label={label}
                inputFormat='dd-MM-yyyy'
                views={['year', 'month', 'day']}
                mask='__-__-____'
                value={date}
                onChange={(value) => {
                    setDate(value)
                    if (onChange) onChange(value)
                }}
                minDate={minDate}
                defaultCalendarMonth={minDate}
                required={required}
                slotProps={{
                    textField: {
                        variant: 'standard',
                    },
                    actionBar: {
                        actions: ['accept', 'cancel', 'today', 'clear']
                    }
                }}
            />
        </LocalizationProvider>
    )
}