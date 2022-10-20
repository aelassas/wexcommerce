import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { strings } from '../lang/home';
import { strings as masterStrings } from '../lang/master';
import { strings as commonStrings } from '../lang/common';
import { strings as headerStrings } from '../lang/header';
import * as Helper from '../common/Helper';
import UserService from '../services/UserService';
import CategoryService from '../services/CategoryService';
import ProductService from '../services/ProductService';
import CartService from '../services/CartService';
import {
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  ShoppingBag as CategoryIcon,
  Home as HomeIcon,
  ArrowBackIos as PreviousPageIcon,
  ArrowForwardIos as NextPageIcon,
  Clear as CloseIcon,
  Block as SoldOutIcon,
  VisibilityOff as HiddenIcon
} from '@mui/icons-material';
import Env from '../config/env.config';
import Link from 'next/link';
import { fr, enUS } from "date-fns/locale";
import NoMatch from '../components/NoMatch';
import { useRouter } from 'next/router';

import styles from '../styles/home.module.css';

export default function Home({
  _user,
  _signout,
  _language,
  _categories,
  _categoryId,
  _keyword,
  _page,
  _rowCount,
  _totalRecords,
  _products,
  _noMatch
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [leftPanelRef, setLeftPanelRef] = useState();
  const [closeIconRef, setCloseIconRef] = useState();
  const [productsRef, setProductsRef] = useState();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Helper.setLanguage(strings);
    Helper.setLanguage(commonStrings);
    Helper.setLanguage(masterStrings);
    Helper.setLanguage(headerStrings);
  }, []);

  useEffect(() => {
    if (_user) {
      setLoading(false);
    }
  }, [_user]);

  useEffect(() => {
    if (_signout) {
      UserService.signout(false);
    }
  }, [_signout]);

  useEffect(() => {
    if (productsRef) productsRef.scrollTo(0, 0);
  }, [_products, productsRef]);

  useEffect(() => {
    if (_products) setProducts(_products);
  }, [_products])

  const handleResend = async (e) => {
    try {
      e.preventDefault();
      const data = { email: _user.email };

      const status = await UserService.resendLink(data);

      if (status === 200) {
        Helper.info(masterStrings.VALIDATION_EMAIL_SENT);
      } else {
        Helper.error(masterStrings.VALIDATION_EMAIL_ERROR);
      }

    } catch (err) {
      Helper.error(masterStrings.VALIDATION_EMAIL_ERROR);
    }
  };

  const _locale = _language === 'fr' ? fr : enUS;

  return (
    <>
      <Header user={_user} />
      {
        ((_user && _user.verified) || !_user) &&
        <div className='content'>

          {_noMatch && <NoMatch />}


          {!_noMatch &&
            <>
              {
                Env.isMobile() &&
                <div
                  className={styles.categoriesAction}
                  onClick={() => {
                    if (leftPanelRef) {
                      if (leftPanelRef.style.display === 'none') {
                        leftPanelRef.style.display = 'block';
                        if (productsRef) {
                          productsRef.style.display = 'none';
                        }
                        if (closeIconRef) {
                          closeIconRef.style.visibility = 'visible';
                        }
                      } else {
                        leftPanelRef.style.display = 'none';
                        if (productsRef) {
                          productsRef.style.display = 'block';
                        }
                        if (closeIconRef) {
                          closeIconRef.style.visibility = 'hidden';
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
                      <Link href='/'>
                        <a className={!_categoryId ? styles.selected : ''}>
                          <HomeIcon className={styles.categoryIcon} />
                          <span>{strings.ALL}</span>
                        </a>
                      </Link>
                    </li>
                    {
                      _categories.map((category) => (
                        <li key={category._id}>
                          <Link href={`/?c=${category._id}`}>
                            <a className={_categoryId === category._id ? styles.selected : ''} title={category.name}>
                              <CategoryIcon className={styles.categoryIcon} />
                              <span>{category.name}</span>
                            </a>
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
                                <a>
                                  <div
                                    className={styles.thumbnail}
                                    style={{ backgroundImage: `url(${Helper.joinURL(Env.CDN_PRODUCTS, product.image)})` }}
                                  >
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
                                  <span className={styles.price}>{`${product.price} ${commonStrings.CURRENCY}`}</span>
                                </a>
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

                              <Link href={`/?${`p=${_page - 1}`}${(_categoryId && `&c=${_categoryId}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}>
                                <a className={_page === 1 ? styles.disabled : ''}>
                                  <PreviousPageIcon className={styles.icon} />
                                </a>
                              </Link>

                              <Link href={`/?${`p=${_page + 1}`}${(_categoryId && `&c=${_categoryId}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}>
                                <a className={_rowCount === _totalRecords ? styles.disabled : ''}>
                                  <NextPageIcon className={styles.icon} />
                                </a>
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
    </>
  );
};

export async function getServerSideProps(context) {
  let _user = null, _signout = false, _categories = [], _page = 1, _categoryId = '', _keyword = '', _totalRecords = 0, _rowCount = 0, _products = [], _noMatch = false;
  const _language = UserService.getLanguage(context);

  try {
    const currentUser = UserService.getCurrentUser(context);

    if (currentUser) {
      let status;
      try {
        status = await UserService.validateAccessToken(context);
      } catch (err) {
        console.log('Unauthorized!');
      }

      if (status === 200) {
        _user = await UserService.getUser(context, currentUser.id);
      } else {
        _signout = true;
      }
    } else {
      _signout = true;
    }

    if (!_user || (_user && _user.verified)) {
      if (typeof context.query.p !== 'undefined') _page = parseInt(context.query.p);

      if (_page >= 1) {
        if (typeof context.query.c !== 'undefined') _categoryId = context.query.c;
        if (typeof context.query.s !== 'undefined') _keyword = context.query.s;
        const cartId = CartService.getCartId(context);

        _categories = await CategoryService.getCategories(_language);
        const data = await ProductService.getProducts(_keyword, _page, Env.PAGE_SIZE, _categoryId, cartId);

        const _data = data[0];
        _products = _data.resultData;
        _rowCount = ((_page - 1) * Env.PAGE_SIZE) + _products.length;
        _totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0;

        if (_totalRecords > 0 && _page > Math.ceil(_totalRecords / Env.PAGE_SIZE)) {
          _noMatch = true;
        }
      } else {
        _noMatch = true;
      }
    }
  } catch (err) {
    console.log(err);
    _signout = true;
  }

  return {
    props: {
      _user,
      _signout,
      _language,
      _categories,
      _categoryId,
      _keyword,
      _page,
      _rowCount,
      _totalRecords,
      _products,
      _noMatch
    }
  };
}
