'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Input,
  InputLabel,
  FormControl,
  FormControlLabel,
  Button,
  Paper,
  Switch,
} from '@mui/material'
import RichTextEditor from '@/components/RichTextEditor'
import * as wexcommerceTypes from ':wexcommerce-types'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { CurrencyContextType, useCurrencyContext } from '@/context/CurrencyContext'
import * as ProductService from '@/lib/ProductService'
import { strings } from '@/lang/create-product'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'
import CategorySelectList from '@/components/CategorySelectList'
import Error from '@/components/Error'
import ImageEditor from '@/components/ImageEditor'

import styles from '@/styles/create-product.module.css'

const CreateProduct: React.FC = () => {
  const router = useRouter()

  const { language } = useLanguageContext() as LanguageContextType
  const { currency } = useCurrencyContext() as CurrencyContextType

  const [name, setName] = useState('')
  const [initialDescription, setInitialDescription] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionError, setDescriptionError] = useState(false)
  const [categories, setCategories] = useState<wexcommerceTypes.CategoryInfo[]>([])
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [soldOut, setSoldOut] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [image, setImage] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageError, setImageError] = useState(false)
  const [featured, setFeatured] = useState(false)

  const [imageViewerOpen, setImageViewerOpen] = useState(false)

  const createProductRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (createProductRef.current) {
      createProductRef.current.onwheel = (e: globalThis.WheelEvent) => {
        if (imageViewerOpen) {
          e.preventDefault()
        }
      }
    }
  }, [imageViewerOpen])

  const handleRichTextEditorChange = (value: string) => {
    setDescriptionError(!value)
    setDescription(value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      if (!image) {
        setImageError(true)
        return
      }

      if (descriptionError) {
        return
      }

      const _categories = categories.map(c => c._id)
      const _price = Number.parseFloat(price)
      const _quantity = Number.parseInt(quantity)

      const data: wexcommerceTypes.CreateProductPayload = {
        name,
        description,
        categories: _categories,
        price: _price,
        quantity: _quantity,
        soldOut,
        hidden,
        image,
        images,
        featured,
      }

      const res = await ProductService.createProduct(data)

      if (res.status === 200) {
        // router.push('/products')

        setName('')
        setInitialDescription('<p></p>')
        setDescription('')
        setCategories([])
        setPrice('')
        setQuantity('')
        setSoldOut(false)
        setHidden(false)
        setImage('')
        setImages([])
        setFeatured(false)

        router.refresh()
        helper.info(strings.PRODUCT_CREATED)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  return language && currency && (
    <div ref={createProductRef}>
      <Paper className={styles.form} elevation={10}>
        <form onSubmit={handleSubmit}>

          <ImageEditor
            type="product"
            title={strings.IMAGES}
            onMainImageUpsert={(img) => {
              setImage(img.filename)
              setImageError(false)
            }}
            onAdd={(img) => {
              images.push(img.filename)
              setImages(images)
            }}
            onDelete={(img) => {
              images.splice(images.indexOf(img.filename), 1)
              setImages(images)
            }}
            onImageViewerOpen={() => {
              setImageViewerOpen(true)
              document.body.classList.add('stop-scrolling')
            }}
            onImageViewerClose={() => {
              setImageViewerOpen(false)
              document.body.classList.remove('stop-scrolling')
            }}
            image={image ? ({ filename: image, temp: true }) : undefined}
            images={images.map((img) => ({ filename: img, temp: true }))}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel className="required">{strings.NAME}</InputLabel>
            <Input
              type="text"
              value={name}
              required
              onChange={(e) => {
                setName(e.target.value)
              }}
              autoComplete="off"
            />
          </FormControl>

          <FormControl fullWidth margin="dense" className={styles.editorField}>
            <span className={`${styles.label} required`}>{strings.DESCRIPTION}</span>

            <RichTextEditor
              language={language}
              className={styles.editor}
              value={initialDescription}
              onChange={handleRichTextEditorChange}
            />
          </FormControl>

          <FormControl fullWidth margin="dense">
            <CategorySelectList
              label={strings.CATEGORIES}
              required
              multiple
              variant="standard"
              selectedOptions={categories}
              onChange={(values) => {
                setCategories(values as wexcommerceTypes.CategoryInfo[])
              }}
            />
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel className="required">{`${strings.PRICE} (${currency})`}</InputLabel>
            <Input
              type="number"
              required
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
              }}
            />
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel className="required">{commonStrings.QUANTITY}</InputLabel>
            <Input
              type="number"
              inputProps={{ min: 0, step: 1 }}
              required
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value)
              }}
            />
          </FormControl>

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

          <FormControl fullWidth margin="dense">
            <FormControlLabel
              control={
                <Switch checked={soldOut}
                  onChange={(e) => {
                    setSoldOut(e.target.checked)
                  }}
                  color="primary" />
              }
              label={commonStrings.SOLD_OUT}
            />
          </FormControl>

          <FormControl fullWidth margin="dense">
            <FormControlLabel
              control={
                <Switch checked={hidden}
                  onChange={(e) => {
                    setHidden(e.target.checked)
                  }}
                  color="primary" />
              }
              label={commonStrings.HIDDEN}
            />
          </FormControl>

          <div className="buttons">
            <Button
              type="submit"
              variant="contained"
              className="btn-primary btn-margin-bottom"
              size="small"
            >
              {commonStrings.CREATE}
            </Button>
            <Button
              variant="contained"
              className="btn-secondary btn-margin-bottom"
              size="small"
              onClick={async () => {
                try {
                  if (image) {
                    await ProductService.deleteTempImage(image)
                  }
                  for (const tempImage of images) {
                    await ProductService.deleteTempImage(tempImage)
                  }
                } catch (err) {
                  helper.error(err)
                }
                router.push('/products')
              }}
            >
              {commonStrings.CANCEL}
            </Button>
          </div>

          {imageError && <Error message={strings.IMAGE_REQUIRED} className={styles.error} />}
          {descriptionError && <Error message={strings.DESCRIPTION_REQUIRED} className={styles.error} />}
        </form>

      </Paper>
    </div>
  )
}

export default CreateProduct
