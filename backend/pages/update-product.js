import { useEffect, useState, useRef } from 'react'
import * as UserService from '../services/UserService'
import Header from '../components/Header'
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
import { PhotoCamera as ImageIcon } from '@mui/icons-material'
import { strings } from '../lang/update-product'
import { strings as cpStrings } from '../lang/create-product'
import { strings as commonStrings } from '../lang/common'
import { strings as masterStrings } from '../lang/master'
import * as Helper from '../common/Helper'
import * as ProductService from '../services/ProductService'
import NoMatch from '../components/NoMatch'
import CategorySelectList from '../components/CategorySelectList'
import { useRouter } from 'next/router'
import Env from '../config/env.config'
import ImageEditor from '../components/ImageEditor'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import * as SettingService from '../services/SettingService'

import styles from '../styles/update-product.module.css'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"

let htmlToDraft = null
let Editor = null
if (typeof window === 'object') {
  htmlToDraft = require('html-to-draftjs').default
  Editor = require('react-draft-wysiwyg').Editor
}

const UpdateProduct = ({ _user, _signout, _noMatch, _product, _language, _currency }) => {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [categories, setCategories] = useState([])
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [soldOut, setSoldOut] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [tempImage, setTempImage] = useState('')
  const [openInfoDialog, setOpenInfoDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [editorState, setEditorState] = useState()
  const [descriptionRequired, setDescriptionRequired] = useState(false)
  const [fileNames, setFileNames] = useState([])
  const [images, setImages] = useState([])
  const [tempImages, setTempImages] = useState([])

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
      Helper.setLanguage(cpStrings, _language)
      Helper.setLanguage(commonStrings, _language)
      Helper.setLanguage(masterStrings, _language)
    }
  }, [_language])

  useEffect(() => {
    if (_product) {
      setName(_product.name)
      setCategories(_product.categories)
      setPrice(_product.price.toString())
      setQuantity(_product.quantity.toString())
      setSoldOut(_product.soldOut)
      setHidden(_product.hidden)
      if (_product.images) setImages(_product.images.map(i => ({ temp: false, src: i })))

      const contentBlock = htmlToDraft(_product.description)
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
      const editorState = EditorState.createWithContent(contentState)
      setEditorState(editorState)
    }
  }, [_product])

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
            images.push({ temp: true, src: filename })
            tempImages.push(filename)
            setImages(Helper.cloneArray(images))
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
      const description = draftToHtml(convertToRaw(editorState.getCurrentContent()))

      if (description.trim().toLowerCase() === '<p></p>') {
        return setDescriptionRequired(true)
      }

      const _categories = categories.map(c => c._id)
      const _price = parseFloat(price)
      const _quantity = parseInt(quantity)

      const data = {
        _id: _product._id,
        name,
        description,
        categories: _categories,
        price: _price,
        quantity: _quantity,
        soldOut,
        hidden,
        images: images.filter(i => !i.temp).map(i => i.src),
        tempImages
      }
      if (tempImage) data.image = tempImage
      const res = await ProductService.updateProduct(data)

      if (res.status === 200) {
        setTempImage('')
        _product.image = res.data.image
        Helper.info(strings.PRODUCT_UPDATED)
      } else {
        UserService.signout()
        // Helper.error()
      }
    }
    catch (err) {
      Helper.error()
    }
  }

  return (
    !loading && _user &&
    <>
      <Header user={_user} />
      {
        _user.verified &&
        <div className={'content'}>
          {_product &&
            <Paper className={styles.form} elevation={10}>
              <form onSubmit={handleSubmit}>

                <div className={styles.image}>
                  <img className={styles.image} alt="" src={Helper.joinURL(tempImage ? Env.CDN_TEMP_PRODUCTS : Env.CDN_PRODUCTS, tempImage || _product.image)} />
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
                      <span>{cpStrings.UPDATE_IMAGE}</span>
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
                      <span>{cpStrings.ADD_IMAGES}</span>
                    </a>
                    <input ref={uploadImagesRef} type="file" accept="image/*" hidden multiple onChange={handleChangeImages} />
                  </div>
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <ImageEditor
                    title={cpStrings.IMAGES}
                    images={images}
                    onDelete={async (image, index) => {
                      try {
                        const _images = Helper.cloneArray(images)
                        _images.splice(index, 1)
                        setImages(_images)

                        if (image.temp) {
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
                        }

                      } catch (err) {
                        Helper.error()
                      }
                    }} />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{cpStrings.NAME}</InputLabel>
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
                    label={cpStrings.CATEGORIES}
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
                  <InputLabel className='required'>{`${cpStrings.PRICE} (${_currency})`}</InputLabel>
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
                    {commonStrings.SAVE}
                  </Button>

                  <Button
                    variant="contained"
                    className='btn-margin-bottom'
                    color='error'
                    size="small"
                    onClick={async () => {
                      try {
                        const status = await ProductService.checkProduct(_product._id)

                        if (status === 204) {
                          setOpenDeleteDialog(true)
                        } else if (status === 200) {
                          setOpenInfoDialog(true)
                        } else {
                          Helper.error()
                        }
                      } catch (err) {
                        UserService.signout()
                        // Helper.error()
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
                        if (tempImage) {
                          const status = await ProductService.deleteTempImage(tempImage)

                          if (status !== 200) {
                            Helper.error()
                          }
                        }

                        for (const image of tempImages) {
                          const status = await ProductService.deleteTempImage(image)

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
                      const status = await ProductService.deleteProduct(_product._id)

                      if (status === 200) {
                        setOpenDeleteDialog(false)
                        router.replace('/products')
                      } else {
                        Helper.error()
                        setOpenDeleteDialog(false)
                      }
                    } catch (err) {
                      UserService.signout()
                      // Helper.error()
                    }
                  }} variant='contained' color='error'>{commonStrings.DELETE}</Button>
                </DialogActions>
              </Dialog>

              <Dialog
                disableEscapeKeyDown
                maxWidth="xs"
                open={descriptionRequired}
              >
                <DialogTitle className='dialog-header'>{commonStrings.INFO}</DialogTitle>
                <DialogContent>{strings.DESCRIPTION_REQUIRED}</DialogContent>
                <DialogActions className='dialog-actions'>
                  <Button onClick={() => setDescriptionRequired(false)} variant='contained' className='btn-secondary'>{commonStrings.CLOSE}</Button>
                </DialogActions>
              </Dialog>
            </Paper>
          }

          {_noMatch && <NoMatch language={_language} />}
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
  let _user = null, _signout = false, _noMatch = false, _product = null, _language = '', _currency = ''

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
        _language = await SettingService.getLanguage()

        if (_user) {
          const { p: productId } = context.query
          if (productId) {
            try {
              _currency = await SettingService.getCurrency()
              _product = await ProductService.getProduct(productId, _language)

              if (!_product) {
                _noMatch = true
              }
            } catch (err) {
              console.log(err)
              _noMatch = true
            }
          } else {
            _noMatch = true
          }
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
      _noMatch,
      _product,
      _language,
      _currency
    }
  }
}

export default UpdateProduct