'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { strings } from '@/lang/category'
import { strings as ccStrings } from '@/lang/create-category'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'
import env from '@/config/env.config'
import * as CategoryService from '@/lib/CategoryService'

import styles from '@/styles/category.module.css'
import ImageEditor from '@/components/ImageEditor'

interface CategoryFormProps {
  category: wexcommerceTypes.CategoryInfo
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category }) => {
  const router = useRouter()

  const [image, setImage] = useState<ImageItem>()
  const [values, setValues] = useState<wexcommerceTypes.Value[]>([])
  const [valueErrors, setValueErrors] = useState<boolean[]>([])
  const [featured, setFeatured] = useState(false)

  useEffect(() => {
    if (category) {
      env.LANGUAGES.forEach((lang) => {
        if (!category.values!.some(value => value.language === lang.code)) {
          category.values!.push({ language: lang.code, value: '' })
        }
      })

      const _values = category.values!.map((value) => ({ language: value.language, value: value.value }))
      setValues(_values)

      const _valueErrors = category.values!.map(() => false)
      setValueErrors(_valueErrors)

      if (category.image) {
        setImage({ filename: category.image, temp: false })
      }

      setFeatured(category.featured)
    }
  }, [category])

  useEffect(() => {
    const checkValue = () => {
      let _valueChanged = false

      if (category) {
        for (let i = 0; i < values.length; i++) {
          const value = values[i]
          if (value.value !== category.values![i].value) {
            _valueChanged = true
            break
          }
        }
      }

      return _valueChanged
    }

    checkValue()
  }, [category, values])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      let isValid = true

      if (!category) {
        helper.error()
        return
      }

      const _valueErrors = wexcommerceHelper.cloneArray(valueErrors) as boolean[]

      for (let i = 0; i < _valueErrors.length; i++) {
        _valueErrors[i] = false
      }

      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        if (value.value !== category.values![i].value) {
          const _isValid = (await CategoryService.validate(value)) === 200
          isValid = isValid && _isValid
          if (!_isValid) {
            _valueErrors[i] = true
          }
        }
      }

      setValueErrors(_valueErrors)

      if (isValid) {
        const payload: wexcommerceTypes.UpsertCategoryPayload = {
          values,
          featured,
        }
        const status = await CategoryService.update(category._id, payload)

        if (status === 200) {
          const _category = wexcommerceHelper.clone(category) as wexcommerceTypes.CategoryInfo
          for (let i = 0; i < values.length; i++) {
            const value = values[i]
            _category.values![i].value = value.value
          }
          _category.image = image?.filename

          router.refresh()
          helper.info(strings.CATEGORY_UPDATED)
        } else {
          helper.error()
        }
      }
    } catch (err) {
      helper.error(err)
    }
  }

  return (
    <Paper className={styles.form} elevation={10}>
      <h1 className={styles.formTitle}> {strings.UPDATE_CATEGORY_HEADING} </h1>
      <form onSubmit={handleSubmit}>
        <ImageEditor
          type="category"
          categoryId={category._id}
          image={image}
          onMainImageUpsert={(img) => {
            setImage(img)
            router.refresh()
          }}
        />

        {
          category.values!.map((value, index) => (
            <FormControl key={index} fullWidth margin="dense">
              <InputLabel className='required'>{env.LANGUAGES.filter(l => l.code === value.language)[0].label}</InputLabel>
              <Input
                type="text"
                value={(values[index] && values[index].value) || ''}
                error={valueErrors[index]}
                required
                onChange={(e) => {
                  const _values = wexcommerceHelper.cloneArray(values) as wexcommerceTypes.Value[]
                  _values[index].value = e.target.value
                  const _valueErrors = wexcommerceHelper.cloneArray(valueErrors) as boolean[]
                  _valueErrors[index] = false
                  setValues(_values)
                  setValueErrors(_valueErrors)
                }}
                autoComplete="off"
              />
              <FormHelperText error={valueErrors[index]}>
                {(valueErrors[index] && ccStrings.INVALID_CATEGORY) || ''}
              </FormHelperText>
            </FormControl>
          ))
        }

        <FormControl fullWidth margin="dense">
          <FormControlLabel
            control={
              <Switch checked={featured}
                onChange={(e) => {
                  setFeatured(e.target.checked)
                }}
                color="primary" />
            }
            label={commonStrings.FEATURED}
          />
        </FormControl>

        <div className="buttons">
          <Button
            type="submit"
            variant="contained"
            className='btn-primary btn-margin-bottom'
            size="small"
          >
            {commonStrings.SAVE}
          </Button>
          <Button
            variant="contained"
            className='btn-secondary btn-margin-bottom'
            size="small"
            onClick={() => {
              router.push('/categories')
              router.refresh()
            }}
          >
            {commonStrings.CANCEL}
          </Button>
        </div>
      </form>

    </Paper>
  )

}

export default CategoryForm
