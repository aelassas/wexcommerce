import { useEffect, useState } from 'react';
import UserService from '../services/UserService';
import Header from '../components/Header';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AddShoppingCart as AddShoppingCartIcon,
  Block as SoldOutIcon,
} from '@mui/icons-material';
import { strings } from '../lang/product';
import { strings as commonStrings } from '../lang/common';
import { strings as masterStrings } from '../lang/master';
import * as Helper from '../common/Helper';
import ProductService from '../services/ProductService';
import NoMatch from '../components/NoMatch';
import { useRouter } from 'next/router';
import CartService from '../services/CartService';
import Env from '../config/env.config';
import ImageViewer from '../components/ImageViewer';

import styles from '../styles/product.module.css';

export default function Product({ _user, _language, _signout, _noMatch, _product }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState();
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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
    Helper.setLanguage(strings);
    Helper.setLanguage(commonStrings);
    Helper.setLanguage(masterStrings);
  }, []);

  useEffect(() => {
    if (_product) {
      setProduct(_product);
      const images = [];
      images.push(Helper.joinURL(Env.CDN_PRODUCTS, _product.image));
      // images.push('http://placeimg.com/1920/1080/nature');
      // images.push('http://placeimg.com/1920/2550/nature');
      setImages(images);
    }
  }, [_product]);

  useEffect(() => {
    (async function () {
      const cartId = CartService.getCartId();

      if (cartId) {
        const cartCount = await CartService.getCartCount(cartId);
        setCartCount(cartCount);
      }
    })();
  }, []);


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

  return (
    <>
      <Header user={_user} signout={_signout} cartCount={cartCount} />
      {
        ((_user && _user.verified) || !_user) &&
        <div className={'content'}>
          {product &&
            <>
              <div className={styles.main}>
                <div className={styles.product}>
                  <div
                    className={styles.thumbnail}
                    style={{ backgroundImage: `url(${Helper.joinURL(Env.CDN_PRODUCTS, product.image)})` }}
                    onClick={() => setOpenImageDialog(true)}
                  >
                  </div>
                  <div className={styles.rightPanel}>
                    <div className={styles.name}>
                      <span className={styles.name}>{product.name}</span>
                      <span className={styles.price}>{`${product.price} ${commonStrings.CURRENCY}`}</span>
                      {
                        product.soldOut
                          ? <div className={`${styles.label} ${styles.soldOut}`} title={commonStrings.SOLD_OUT_INFO}>
                            <SoldOutIcon className={styles.labelIcon} />
                            <span>{commonStrings.SOLD_OUT}</span>
                          </div>
                          : <span className={styles.stock}>{`${product.quantity} ${product.quantity > 1 ? commonStrings.ARTICLES_IN_STOCK : commonStrings.ARTICLE_IN_STOCK}`}</span>
                      }
                    </div>
                    {
                      !product.soldOut &&
                      <div className={styles.actions}>
                        {
                          product.inCart ?
                            <Button
                              variant="outlined"
                              color='error'
                              className={styles.button}
                              onClick={async (e) => {
                                setOpenDeleteDialog(true);
                              }}
                            >
                              {commonStrings.REMOVE_FROM_CART}
                            </Button>
                            :
                            <Button
                              variant="contained"
                              className={`${styles.button} btn-primary`}
                              startIcon={<AddShoppingCartIcon />}
                              onClick={async (e) => {
                                try {
                                  const cartId = CartService.getCartId();
                                  const userId = (_user && _user._id) || '';

                                  const res = await CartService.addItem(cartId, userId, product._id);

                                  if (res.status === 200) {
                                    if (!cartId) {
                                      CartService.setCartId(res.data);
                                    }
                                    product.inCart = true;
                                    setProduct(product);
                                    setCartCount(cartCount + 1);
                                    Helper.info(commonStrings.ARTICLE_ADDED);
                                  } else {
                                    Helper.error();
                                  }
                                } catch (err) {
                                  console.log(err);
                                  Helper.error();
                                }
                              }}
                            >
                              {commonStrings.ADD_TO_CART}
                            </Button>
                        }
                      </div>
                    }
                  </div>
                </div>
                <div className={styles.description}>
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              </div>

              {openImageDialog &&
                <ImageViewer
                  src={images}
                  currentIndex={currentImage}
                  closeOnClickOutside={true}
                  title={strings.PRODUCT_IMAGES}
                  onClose={() => {
                    setOpenImageDialog(false);
                    setCurrentImage(0);
                  }}
                />}

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
                      const cartId = CartService.getCartId();
                      const res = await CartService.deleteItem(cartId, product._id);

                      if (res.status === 200) {
                        product.inCart = false;
                        setProduct(product);
                        setCartCount(cartCount - 1);

                        if (res.data.cartDeleted) {
                          CartService.deleteCartId();
                        }

                        setOpenDeleteDialog(false);
                        Helper.info(commonStrings.ARTICLE_REMOVED);
                      } else {
                        Helper.error();
                      }
                    } catch (err) {
                      console.log(err);
                      Helper.error();
                    }
                  }} variant='contained' color='error'>{commonStrings.REMOVE_FROM_CART}</Button>
                </DialogActions>
              </Dialog>
            </>
          }

          {_noMatch && <NoMatch />}
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
  let _user = null, _signout = false, _noMatch = false, _product = null;
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
      }

      if (!_user || status !== 200) {
        CartService.deleteCartId(context);
        _signout = true;
      }
    } else {
      _signout = true;
    }

    if (!_user || (_user && _user.verified)) {
      const { p: productId } = context.query;

      if (productId) {
        try {
          const cartId = CartService.getCartId(context);
          _product = await ProductService.getProduct(productId, _language, cartId);

          if (!_product) {
            _noMatch = true;
          }
        } catch (err) {
          console.log(err);
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
      _language,
      _signout,
      _noMatch,
      _product
    }
  };
}
