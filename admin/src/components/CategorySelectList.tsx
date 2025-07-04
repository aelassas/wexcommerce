'use client'

import React, { useState } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as CategoryService from '@/lib/CategoryService'
import * as helper from '@/utils/helper'
import MultipleSelect from './MultipleSelect'
import { TextFieldVariants } from '@mui/material'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'

interface CategorySelectListProps {
  multiple?: boolean
  label?: string
  required?: boolean
  readOnly?: boolean
  hidePopupIcon?: boolean
  freeSolo?: boolean
  variant?: TextFieldVariants
  selectedOptions?: wexcommerceTypes.Option[]
  // eslint-disable-next-line no-unused-vars
  onChange: (values: wexcommerceTypes.Option[]) => void
}

const CategorySelectList: React.FC<CategorySelectListProps> = (
  {
    multiple,
    label,
    required,
    readOnly,
    hidePopupIcon,
    freeSolo,
    variant,
    selectedOptions,
    onChange
  }
) => {
  const { language } = useLanguageContext() as LanguageContextType
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [rows, setRows] = useState<wexcommerceTypes.CategoryInfo[]>([])

  const fetchCategories = async () => {
    if (language) {
      try {
        setLoading(true)
        const categories = await CategoryService.getCategories(language)
        setRows(categories)
        setLoading(false)
      } catch (err) {
        helper.error(err)
      }
    }
  }

  const handleChange = (values: wexcommerceTypes.Option[]) => {
    if (onChange) {
      onChange(values)
    }
  }

  return (
    <MultipleSelect
      loading={loading}
      label={label || ''}
      callbackFromMultipleSelect={handleChange}
      options={rows}
      selectedOptions={selectedOptions || []}
      required={required || false}
      multiple={multiple}
      readOnly={readOnly}
      freeSolo={freeSolo}
      hidePopupIcon={hidePopupIcon}
      variant={variant || 'standard'}
      onFocus={async () => {
        await fetchCategories()
      }}
      onInputChange={
        (event) => {
          const value = (event && event.target && 'value' in event.target && event.target.value as string) || ''

          if (value !== keyword) {
            setKeyword(value)
          }
        }
      }
      onClear={
        () => {
          setKeyword('')
        }
      }
    />
  )
}

export default CategorySelectList
