'use client'

import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle } from 'react'
import {
  Autocomplete,
  TextField,
  InputAdornment,
  SxProps,
  Theme,
  TextFieldVariants,
  AutocompleteInputChangeReason,
  Chip
} from '@mui/material'
import { AccountTree as CategoryIcon } from '@mui/icons-material'

import styles from '@/styles/multiple-select.module.css'

interface MultipleSelectProps {
  label?: string
  reference?: any
  selectedOptions?: any[]
  key?: string
  required?: boolean
  options?: any[]
  ListboxProps?: (React.HTMLAttributes<HTMLUListElement> & {
    sx?: SxProps<Theme> | undefined
    ref?: React.Ref<Element> | undefined
  }),
  loading?: boolean
  multiple?: boolean
  variant?: TextFieldVariants
  readOnly?: boolean
  hidePopupIcon?: boolean
  customOpen?: boolean
  freeSolo?: boolean
  // eslint-disable-next-line no-unused-vars
  callbackFromMultipleSelect?: (newValue: any, _key: string, _reference: any) => void
  onFocus?: React.FocusEventHandler<HTMLDivElement>
  // eslint-disable-next-line no-unused-vars
  onInputChange?: (event: React.SyntheticEvent<Element, Event>, value?: string, reason?: AutocompleteInputChangeReason) => void
  onClear?: () => void
  // eslint-disable-next-line no-unused-vars
  onOpen?: (event: React.SyntheticEvent<Element, Event>) => void
}

const ListBox: React.ComponentType<React.HTMLAttributes<HTMLElement>> = forwardRef((props, ref) => {
  const { children, ...rest }: { children?: React.ReactNode } = props

  const innerRef = useRef(null)

  useImperativeHandle(ref, () => innerRef.current)

  return (
    <ul {...rest} ref={innerRef} role="list-box">
      {children}
    </ul>
  )
})

const MultipleSelect: React.FC<MultipleSelectProps> = ({
  label,
  reference,
  selectedOptions,
  key,
  required,
  options,
  ListboxProps,
  loading,
  multiple,
  variant,
  readOnly,
  hidePopupIcon,
  customOpen,
  freeSolo,
  callbackFromMultipleSelect,
  onFocus,
  onInputChange,
  onClear,
  onOpen
}) => {
  const [init, setInit] = React.useState(Array.isArray(selectedOptions) && selectedOptions.length === 0)
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')

  if (!options) {
    options = []
  }

  useEffect(() => {
    if (selectedOptions) {
      setValues(selectedOptions)
    }
    if (selectedOptions && selectedOptions.length === 0) {
      setInputValue('')
    }
  }, [selectedOptions])

  return (
    <Autocomplete
      open={customOpen ? open : undefined}
      readOnly={readOnly}
      options={options}
      value={(multiple && values) || (values.length > 0 && values[0]) || null}
      getOptionLabel={(option) => (option && option.name) || ''}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      inputValue={inputValue}
      onInputChange={(event, value) => {
        if (init) {
          if (!event) {
            setInputValue(value)
            if (onInputChange) {
              onInputChange(event, value)
            }

            setOpen(false)
            return
          }

          if (value.length === 0) {
            if (open) {
              setOpen(false)
            }
          } else if (!open) {
            setOpen(true)
          }
        } else {
          setInit(true)
        }

        setInputValue(value)
        if (onInputChange) {
          onInputChange(event)
        }
      }}
      onChange={(event: React.SyntheticEvent<Element, Event>, newValue: any) => {
        if (event && event.type === 'keydown' && 'key' in event && event.key === 'Enter') {
          return
        }
        key = key || ''
        if (multiple) {
          setValues(newValue)
          if (callbackFromMultipleSelect) {
            callbackFromMultipleSelect(newValue, key, reference)
          }
          if (newValue.length === 0 && onClear) {
            onClear()
          }
        } else {
          const value = (newValue && [newValue]) || []
          setValues(value)

          const val = (newValue && newValue.name) || ''
          setInputValue(val)
          if (onInputChange) {
            onInputChange(event, val)
          }

          if (callbackFromMultipleSelect) {
            callbackFromMultipleSelect(value, key, reference)
          }
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
        const { inputProps } = params
        inputProps.autoComplete = 'off'

        return (
          <TextField
            {...params}
            label={label}
            variant={variant || 'standard'}
            required={required && values && values.length === 0}
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <CategoryIcon />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }
            }}
          />
        )
      }}
      onClose={() => {
        setOpen(false)
      }}
      renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => (
        <Chip {...getTagProps({ index })} key={option._id} label={option.name} />
      ))}
      renderOption={(props, option) => {
        if ('key' in props) {
          delete props.key
        }
        const _props = props as React.HTMLAttributes<HTMLLIElement>

        return (
          <li key={option._id} className={`${props.className} ${styles.msOption}`} {..._props}>
            <span className={styles.optionImage}>
              <CategoryIcon />
            </span>
            <span className={styles.optionName}>{option.name}</span>
          </li>
        )
      }}
      onFocus={onFocus || undefined}
      onOpen={onOpen || undefined}
      slotProps={{
        listbox: {
          component: ListBox,
          ...ListboxProps
        }
      }}
    />
  )
}

export default MultipleSelect
