
import React, { useEffect, useState } from 'react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import { TextField, IconButton, InputAdornment } from '@mui/material'
import { Clear as ClearIcon } from '@mui/icons-material'
import { fr, enUS } from "date-fns/locale"

const DatePicker = ({ label, language, value, minDate, required, onChange }) => {
    const [date, setDate] = useState()

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
                renderInput={(params) =>
                    <TextField
                        {...params}
                        variant='standard'
                        fullWidth
                        required={required}
                        autoComplete='off'
                        InputProps={{
                            ...params.InputProps,
                            endAdornment:
                                <>
                                    {
                                        value && (
                                            <InputAdornment position='end' className='d-adornment'>
                                                <IconButton
                                                    size='small'
                                                    onClick={() => {
                                                        setDate(null)
                                                        if (onChange) onChange(null)
                                                    }}>
                                                    <ClearIcon className='d-adornment-icon' />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                    {params.InputProps.endAdornment}
                                </>
                        }}
                    />
                }
            />
        </LocalizationProvider>
    )
}

export default DatePicker