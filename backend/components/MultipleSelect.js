import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle } from 'react'
import {
    Autocomplete,
    TextField
} from '@mui/material'
import {
    AccountTree as CategoryIcon
} from '@mui/icons-material'

import styles from '../styles/multiple-select.module.css'

const ListBox =
    forwardRef(function ListBoxBase(props, ref) {
        const { children, ...rest } = props

        const innerRef = useRef(null)

        useImperativeHandle(ref, () => innerRef.current)
        return (
            // eslint-disable-next-line
            <ul {...rest} ref={innerRef} role='list-box'>{children}</ul>
        )
    })

export default function MultipleSelect({
    label,
    callbackFromMultipleSelect,
    reference,
    selectedOptions,
    key,
    required,
    options,
    ListboxProps,
    onFocus,
    onInputChange,
    onClear,
    loading,
    multiple,
    freeSolo,
    type,
    variant,
    onOpen,
    readOnly,
    hidePopupIcon,
    customOpen
}) {
    const [init, setInit] = React.useState(selectedOptions && selectedOptions.length === 0)
    const [open, setOpen] = React.useState(false)
    const [values, setValues] = useState([])
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        setValues(selectedOptions)
        if (selectedOptions && selectedOptions.length === 0) setInputValue('')
    }, [selectedOptions, type])

    return (
        <Autocomplete
            open={customOpen ? open : undefined}
            readOnly={readOnly}
            options={options}
            value={multiple ? values : (values && values.length > 0 ? values[0] : null)}
            getOptionLabel={(option) => (option && option.name) || ''}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            inputValue={inputValue}
            onInputChange={(event, value) => {
                if (init) {
                    if (!event) {
                        setInputValue(value)
                        setOpen(false)
                        return
                    }

                    if (value.length === 0) {
                        if (open) setOpen(false)
                    } else {
                        if (!open) setOpen(true)
                    }
                } else {
                    setInit(true)
                }

                setInputValue(value)
                if (onInputChange) onInputChange(event)
            }}
            onClose={() => {
                setOpen(false)
            }}
            onChange={(event, newValue) => {

                if (event && event.type === 'keydown' && event.key === 'Enter') {
                    return
                }

                if (multiple) {
                    setValues(newValue)
                    callbackFromMultipleSelect(newValue, key, reference)
                    if (newValue.length === 0 && onClear) {
                        onClear()
                    }
                } else {
                    const value = (newValue && [newValue]) || []
                    setValues(value)
                    callbackFromMultipleSelect(value, key, reference)
                    if (!newValue) {
                        if (onClear) {
                            onClear()
                        }
                    }
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault()
                }
            }}
            clearOnBlur={false}
            clearOnEscape={false}
            loading={loading}
            multiple={multiple}
            freeSolo={freeSolo}
            handleHomeEndKeys={false}
            popupIcon={hidePopupIcon ? null : undefined}
            renderInput={(params) => {

                return (
                    <TextField
                        {...params}
                        label={label}
                        variant={variant || 'standard'}
                        required={required && values && values.length === 0}
                    />
                )
            }}
            renderOption={(props, option, { selected }) => {

                return (
                    <li {...props} className={`${props.className} ${styles.msOption}`}>
                        <span className={styles.optionImage}>
                            <CategoryIcon />
                        </span>
                        <span className={styles.optionName}>{option.name}</span>
                    </li>
                )
            }}
            ListboxProps={ListboxProps || null}
            onFocus={onFocus || null}
            ListboxComponent={ListBox}
            onOpen={onOpen || null}
        />
    )
}
