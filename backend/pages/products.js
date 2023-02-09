import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { strings } from '../lang/products'
import { strings as masterStrings } from '../lang/master'
import { strings as commonStrings } from '../lang/common'
import { strings as headerStrings } from '../lang/header'
import * as Helper from '../common/Helper'
import * as UserService from '../services/UserService'
import * as CategoryService from '../services/CategoryService'
import * as ProductService from '../services/ProductService'
import {
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import {
  ShoppingBag as CategoryIcon,
  Home as HomeIcon,
  ArrowBackIos as PreviousPageIcon,
  ArrowForwardIos as NextPageIcon,
  Clear as CloseIcon,
  Block as SoldOutIcon,
  VisibilityOff as HiddenIcon
} from '@mui/icons-material'
import Env from '../config/env.config'
import Link from 'next/link'
import NoMatch from '../components/NoMatch'
import { useRouter } from 'next/router'
import * as SettingService from '../services/SettingService'

import styles from '../styles/products.module.css'

const Products = ({
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
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [leftPanelRef, setLeftPanelRef] = useState()
  const [closeIconRef, setCloseIconRef] = useState()
  const [productsRef, setProductsRef] = useState()

  useEffect(() => {
    if (_language) {
      Helper.setLanguage(strings, _language)
      Helper.setLanguage(commonStrings, _language)
      Helper.setLanguage(masterStrings, _language)
      Helper.setLanguage(headerStrings, _language)
    }
  }, [_language])

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
    if (productsRef) productsRef.scrollTo(0, 0)
  }, [_products, productsRef])

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

  return !loading && _user && _language &&
    <>
      <Header user={_user} language={_language} />
      {
        _user.verified &&
        <div className='content'>

          {_noMatch && <NoMatch language={_language} />}

          {!_noMatch &&
            <>
              {
                Env.isMobile() &&
                <>
                  <Button
                    variant="contained"
                    className={`btn-primary ${styles.newProduct}`}
                    size="small"
                    onClick={() => {
                      router.replace('/create-product')
                    }}
                  >
                    {strings.NEW_PRODUCT}
                  </Button>

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
                </>
              }

              <div className={styles.main}>
                <div
                  ref={el => setLeftPanelRef(el)}
                  className={styles.leftPanel}
                >
                  {
                    !Env.isMobile() &&
                    <Button
                      variant="contained"
                      className={`btn-primary ${styles.newProduct}`}
                      size="small"
                      onClick={() => {
                        router.replace('/create-product')
                      }}
                    >
                      {strings.NEW_PRODUCT}
                    </Button>
                  }
                  <ul className={styles.categories}>
                    <li>
                      <Link href='/products' className={!_categoryId ? styles.selected : ''}>

                        <HomeIcon className={styles.categoryIcon} />
                        <span>{strings.ALL}</span>

                      </Link>
                    </li>
                    {
                      _categories.map((category) => (
                        <li key={category._id}>
                          <Link
                            href={`/products?c=${category._id}`}
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
                          _products.map((product) => (
                            <article key={product._id} className={styles.product}>
                              <Link href={`/update-product?p=${product._id}`} title={product.name}>

                                <div className={styles.thumbnail}>
                                  <img className={styles.thumbnail} alt="" src={Helper.joinURL(Env.CDN_PRODUCTS, product.image)} />
                                </div>
                                {
                                  product.soldOut &&
                                  <div className={`${styles.label} ${styles.soldOut}`} title={commonStrings.SOLD_OUT_INFO}>
                                    <SoldOutIcon className={styles.labelIcon} />
                                    <span>{commonStrings.SOLD_OUT}</span>
                                  </div>
                                }
                                {
                                  product.hidden &&
                                  <div className={`${styles.label} ${styles.hidden}`} title={commonStrings.HIDDEN_INFO}>
                                    <HiddenIcon className={styles.labelIcon} />
                                    <span>{commonStrings.HIDDEN}</span>
                                  </div>
                                }
                                <span className={styles.name} title={product.name}>{product.name}</span>
                                <span className={styles.price}>{`${Helper.formatNumber(product.price)} ${_currency}`}</span>

                              </Link>
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
                                href={`/products?${`p=${_page - 1}`}${(_categoryId && `&c=${_categoryId}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}
                                className={_page === 1 ? styles.disabled : ''}>

                                <PreviousPageIcon className={styles.icon} />

                              </Link>

                              <Link
                                href={`/products?${`p=${_page + 1}`}${(_categoryId && `&c=${_categoryId}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}
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
            </>
          }
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

        if (_user) {
          _language = await SettingService.getLanguage()

          if (_user.verified) {
            if (typeof context.query.p !== 'undefined') _page = parseInt(context.query.p)

            if (_page >= 1) {
              _currency = await SettingService.getCurrency()

              if (typeof context.query.c !== 'undefined') _categoryId = context.query.c
              if (typeof context.query.s !== 'undefined') _keyword = context.query.s

              _categories = await CategoryService.getCategories(_language)
              const data = await ProductService.getProducts(context, _user._id, _keyword, _page, Env.PAGE_SIZE, _categoryId)
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

export default Products