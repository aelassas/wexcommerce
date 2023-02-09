import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { strings } from '../lang/home'
import { strings as masterStrings } from '../lang/master'
import { strings as commonStrings } from '../lang/common'
import { strings as headerStrings } from '../lang/header'
import * as Helper from '../common/Helper'
import * as UserService from '../services/UserService'
import * as CategoryService from '../services/CategoryService'
import * as ProductService from '../services/ProductService'
import * as CartService from '../services/CartService'
import {
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  ShoppingBag as CategoryIcon,
  Home as HomeIcon,
  ArrowBackIos as PreviousPageIcon,
  ArrowForwardIos as NextPageIcon,
  Clear as CloseIcon,
} from '@mui/icons-material'
import Env from '../config/env.config'
import Link from 'next/link'
import NoMatch from '../components/NoMatch'
import SoldOut from '../components/SoldOut'
import * as SettingService from '../services/SettingService'
import Footer from '../components/Footer'

import styles from '../styles/home.module.css'

const Home = ({
  _user,
  _signout,
  _language,
  _currency,
  _categories,
  _categoryId,
  _keyword,
  _page,
  _rowCount,
  _totalRecords,
  _products,
  _noMatch
}) => {
  const [leftPanelRef, setLeftPanelRef] = useState()
  const [closeIconRef, setCloseIconRef] = useState()
  const [productsRef, setProductsRef] = useState()
  const [products, setProducts] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [productId, setProductId] = useState()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  useEffect(() => {
    if (_language) {
      Helper.setLanguage(strings, _language)
      Helper.setLanguage(commonStrings, _language)
      Helper.setLanguage(masterStrings, _language)
      Helper.setLanguage(headerStrings, _language)
    }
  }, [_language])

  useEffect(() => {
    if (_signout) {
      UserService.signout(false)
    }
  }, [_signout])

  useEffect(() => {
    if (productsRef) productsRef.scrollTo(0, 0)
  }, [_products, productsRef])

  useEffect(() => {
    if (_products) setProducts(_products)
  }, [_products])

  useEffect(() => {
    (async function () {
      const cartId = CartService.getCartId()

      if (cartId) {
        const cartCount = await CartService.getCartCount(cartId)
        setCartCount(cartCount)
      }
    })()
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

  return (
    _language &&
    <>
      <Header user={_user} language={_language} signout={_signout} cartCount={cartCount} />
      {
        ((_user && _user.verified) || !_user) &&
        <div className='content'>

          {_noMatch && <NoMatch language={_language} />}


          {!_noMatch &&
            <>
              {
                Env.isMobile() &&
                <div
                  className={styles.categoriesAction}
                  onClick={() => {
                    if (leftPanelRef) {
                      if (leftPanelRef.style.display === 'none') {
                        leftPanelRef.style.display = 'block'
                        if (productsRef) {
                          productsRef.style.display = 'none'
                        }
                        if (closeIconRef) {
                          closeIconRef.style.visibility = 'visible'
                        }
                      } else {
                        leftPanelRef.style.display = 'none'
                        if (productsRef) {
                          productsRef.style.display = 'block'
                        }
                        if (closeIconRef) {
                          closeIconRef.style.visibility = 'hidden'
                        }
                      }
                    }
                  }}
                >
                  <div className={styles.categoriesText} >
                    <CategoryIcon className={styles.categoriesIcon} />
                    <span>{headerStrings.CATEGORIES}</span>
                  </div>
                  <CloseIcon
                    className={styles.closeIcon}
                    ref={el => setCloseIconRef(el)}
                  />
                </div>

              }


              <div className={styles.main}>
                <div
                  ref={el => setLeftPanelRef(el)}
                  className={styles.leftPanel}
                >
                  <ul className={styles.categories}>
                    <li>
                      <Link href='/' className={!_categoryId ? styles.selected : ''}>

                        <HomeIcon className={styles.categoryIcon} />
                        <span>{strings.ALL}</span>

                      </Link>
                    </li>
                    {
                      _categories.map((category) => (
                        <li key={category._id}>
                          <Link
                            href={`/?c=${category._id}`}
                            className={_categoryId === category._id ? styles.selected : ''}
                            title={category.name}>

                            <CategoryIcon className={styles.categoryIcon} />
                            <span>{category.name}</span>

                          </Link>
                        </li>
                      ))
                    }
                  </ul>
                </div>

                <div
                  className={styles.products}
                  ref={el => setProductsRef(el)}
                >

                  {
                    _totalRecords === 0 &&
                    <Card variant="outlined" className={styles.emptyList}>
                      <CardContent>
                        <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
                      </CardContent>
                    </Card>
                  }

                  {
                    _totalRecords > 0 &&
                    <>
                      <div className={styles.productList}>
                        {
                          products.map((product) => (
                            <article key={product._id} className={styles.product}>
                              <Link href={`/product?p=${product._id}`} title={product.name}>
                                <div className={styles.thumbnail}>
                                  <img className={styles.thumbnail} alt="" src={Helper.joinURL(Env.CDN_PRODUCTS, product.image)} />
                                </div>
                                {product.soldOut && <SoldOut className={styles.label} />}
                                <span className={styles.name} title={product.name}>{product.name}</span>
                                <span className={styles.price}>{`${Helper.formatNumber(product.price)} ${_currency}`}</span>

                              </Link>
                              {
                                !product.soldOut &&
                                <div className={styles.actions}>
                                  {
                                    product.inCart ?
                                      <Button
                                        variant="outlined"
                                        color='error'
                                        className={styles.removeButton}
                                        onClick={async (e) => {
                                          setProductId(product._id)
                                          setOpenDeleteDialog(true)
                                        }}
                                      >
                                        {commonStrings.REMOVE_FROM_CART}
                                      </Button>
                                      :
                                      <Button
                                        variant="contained"
                                        className={`${styles.button} btn-primary`}
                                        onClick={async (e) => {
                                          try {
                                            const cartId = CartService.getCartId()
                                            const userId = (_user && _user._id) || ''

                                            const res = await CartService.addItem(cartId, userId, product._id)

                                            if (res.status === 200) {
                                              if (!cartId) {
                                                CartService.setCartId(res.data)
                                              }
                                              const __products = Helper.cloneArray(products)
                                              __products.filter(p => p._id === product._id)[0].inCart = true
                                              setProducts(__products)
                                              setCartCount(cartCount + 1)
                                              Helper.info(commonStrings.ARTICLE_ADDED)
                                            } else {
                                              Helper.error()
                                            }
                                          } catch (err) {
                                            console.log(err)
                                            Helper.error()
                                          }
                                        }}
                                      >
                                        {commonStrings.ADD_TO_CART}
                                      </Button>
                                  }
                                </div>
                              }
                            </article>
                          ))
                        }
                      </div>

                      {
                        (_page > 1 || _rowCount < _totalRecords) &&
                        <div className={styles.footer}>

                          <div className={styles.pager}>
                            <div className={styles.rowCount}>
                              {`${((_page - 1) * Env.PAGE_SIZE) + 1}-${_rowCount} ${commonStrings.OF} ${_totalRecords}`}
                            </div>

                            <div className={styles.actions}>

                              <Link
                                href={`/?${`p=${_page - 1}`}${(_categoryId && `&c=${_categoryId}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}
                                className={_page === 1 ? styles.disabled : ''}>

                                <PreviousPageIcon className={styles.icon} />

                              </Link>

                              <Link
                                href={`/?${`p=${_page + 1}`}${(_categoryId && `&c=${_categoryId}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}
                                className={_rowCount === _totalRecords ? styles.disabled : ''}>

                                <NextPageIcon className={styles.icon} />

                              </Link>
                            </div>
                          </div>

                        </div>
                      }
                    </>
                  }
                </div>
              </div>

              <Dialog
                disableEscapeKeyDown
                maxWidth="xs"
                open={openDeleteDialog}
              >
                <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
                <DialogContent>{commonStrings.REMOVE_FROM_CART_CONFIRM}</DialogContent>
                <DialogActions className='dialog-actions'>
                  <Button onClick={() => setOpenDeleteDialog(false)} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
                  <Button onClick={async () => {
                    try {
                      const cartId = CartService.getCartId()
                      const res = await CartService.deleteItem(cartId, productId)

                      if (res.status === 200) {
                        const __products = Helper.cloneArray(products)
                        __products.filter(p => p._id === productId)[0].inCart = false
                        setProducts(__products)
                        setCartCount(cartCount - 1)

                        if (res.data.cartDeleted) {
                          CartService.deleteCartId()
                        }

                        setOpenDeleteDialog(false)
                        Helper.info(commonStrings.ARTICLE_REMOVED)
                      } else {
                        Helper.error()
                      }
                    } catch (err) {
                      console.log(err)
                      Helper.error()
                    }
                  }} variant='contained' color='error'>{commonStrings.REMOVE_FROM_CART}</Button>
                </DialogActions>
              </Dialog>

            </>
          }
        </div>
      }

      {
        _user && !_user.verified &&
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

      <Footer language={_language} />
    </>
  )
}

export async function getServerSideProps(context) {
  let _user = null, _signout = false, _categories = [], _page = 1, _categoryId = '',
    _keyword = '', _totalRecords = 0, _rowCount = 0, _products = [], _noMatch = false,
    _language = '', _currency = ''

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
      }

      if (!_user || status !== 200) {
        CartService.deleteCartId(context)
        _signout = true
      }
    } else {
      _signout = true
    }

    _language = await SettingService.getLanguage()

    if (!_user || (_user && _user.verified)) {
      if (typeof context.query.p !== 'undefined') _page = parseInt(context.query.p)

      if (_page >= 1) {
        _currency = await SettingService.getCurrency()

        if (typeof context.query.c !== 'undefined') _categoryId = context.query.c
        if (typeof context.query.s !== 'undefined') _keyword = context.query.s
        const cartId = CartService.getCartId(context)

        _categories = await CategoryService.getCategories(_language)
        const data = await ProductService.getProducts(_keyword, _page, Env.PAGE_SIZE, _categoryId, cartId)

        const _data = data[0]
        _products = _data.resultData
        _rowCount = ((_page - 1) * Env.PAGE_SIZE) + _products.length
        _totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

        if (_totalRecords > 0 && _page > Math.ceil(_totalRecords / Env.PAGE_SIZE)) {
          _noMatch = true
        }
      } else {
        _noMatch = true
      }
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
      _currency,
      _categories,
      _categoryId,
      _keyword,
      _page,
      _rowCount,
      _totalRecords,
      _products,
      _noMatch
    }
  }
}

export default Home