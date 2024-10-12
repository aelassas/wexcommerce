'use client'

import React, { useState } from 'react'
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
import env from '@/config/env.config'
import * as helper from '@/common/helper'
import * as CategoryService from '@/lib/CategoryService'
import { strings } from '@/lang/create-category'
import { strings as commonStrings } from '@/lang/common'

import styles from '@/styles/create-category.module.css'
import ImageEditor from '@/components/ImageEditor'

const CreateCategory: React.FC = () => {
  const router = useRouter()

  const [values, setValues] = useState<wexcommerceTypes.Value[]>([])
  const [valueErrors, setValueErrors] = useState<boolean[]>([])
  const [image, setImage] = useState<ImageItem>()
  const [featured, setFeatured] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      let isValid = true

      const _valueErrors = wexcommerceHelper.cloneArray(valueErrors) as boolean[]

      for (let i = 0; i < _valueErrors.length; i++) {
        _valueErrors[i] = false
      }

      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        const _isValid = (await CategoryService.validate(value)) === 200
        isValid = isValid && _isValid
        if (!_isValid) {
          _valueErrors[i] = true
        }
      }

      setValueErrors(_valueErrors)

      if (isValid) {
        const payload: wexcommerceTypes.UpsertCategoryPayload = {
          values,
          image: image?.filename,
          featured,
        }
        const status = await CategoryService.create(payload)

        if (status === 200) {
          const _values = wexcommerceHelper.cloneArray(values) as wexcommerceTypes.Value[]
          for (let i = 0; i < _values.length; i++) {
            _values[i].value = ''
          }
          setValues(_values)
          setImage(undefined)
          setFeatured(false)

          router.refresh()
          helper.info(strings.CATEGORY_CREATED)
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
      <h1 className={styles.formTitle}> {strings.NEW_CATEGORY_HEADING} </h1>
      <form onSubmit={handleSubmit}>
        <ImageEditor
          type="category"
          image={image}
          onMainImageUpsert={(img) => setImage(img)}
        />
        {
          env.LANGUAGES.map((language, index) => (
            <FormControl key={index} fullWidth margin="dense">
              <InputLabel className='required'>{language.label}</InputLabel>
              <Input
                type="text"
                value={(values[index] && values[index].value) || ''}
                error={valueErrors[index]}
                required
                onChange={(e) => {
                  const _values = wexcommerceHelper.cloneArray(values) as wexcommerceTypes.Value[]
                  _values[index] = { language: language.code, value: e.target.value }
                  const _valueErrors = wexcommerceHelper.cloneArray(valueErrors) as boolean[]
                  _valueErrors[index] = false
                  setValues(_values)
                  setValueErrors(_valueErrors)
                }}
                autoComplete="off"
              />
              <FormHelperText error={valueErrors[index]}>
                {(valueErrors[index] && strings.INVALID_CATEGORY) || ''}
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
            {commonStrings.CREATE}
          </Button>
          <Button
            variant="contained"
            className='btn-secondary btn-margin-bottom'
            size="small"
            onClick={async () => {
              try {
                if (image) {
                  await CategoryService.deleteTempImage(image.filename)
                }
              } catch (err) {
                helper.error(err)
              }
              router.push('/categories')
            }}
          >
            {commonStrings.CANCEL}
          </Button>
        </div>
      </form>

    </Paper>
  )
}

export default CreateCategory
