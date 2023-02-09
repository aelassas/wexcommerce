import { useEffect, useState, useRef, useMemo } from 'react'
import * as UserService from '../services/UserService'
import Header from '../components/Header'
import {
  Input,
  InputLabel,
  FormControl,
  FormControlLabel,
  Button,
  Paper,
  Switch
} from '@mui/material'
import { PhotoCamera as ImageIcon } from '@mui/icons-material'
import { strings } from '../lang/create-product'
import { strings as commonStrings } from '../lang/common'
import { strings as masterStrings } from '../lang/master'
import * as Helper from '../common/Helper'
import * as ProductService from '../services/ProductService'
import CategorySelectList from '../components/CategorySelectList'
import { useRouter } from 'next/router'
import Error from '../components/Error'
import Env from '../config/env.config'
import ImageEditor from '../components/ImageEditor'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import * as SettingService from '../services/SettingService'

import styles from '../styles/create-product.module.css'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"

let htmlToDraft = null
let Editor = null
if (typeof window === 'object') {
  htmlToDraft = require('html-to-draftjs').default
  Editor = require('react-draft-wysiwyg').Editor
}

const CreateProduct = ({ _user, _signout, _language, _currency }) => {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [categories, setCategories] = useState([])
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [soldOut, setSoldOut] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [tempImage, setTempImage] = useState('')
  const [tempImages, setTempImages] = useState([])
  const [imageError, setImageError] = useState(false)
  const [fileNames, setFileNames] = useState([])
  const [editorState, setEditorState] = useState()

  const uploadImageRef = useRef(null)
  const uploadImagesRef = useRef(null)

  useEffect(() => {
    if (_user) {
      setLoading(false)
    }
  }, [_user])

  useEffect(() => {
    if (_signout) {
      UserService.signout()
    }
  }, [_signout])

  useEffect(() => {
    if (_language) {
      Helper.setLanguage(strings, _language)
      Helper.setLanguage(commonStrings, _language)
      Helper.setLanguage(masterStrings, _language)
    }
  }, [_language])

  useEffect(() => {
    const contentBlock = htmlToDraft('')
    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
    const editorState = EditorState.createWithContent(contentState)
    setEditorState(editorState)
  }, [])

  const handleResend = async (e) => {
    try {
      e.preventDefault()
      const data = { email: _user.email }

      const status = await UserService.resendLink(data)

      if (status === 200) {
        Helper.info(masterStrings.VALIDATION_EMAIL_SENT)
      } else {
        Helper.error(masterStrings.VALIDATION_EMAIL_ERROR)
      }

    } catch (err) {
      Helper.error(masterStrings.VALIDATION_EMAIL_ERROR)
    }
  }

  const handleChangeImage = (e) => {
    const reader = new FileReader()
    const file = e.target.files[0]

    reader.onloadend = async () => {
      try {
        if (tempImage) {
          const status = await ProductService.deleteTempImage(tempImage)

          if (status !== 200) {
            Helper.error()
          }
        }
        const filename = await ProductService.uploadImage(file)
        setTempImage(filename)
        setImageError(false)
      } catch (err) {
        Helper.error()
      }
    }

    reader.readAsDataURL(file)
  }

  const handleChangeImages = (e) => {

    const files = e.target.files

    for (const file of files) {
      const reader = new FileReader()

      reader.onloadend = async () => {
        try {
          if (!fileNames.includes(file.name)) {
            const filename = await ProductService.uploadImage(file)
            fileNames.push(file.name)
            tempImages.push({ temp: true, src: filename })
            setTempImages(Helper.cloneArray(tempImages))
            setFileNames(Helper.cloneArray(fileNames))
          }
        } catch (err) {
          Helper.error()
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const onEditorStateChange = (state) => {
    setEditorState(state)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {

      if (!tempImage) {
        return setImageError(true)
      }

      const _categories = categories.map(c => c._id)
      const _price = parseFloat(price)
      const _quantity = parseInt(quantity)
      const description = draftToHtml(convertToRaw(editorState.getCurrentContent()))

      const data = {
        name,
        description,
        categories: _categories,
        price: _price,
        quantity: _quantity,
        soldOut,
        hidden,
        image: tempImage,
        images: tempImages.map(image => image.src)
      }

      const res = await ProductService.createProduct(data)

      if (res.status === 200) {
        // Helper.info(strings.PRODUCT_CREATED)

        // setName('')
        // setDescription('')
        // setCategories([])
        // setPrice('')
        // setQuantity('')
        // setSoldOut(false)
        // setHidden(false)
        // setTempImage('')
        router.replace('/products')
      } else {
        Helper.error()
      }
    }
    catch (err) {
      UserService.signout()
    }
  }

  return (
    !loading && _user && _language &&
    <>
      <Header user={_user} language={_language} />
      {
        _user.verified &&
        <div className={'content'}>

          <Paper className={styles.form} elevation={10}>
            <form onSubmit={handleSubmit}>

              <div className={styles.image}>
                <img className={styles.image} alt="" src={tempImage ? Helper.joinURL(Env.CDN_TEMP_PRODUCTS, tempImage) : '/product.png'} />
              </div>

              <FormControl fullWidth margin="dense" className={styles.imageControl}>
                <div>
                  <a onClick={(e) => {
                    if (uploadImageRef.current) {
                      uploadImageRef.current.value = ''

                      setTimeout(() => {
                        uploadImageRef.current.click(e)
                      }, 0)
                    }
                  }}
                    className={styles.action}
                  >
                    <ImageIcon className={styles.icon} />
                    <span>{tempImage ? strings.UPDATE_IMAGE : strings.ADD_IMAGE}</span>
                  </a>
                  <input ref={uploadImageRef} type="file" accept="image/*" hidden onChange={handleChangeImage} />
                  <a onClick={(e) => {
                    if (uploadImagesRef.current) {
                      uploadImagesRef.current.value = ''

                      setTimeout(() => {
                        uploadImagesRef.current.click(e)
                      }, 0)
                    }
                  }}
                    className={styles.action}
                  >
                    <ImageIcon className={styles.icon} />
                    <span>{strings.ADD_IMAGES}</span>
                  </a>
                  <input ref={uploadImagesRef} type="file" accept="image/*" hidden multiple onChange={handleChangeImages} />
                </div>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <ImageEditor
                  title={strings.IMAGES}
                  images={tempImages}
                  onDelete={async (image, index) => {
                    try {
                      const status = await ProductService.deleteTempImage(image.src)

                      if (status === 200) {
                        const _tempImages = Helper.cloneArray(tempImages)
                        _tempImages.splice(index, 1)
                        setTempImages(_tempImages)

                        const _fileNames = Helper.cloneArray(fileNames)
                        _fileNames.splice(index, 1)
                        setFileNames(_fileNames)
                      } else {
                        Helper.error()
                      }
                    } catch (err) {
                      Helper.error()
                    }
                  }} />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className='required'>{strings.NAME}</InputLabel>
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

                <Editor
                  editorState={editorState}
                  editorClassName={styles.editor}
                  onEditorStateChange={onEditorStateChange}
                  toolbar={{
                    options: ['inline', 'blockType', 'fontSize', 'link', 'embedded', 'list', 'textAlign', 'colorPicker', 'image', 'remove', 'history'],
                  }}
                  localization={{
                    locale: _language
                  }}
                  stripPastedStyles
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <CategorySelectList
                  label={strings.CATEGORIES}
                  required
                  multiple
                  variant='standard'
                  selectedOptions={categories}
                  onChange={(values) => {
                    setCategories(values)
                  }}
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className='required'>{`${strings.PRICE} (${_currency})`}</InputLabel>
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
                <InputLabel className='required'>{commonStrings.QUANTITY}</InputLabel>
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
                  {commonStrings.CREATE}
                </Button>
                <Button
                  variant="contained"
                  className='btn-secondary btn-margin-bottom'
                  size="small"
                  onClick={async () => {
                    try {
                      if (tempImage) {
                        const status = await ProductService.deleteTempImage(tempImage)

                        if (status !== 200) {
                          Helper.error()
                        }
                      }

                      for (const image of tempImages) {
                        const status = await ProductService.deleteTempImage(image.src)

                        if (status !== 200) {
                          Helper.error()
                        }
                      }

                      router.replace('/products')
                    } catch (err) {
                      Helper.error()
                    }
                  }}
                >
                  {commonStrings.CANCEL}
                </Button>
              </div>

              {imageError && <Error message={strings.IMAGE_ERROR} className={styles.error} />}
            </form>

          </Paper>
        </div>
      }

      {
        !_user.verified &&
        <div className="validate-email">
          <span>{masterStrings.VALIDATE_EMAIL}</span>
          <Button
            type="button"
            variant="contained"
            size="small"
            className="btn-primary btn-resend"
            onClick={handleResend}
          >{masterStrings.RESEND}</Button>
        </div>
      }
    </>
  )
}

export async function getServerSideProps(context) {
  let _user = null, _signout = false, _language = '', _currency = ''

  try {
    const currentUser = UserService.getCurrentUser(context)

    if (currentUser) {
      let status
      try {
        status = await UserService.validateAccessToken(context)
      } catch (err) {
        console.log('Unauthorized!')
      }

      if (status === 200) {
        _user = await UserService.getUser(context, currentUser.id)

        if (_user) {
          _language = await SettingService.getLanguage()
          _currency = await SettingService.getCurrency()
        } else {
          _signout = true
        }
      } else {
        _signout = true
      }

    } else {
      _signout = true
    }
  } catch (err) {
    console.log(err)
    _signout = true
  }

  return {
    props: {
      _user,
      _signout,
      _language,
      _currency
    }
  }
}

export default CreateProduct
