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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import RichTextEditor from '@/components/RichTextEditor'
import * as wexcommerceTypes from ':wexcommerce-types'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { CurrencyContextType, useCurrencyContext } from '@/context/CurrencyContext'
import * as ProductService from '@/lib/ProductService'
import { strings as commonStrings } from '@/lang/common'
import { strings as cpStrings } from '@/lang/create-product'
import { strings } from '@/lang/product'
import * as helper from '@/common/helper'
import CategorySelectList from '@/components/CategorySelectList'
import Error from '@/components/Error'
import ImageEditor from '@/components/ImageEditor'

import styles from '@/styles/product.module.css'

interface CreateProductFormProps {
  product: wexcommerceTypes.Product
}

const CreateProductForm: React.FC<CreateProductFormProps> = ({ product }) => {
  const router = useRouter()

  const { language } = useLanguageContext() as LanguageContextType
  const { currency } = useCurrencyContext() as CurrencyContextType

  const [productId, setProductId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionError, setDescriptionError] = useState(false)
  const [categories, setCategories] = useState<wexcommerceTypes.CategoryInfo[]>([])
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [soldOut, setSoldOut] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [image, setImage] = useState('')
  const [tempImage, setTempImage] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [tempImages, setTempImages] = useState<string[]>([])
  const [imageUpdated, setImageUpdated] = useState(false)
  const [openInfoDialog, setOpenInfoDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [featured, setFeatured] = useState(false)

  const createProductRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setProductId(product._id)
    setName(product.name)
    setDescription(product.description)
    setCategories(product.categories as wexcommerceTypes.CategoryInfo[])
    setPrice(product.price.toString())
    setQuantity(product.quantity.toString())
    setSoldOut(product.soldOut)
    setHidden(product.hidden)
    setImage(product.image!)
    setImages(product.images || [])
    setFeatured(product.featured)
    setTempImages([])
    setVisible(true)
  }, [product])

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
    setDescriptionError(!!!value)
    setDescription(value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {

      if (descriptionError) {
        return
      }

      const _categories = categories.map(c => c._id)
      const _price = Number.parseFloat(price)
      const _quantity = Number.parseInt(quantity)

      const data: wexcommerceTypes.UpdateProductPayload = {
        _id: productId,
        name,
        description,
        categories: _categories,
        price: _price,
        quantity: _quantity,
        soldOut,
        hidden,
        images,
        tempImages,
        featured,
      }

      if (tempImage) {
        data.image = tempImage
      }

      const status = await ProductService.updateProduct(data)

      if (status === 200) {

        router.refresh()
        helper.info(commonStrings.UPDATED)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  return visible && (
    <Paper className={styles.form} elevation={10}>
      <form onSubmit={handleSubmit}>

        <ImageEditor
          type="product"
          title={cpStrings.IMAGES}
          onMainImageUpsert={(img) => {
            setImage(img.filename)
            setTempImage(img.filename)
            setImageUpdated(true)
          }}
          onAdd={(img) => {
            tempImages.push(img.filename)
            setTempImages(tempImages)
          }}
          onDelete={(img) => {
            if (img.temp) {
              tempImages.splice(tempImages.indexOf(img.filename), 1)
              setTempImages(tempImages)
            } else {
              images.splice(images.indexOf(img.filename), 1)
              setImages(images)
            }
          }}
          onImageViewerOpen={() => {
            setImageViewerOpen(true)
            document.body.classList.add('stop-scrolling')
          }}
          onImageViewerClose={() => {
            setImageViewerOpen(false)
            document.body.classList.remove('stop-scrolling')
          }}
          image={{ filename: image, temp: imageUpdated }}
          images={images?.map((img) => ({ filename: img || '', temp: false }))}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel className="required">{cpStrings.NAME}</InputLabel>
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
          <span className={`${styles.label} required`}>{cpStrings.DESCRIPTION}</span>

          <RichTextEditor
            language={language}
            className={styles.editor}
            value={description}
            onChange={handleRichTextEditorChange}
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <CategorySelectList
            label={cpStrings.CATEGORIES}
            required
            multiple
            variant='standard'
            selectedOptions={categories}
            onChange={(values) => {
              setCategories(values as wexcommerceTypes.CategoryInfo[])
            }}
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel className="required">{`${cpStrings.PRICE} (${currency})`}</InputLabel>
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
            className='btn-primary btn-margin-bottom'
            size="small"
          >
            {commonStrings.SAVE}
          </Button>

          <Button
            variant="contained"
            className='btn-margin-bottom'
            color='error'
            size="small"
            onClick={async () => {
              try {
                const status = await ProductService.checkProduct(productId)

                if (status === 204) {
                  setOpenDeleteDialog(true)
                } else if (status === 200) {
                  setOpenInfoDialog(true)
                } else {
                  helper.error()
                }
              } catch (err) {
                helper.error(err)
              }
            }}
          >
            {commonStrings.DELETE}
          </Button>

          <Button
            variant="contained"
            className='btn-secondary btn-margin-bottom'
            size="small"
            onClick={async () => {
              try {
                if (imageUpdated && image) {
                  await ProductService.deleteTempImage(image)
                }
                for (const tempImage of tempImages) {
                  await ProductService.deleteTempImage(tempImage)
                }
              } catch (err) {
                helper.error(err)
              }
              router.push('/products')
              router.refresh()
            }}
          >
            {commonStrings.CANCEL}
          </Button>
        </div>

        {descriptionError && <Error message={cpStrings.DESCRIPTION_REQUIRED} className={styles.error} />}
      </form>

      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={openInfoDialog}
      >
        <DialogTitle className='dialog-header'>{commonStrings.INFO}</DialogTitle>
        <DialogContent>{strings.CANNOT_DELETE_PRODUCT}</DialogContent>
        <DialogActions className='dialog-actions'>
          <Button onClick={() => setOpenInfoDialog(false)} variant='contained' className='btn-secondary'>{commonStrings.CLOSE}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={openDeleteDialog}
      >
        <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{strings.DELETE_PRODUCT}</DialogContent>
        <DialogActions className='dialog-actions'>
          <Button onClick={() => setOpenDeleteDialog(false)} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
          <Button onClick={async () => {
            try {
              const status = await ProductService.deleteProduct(productId)

              if (status === 200) {
                setOpenDeleteDialog(false)
                router.push('/products')
                router.refresh()
              } else {
                helper.error()
                setOpenDeleteDialog(false)
              }
            } catch (err) {
              helper.error(err)
            }
          }} variant='contained' color='error'>{commonStrings.DELETE}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default CreateProductForm
