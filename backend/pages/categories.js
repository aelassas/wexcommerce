import { useEffect, useState } from 'react'
import * as UserService from '../services/UserService'
import Header from '../components/Header'
import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import {
  AccountTree as CategoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { strings } from '../lang/categories'
import { strings as commonStrings } from '../lang/common'
import { strings as masterStrings } from '../lang/master'
import * as Helper from '../common/Helper'
import * as CategoryService from '../services/CategoryService'
import { useRouter } from 'next/router'
import * as SettingService from '../services/SettingService'

import styles from '../styles/categories.module.css'

const Categories = ({ _user, _signout, _categories, _language }) => {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [openInfoDialog, setOpenInfoDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [categoryIndex, setCategoryIndex] = useState(-1)

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

  const handleDelete = async (e) => {
    try {
      const _categoryId = e.currentTarget.getAttribute('data-id')
      const _categoryIndex = e.currentTarget.getAttribute('data-index')

      const status = await CategoryService.check(_categoryId)

      if (status === 204) {
        setCategoryId(_categoryId)
        setCategoryIndex(_categoryIndex)
        setOpenDeleteDialog(true)
      } else if (status === 200) {
        setOpenInfoDialog(true)
      } else {
        Helper.error()
      }
    } catch (err) {
      UserService.signout()
    }
  }

  const handleCloseInfo = () => {
    setOpenInfoDialog(false)
  }

  const handleConfirmDelete = async () => {
    try {
      if (categoryId !== '' && categoryIndex > -1) {
        const status = await CategoryService.deleteCategory(categoryId)

        if (status === 200) {
          _categories.splice(categoryIndex, 1)
          setOpenDeleteDialog(false)
          setCategoryId('')
          setCategoryIndex(-1)
        } else {
          Helper.error()
          setOpenDeleteDialog(false)
          setCategoryId('')
          setCategoryIndex(-1)
        }
      } else {
        Helper.error()
        setOpenDeleteDialog(false)
        setCategoryId('')
        setCategoryIndex(-1)
      }
    } catch (err) {
      UserService.signout()
    }
  }

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false)
    setCategoryId('')
    setCategoryIndex(-1)
  }

  return (
    !loading && _user && _language &&
    <>
      <Header user={_user} language={_language} />
      {
        _user.verified &&
        <div className='content'>
          <div className={styles.leftColumn}>
            <Button
              variant="contained"
              className={`btn-primary ${styles.newCategory}`}
              size="small"
              onClick={() => {
                router.replace('/create-category')
              }}
            >
              {strings.NEW_CATEGORY}
            </Button>
          </div>
          <div className={styles.categories}>
            {
              _categories && _categories.length === 0 &&
              <Card variant="outlined" className={styles.emptyList}>
                <CardContent>
                  <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
                </CardContent>
              </Card>
            }
            {
              _categories && _categories.length > 0 &&
              <section className={styles.categoryList}>
                {
                  _categories.map((category, index) => (
                    <article key={category._id}>
                      <div className={styles.categoryItem}>
                        <CategoryIcon className={styles.categoryIcon} />
                        <span>{category.name}</span>
                      </div>
                      <div className={styles.categoryActions}>
                        <Tooltip title={commonStrings.UPDATE}>
                          <IconButton onClick={() => {
                            router.replace(`/update-category?c=${category._id}`)
                          }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={commonStrings.DELETE}>
                          <IconButton data-id={category._id} data-index={index} onClick={handleDelete}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </article>
                  ))
                }
              </section>
            }
            <Dialog
              disableEscapeKeyDown
              maxWidth="xs"
              open={openInfoDialog}
            >
              <DialogTitle className='dialog-header'>{commonStrings.INFO}</DialogTitle>
              <DialogContent>{strings.CANNOT_DELETE_CATEGORY}</DialogContent>
              <DialogActions className='dialog-actions'>
                <Button onClick={handleCloseInfo} variant='contained' className='btn-secondary'>{commonStrings.CLOSE}</Button>
              </DialogActions>
            </Dialog>

            <Dialog
              disableEscapeKeyDown
              maxWidth="xs"
              open={openDeleteDialog}
            >
              <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
              <DialogContent>{strings.DELETE_CATEGORY}</DialogContent>
              <DialogActions className='dialog-actions'>
                <Button onClick={handleCancelDelete} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
                <Button onClick={handleConfirmDelete} variant='contained' color='error'>{commonStrings.DELETE}</Button>
              </DialogActions>
            </Dialog>
          </div>
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
  let _user = null, _signout = false, _keyword = '', _categories = null, _language = ''

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

          if (typeof context.query.s !== 'undefined') _keyword = context.query.s

          _categories = await CategoryService.searchCategories(context, _language, _keyword)
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
      _keyword,
      _categories,
      _language
    }
  }
}

export default Categories
