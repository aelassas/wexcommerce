'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Delete as DeleteIcon,
  PhotoCamera as ImageIcon
} from '@mui/icons-material'
import Image from 'next/image'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { strings } from '@/lang/image-editor'
import { strings as commonStrings } from '@/lang/common'
import ImageViewer from './ImageViewer'
import env from '@/config/env.config'
import * as helper from '@/common/helper'
import * as ImageService from '@/lib/ImageService'
import * as ProductService from '@/lib/ProductService'
import * as CategoryService from '@/lib/CategoryService'

import styles from '@/styles/image-editor.module.css'

interface ImageEditorProps {
  type: 'product' | 'category'
  categoryId?: string
  title?: string
  image?: ImageItem
  images?: ImageItem[]
  // eslint-disable-next-line no-unused-vars
  onMainImageUpsert?: (image: ImageItem) => void
  // eslint-disable-next-line no-unused-vars
  onAdd?: (image: ImageItem) => void
  // eslint-disable-next-line no-unused-vars
  onDelete?: (image: ImageItem, index?: number) => void
  onImageViewerOpen?: () => void
  onImageViewerClose?: () => void
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  type,
  categoryId,
  title,
  image: imageFromProps,
  images: imagesFromProps,
  onMainImageUpsert,
  onAdd,
  onDelete,
  onImageViewerOpen,
  onImageViewerClose
}) => {
  const [currentImage, setCurrentImage] = useState(0)
  const [openImageDialog, setOpenImageDialog] = useState(false)
  const [image, setImage] = useState<ImageItem | undefined>(imageFromProps)
  const [images, setImages] = useState<ImageItem[]>(imagesFromProps || [])
  const [filenames, setFilenames] = useState<string[]>([])

  const uploadImageRef = useRef<HTMLInputElement>(null)
  const uploadImagesRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImage(imageFromProps)
  }, [imageFromProps])

  useEffect(() => {
    setImages(imagesFromProps || [])
  }, [imagesFromProps])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader()
    const file = e.target.files && e.target.files[0]

    if (file) {
      reader.onloadend = async () => {
        try {
          if (type === 'product') {
            if (image?.temp) {
              const status = await ProductService.deleteTempImage(image.filename)

              if (status !== 200) {
                helper.error()
              }
            }
            const filename = await ImageService.uploadProductImage(file)
            const mainImg = wexcommerceHelper.clone(image) as ImageItem
            mainImg.filename = filename
            mainImg.temp = true
            setImage(mainImg)
            if (onMainImageUpsert) {
              onMainImageUpsert(mainImg)
            }
          } else if (type === 'category') {
            if (image?.temp) {
              const status = await CategoryService.deleteTempImage(image.filename)

              if (status !== 200) {
                helper.error()
              }
            }
            const filename = !categoryId ?
              await ImageService.createCategoryImage(file) :
              await ImageService.updateCategoryImage(categoryId!, file)
            const mainImg = wexcommerceHelper.clone(image) as ImageItem
            mainImg.filename = filename
            mainImg.temp = !categoryId
            setImage(mainImg)
            if (onMainImageUpsert) {
              onMainImageUpsert(mainImg)
            }
          }
        } catch (err) {
          helper.error(err)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target

    if (files) {
      for (const file of files) {
        const reader = new FileReader()

        reader.onloadend = async () => {
          try {
            if (!filenames.includes(file.name)) {
              const filename = await ImageService.uploadProductImage(file)
              filenames.push(file.name)
              const imgItem = { temp: true, filename }
              images.push(imgItem)
              setImages(wexcommerceHelper.cloneArray(images) as ImageItem[])
              setFilenames(wexcommerceHelper.cloneArray(filenames) as string[])
              if (onAdd) {
                onAdd(imgItem)
              }
            }
          } catch {
            helper.error()
          }
        }

        reader.readAsDataURL(file)
      }
    }
  }

  const src = (_image: ImageItem) =>
    wexcommerceHelper.joinURL(
      _image.temp ? env.CDN_TEMP_PRODUCTS : env.CDN_PRODUCTS,
      _image.filename
    )

  const mainImageSrc = () => {
    if (type === 'product') {
      if (image) {
        return image.temp
          ? wexcommerceHelper.joinURL(env.CDN_TEMP_PRODUCTS, image.filename)
          : wexcommerceHelper.joinURL(env.CDN_PRODUCTS, image.filename)
      } else {
        return '/product.png'
      }
    } else if (type === 'category') {
      if (image) {
        return image.temp
          ? wexcommerceHelper.joinURL(env.CDN_TEMP_CATEGORIES, image.filename)
          : wexcommerceHelper.joinURL(env.CDN_CATEGORIES, image.filename)
      } else {
        return '/category.png'
      }
    }

    return ''
  }

  return (
    <div className={styles.imageEditor}>
      {/* Main image thumbnail */}
      <div className={styles.mainImage}>
        <Image
          alt=""
          src={mainImageSrc()}
          width={0}
          height={0}
          sizes="100vw"
          priority={true}
          className={styles.mainImage}
        />
      </div>

      {/* Add/Update main image & Add additional images buttons */}
      <div className={styles.imageControl}>
        <button
          type="button"
          onClick={() => {
            if (uploadImageRef.current) {
              uploadImageRef.current.value = ''

              setTimeout(() => {
                uploadImageRef.current?.click()
              }, 0)
            }
          }}
          className={styles.action}
        >
          <ImageIcon className={styles.icon} />
          <span>{image ? strings.UPDATE_IMAGE : strings.ADD_IMAGE}</span>
        </button>
        <input ref={uploadImageRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
        {
          type === 'category' && image && (
            <button
              type="button"
              onClick={async () => {
                try {
                  if (image.temp) {
                    await CategoryService.deleteTempImage(image.filename)
                  } else if (categoryId) {
                    await CategoryService.deleteImage(categoryId)
                  }
                  setImage(undefined)
                } catch (err) {
                  helper.error(err)
                }
              }}
              className={styles.action}
            >
              <DeleteIcon className={styles.icon} />
              <span>{strings.DELETE_MAIN_IMAGE}</span>
            </button>
          )}
        {
          type === 'product' && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (uploadImagesRef.current) {
                    uploadImagesRef.current.value = ''

                    setTimeout(() => {
                      uploadImagesRef.current?.click()
                    }, 0)
                  }
                }}
                className={styles.action}
              >
                <ImageIcon className={styles.icon} />
                <span>{strings.ADD_IMAGES}</span>
              </button>
              <input ref={uploadImagesRef} type="file" accept="image/*" hidden multiple onChange={handleImagesChange} />
            </>
          )}
      </div>

      {/* Additional images */}
      <div className={styles.images}>
        {
          images.map((_image, index) => (
            <div key={_image.filename} className={styles.container}>
              <div
                className={styles.image}
                onClick={() => {
                  setCurrentImage(index)
                  setOpenImageDialog(true)
                  if (onImageViewerOpen) {
                    onImageViewerOpen()
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="image"
              >
                {
                  <Image
                    alt=""
                    src={src(_image)}
                    width={0}
                    height={0}
                    sizes="100vw"
                    priority={true}
                    className={styles.image}
                  />
                }
              </div>
              <div className={styles.aiAction}>
                <span
                  className={styles.button}
                  title={commonStrings.DELETE}
                  role="button"
                  tabIndex={0}
                  aria-label="action"
                  onClick={async () => {
                    try {
                      let status = 200
                      try {
                        if (_image.temp) {
                          status = await ProductService.deleteTempImage(_image.filename)
                        }
                      } catch (err) {
                        helper.error(err)
                      }

                      if (status === 200) {
                        const _images = wexcommerceHelper.cloneArray(images) || []
                        _images.splice(index, 1)
                        setImages(_images)

                        const _filenames = wexcommerceHelper.cloneArray(filenames) || []
                        _filenames.splice(index, 1)
                        setFilenames(_filenames)

                        if (onDelete) {
                          onDelete(_image)
                        }
                      } else {
                        helper.error()
                      }
                    } catch (err) {
                      helper.error(err)
                    }
                  }}
                >
                  <DeleteIcon className={styles.button} />
                </span>
              </div>
            </div>
          ))
        }
      </div>

      {/* ImageViewer */}
      {
        openImageDialog
        && (
          <ImageViewer
            src={images.map(src)}
            currentIndex={currentImage}
            title={title}
            closeOnClickOutside
            onClose={() => {
              setOpenImageDialog(false)
              setCurrentImage(0)
              if (onImageViewerClose) {
                onImageViewerClose()
              }
            }}
          />
        )
      }

    </div>
  )
}

export default ImageEditor
