import { useEffect, useState } from 'react';
import UserService from '../services/UserService';
import Header from '../components/Header';
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Paper,
  Button,
  IconButton,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as IncrementIcon,
  Remove as DecrementIcon,
} from '@mui/icons-material';
import { strings } from '../lang/cart';
import { strings as commonStrings } from '../lang/common';
import { strings as masterStrings } from '../lang/master';
import * as Helper from '../common/Helper';
import CartService from '../services/CartService';
import NoMatch from '../components/NoMatch';
import { useRouter } from 'next/router';
import Env from '../config/env.config';

import styles from '../styles/cart.module.css';
import Link from 'next/link';

export default function Cart({ _user, _signout, _empty, _cart }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [productId, setProductId] = useState();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [total, setTotal] = useState(0);

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
    if (_cart) {
      setCartItems(_cart.cartItems);
      setTotal(Helper.total(_cart.cartItems));
    }
  }, [_cart]);

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

  const iconStyle = { borderRadius: 1 };

  return (
    <>
      <Header user={_user} signout={_signout} cartCount={cartCount} />
      {
        ((_user && _user.verified) || !_user) &&
        <div className='content'>
          {!_empty && cartItems.length > 0 &&
            <div className={styles.main}>
              <div className={styles.items}>
                {
                  cartItems.map((cartItem, index) => (
                    <article key={cartItem._id} className={`${styles.item} ${index < (cartItems.length - 1) ? styles.itemBorder : ''}`}>
                      <div className={styles.product} >
                        <Link href={`/product?p=${cartItem.product._id}`}>
                          <a>
                            <div className={styles.thumbnailContainer}>
                              <div
                                className={styles.thumbnail}
                                style={{ backgroundImage: `url(${Helper.joinURL(Env.CDN_PRODUCTS, cartItem.product.image)})` }}
                              >
                              </div>
                              <div className={styles.name}>
                                <span className={styles.name} title={cartItem.product.name}>{cartItem.product.name}</span>
                                <span className={styles.stock}>{`${cartItem.product.quantity} ${cartItem.product.quantity > 1 ? strings.ARTICLES_IN_STOCK : strings.ARTICLE_IN_STOCK}`}</span>
                              </div>
                            </div>
                          </a>
                        </Link>
                        <span className={styles.price}>{`${cartItem.product.price} ${commonStrings.CURRENCY}`}</span>
                      </div>
                      <div className={styles.actions}>
                        <Button
                          variant="outlined"
                          color='error'
                          onClick={async (e) => {
                            setProductId(cartItem.product._id);
                            setOpenDeleteDialog(true);
                          }}
                        >
                          {commonStrings.REMOVE_FROM_CART}
                        </Button>
                        <div className={styles.quantity}>
                          <IconButton
                            className='btn-primary'
                            disabled={cartItem.quantity === 1}
                            sx={iconStyle}
                            onClick={async (e) => {
                              const __cartItems = Helper.clone(cartItems);
                              const __cartItem = __cartItems.find(item => item._id === cartItem._id);
                              const quantity = __cartItem.quantity - 1;

                              if (quantity >= 1) {
                                const status = await CartService.updateQuantity(__cartItem._id, quantity);
                                if (status === 200) {
                                  __cartItem.quantity = quantity;
                                  setCartItems(__cartItems);
                                  setTotal(Helper.total(__cartItems));
                                  setCartCount(cartCount - 1);
                                } else {
                                  Helper.error();
                                }
                              } else {
                                Helper.error();
                              }
                            }}
                          >
                            <DecrementIcon />
                          </IconButton>
                          <span className={styles.quantity}>{cartItem.quantity}</span>
                          <IconButton
                            className='btn-primary'
                            disabled={cartItem.quantity >= cartItem.product.quantity}
                            sx={iconStyle}
                            onClick={async (e) => {
                              const __cartItems = Helper.clone(cartItems);
                              const __cartItem = __cartItems.find(item => item._id === cartItem._id);
                              const quantity = __cartItem.quantity + 1;

                              if (quantity <= __cartItem.product.quantity) {
                                const status = await CartService.updateQuantity(__cartItem._id, quantity);
                                if (status === 200) {
                                  __cartItem.quantity = quantity;
                                  setCartItems(__cartItems);
                                  setTotal(Helper.total(__cartItems));
                                  setCartCount(cartCount + 1);
                                } else {
                                  Helper.error();
                                }
                              } else {
                                Helper.error();
                              }
                            }}
                          >
                            <IncrementIcon />
                          </IconButton>
                        </div>
                      </div>
                    </article>
                  ))
                }
              </div>
              <div className={styles.total}>
                <div className={styles.title}>{strings.SUMMARY}</div>
                <div className={styles.price}>
                  <span>{strings.SUBTOTAL}</span>
                  <span className={styles.price}>{`${total} ${commonStrings.CURRENCY}`}</span>
                </div>
                <div className={styles.action}>
                  <Button
                    variant="contained"
                    className={`btn-primary ${styles.btn}`}
                    onClick={async (e) => {
                      router.replace('/purchase');
                    }}
                  >
                    {strings.PURCHASE}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    className={styles.btn}
                    onClick={async (e) => {
                      setOpenClearDialog(true);
                    }}
                  >
                    {strings.CLEAR_CART}
                  </Button>
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
                      const cartId = _cart._id;
                      const res = await CartService.deleteItem(cartId, productId);

                      if (res.status === 200) {
                        const __cartItems = Helper.cloneArray(cartItems);
                        const cartItem = __cartItems.find(item => item.product._id === productId);
                        const index = __cartItems.findIndex(item => item.product._id === productId);
                        __cartItems.splice(index, 1);
                        setCartItems(__cartItems);
                        setCartCount(cartCount - cartItem.quantity);
                        setTotal(Helper.total(__cartItems));

                        if (res.data.cartDeleted) {
                          CartService.deleteCartId();
                        }
                      } else {
                        Helper.error();
                      }
                    } catch (err) {
                      console.log(err);
                      Helper.error();
                    }
                    setOpenDeleteDialog(false);
                  }} variant='contained' color='error'>{commonStrings.REMOVE_FROM_CART}</Button>
                </DialogActions>
              </Dialog>

              <Dialog
                disableEscapeKeyDown
                maxWidth="xs"
                open={openClearDialog}
              >
                <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
                <DialogContent>{strings.CLEAR_CART_CONFIRM}</DialogContent>
                <DialogActions className='dialog-actions'>
                  <Button onClick={() => setOpenClearDialog(false)} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
                  <Button onClick={async () => {
                    try {
                      const cartId = _cart._id;
                      const status = await CartService.clearCart(cartId);

                      if (status === 200) {
                        CartService.deleteCartId();
                        setCartItems([]);
                        setCartCount(0);
                        setTotal(0);
                      } else {
                        Helper.error();
                      }
                    } catch (err) {
                      console.log(err);
                      Helper.error();
                    }
                    setOpenDeleteDialog(false);
                  }} variant='contained' color='error'>{strings.CLEAR_CART}</Button>
                </DialogActions>
              </Dialog>
            </div>
          }

          {(_empty || (!loading && cartItems.length === 0)) &&
            <Card variant="outlined" className={styles.empty}>
              <CardContent>
                <Typography color="textSecondary">{strings.EMPTY}</Typography>
              </CardContent>
            </Card>
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
  let _user = null, _signout = false, _empty = false, _cart = null;

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
      try {
        const cartId = CartService.getCartId(context);

        if (cartId) {
          try {
            _cart = await CartService.getCart(cartId);

            if (!_cart) {
              _empty = true;
            }
          } catch (err) {
            console.log(err);
            _empty = true;
          }
        } else {
          _empty = true;
        }
      } catch (err) {
        console.log(err);
        _empty = true;
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
      _empty,
      _cart
    }
  };
}
