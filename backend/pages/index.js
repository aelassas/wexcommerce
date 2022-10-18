import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { strings } from '../lang/home';
import { strings as cpStrings } from '../lang/create-product';
import { strings as masterStrings } from '../lang/master';
import { strings as commonStrings } from '../lang/common';
import { strings as headerStrings } from '../lang/header';
import * as Helper from '../common/Helper';
import UserService from '../services/UserService';
import OrderService from '../services/OrderService';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Tooltip
} from '@mui/material';
import {
  ArrowBackIos as PreviousPageIcon,
  ArrowForwardIos as NextPageIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import Env from '../config/env.config';
import Link from 'next/link';
import { fr, enUS } from "date-fns/locale";
import NoMatch from '../components/NoMatch';
import { format } from 'date-fns';
import PaymentType from '../components/PaymentType';
import OrderStatus from '../components/OrderStatus';

import styles from '../styles/home.module.css';

export default function Home({
  _user,
  _signout,
  _language,
  _keyword,
  _page,
  _rowCount,
  _totalRecords,
  _orders,
  _noMatch
}) {
  const [loading, setLoading] = useState(true);
  const [leftPanelRef, setLeftPanelRef] = useState();
  const [orderListRef, setOrderListRef] = useState();

  const _fr = _language === 'fr';
  const _format = _fr ? 'eee d LLLL, kk:mm' : 'eee, d LLLL, kk:mm';
  const _locale = _fr ? fr : enUS;

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
      // TODO uncomment
      // UserService.signout();
    }
  }, [_signout]);

  useEffect(() => {
    if (orderListRef) orderListRef.scrollTo(0, 0);
  }, [_orders, orderListRef]);

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
    !loading && _user &&
    <>
      <Header user={_user} />
      {
        _user.verified &&
        <div className='content'>

          {_noMatch && <NoMatch />}

          {!_noMatch &&
            <div className={styles.main}>
              <div
                ref={el => setLeftPanelRef(el)}
                className={styles.leftPanel}
              >
                {'TODO'}
              </div>

              <div className={styles.orders}>
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
                    <div
                      ref={el => setOrderListRef(el)}
                      className={styles.orderList}
                    >
                      {
                        _orders.map((order) => (
                          <article key={order._id} className={styles.order}>
                            <div className={styles.orderContent}>
                              <div className={styles.orderInfo}>
                                <span className={styles.orderLabel}>{strings.ID}</span>
                                <span>{order._id}</span>
                              </div>
                              <div className={styles.orderInfo}>
                                <span className={styles.orderLabel}>{strings.STATUS}</span>
                                <span><OrderStatus value={order.status} /></span>
                              </div>
                              <div className={styles.orderInfo}>
                                <span className={styles.orderLabel}>{strings.PAYMENT_TYPE}</span>
                                <span><PaymentType value={order.paymentType} /></span>
                              </div>
                              <div className={styles.orderInfo}>
                                <span className={styles.orderLabel}>{strings.CLIENT}</span>
                                <Link href={`/users?s=${order.user._id}`}>
                                  <a>
                                    <span>{order.user.fullName}</span>
                                  </a>
                                </Link>
                              </div>
                              <div className={styles.orderInfo}>
                                <span className={styles.orderLabel}>{strings.ORDER_ITEMS}</span>
                                <div className={styles.orderItems}>
                                  {
                                    order.orderItems.map((orderItem) => (
                                      <div key={orderItem._id} className={styles.orderItem}>
                                        <div className={styles.orderItemInfo}>
                                          <span className={styles.orderItemLabel}>{strings.PRODUCT}</span>
                                          <span>
                                            <Link href={`/update-product?p=${orderItem.product._id}`}>
                                              <a className={styles.orderItemText} title={orderItem.product.name}>
                                                {orderItem.product.name}
                                              </a>
                                            </Link>
                                          </span>
                                        </div>
                                        <div className={styles.orderItemInfo}>
                                          <span className={styles.orderItemLabel}>{cpStrings.PRICE}</span>
                                          <span>{`${orderItem.product.price} ${commonStrings.CURRENCY}`}</span>
                                        </div>
                                        <div className={styles.orderItemInfo}>
                                          <span className={styles.orderItemLabel}>{commonStrings.QUANTITY}</span>
                                          <span>{orderItem.quantity}</span>
                                        </div>
                                      </div>
                                    ))
                                  }
                                </div>
                              </div>
                              <div className={styles.orderInfo}>
                                <span className={styles.orderLabel}>{strings.ORDERED_AT}</span>
                                <span>{Helper.capitalize(format(new Date(order.createdAt), _format, { locale: _locale }))}</span>
                              </div>
                              <div className={styles.orderInfo}>
                                <span className={styles.orderLabel}>{strings.TOTAL}</span>
                                <span>{`${order.total} ${commonStrings.CURRENCY}`}</span>
                              </div>
                            </div>

                            <div className={styles.orderActions}>
                              <Link href={`/update-order?o=${order._id}`}>
                                <a>
                                  <Tooltip title={commonStrings.UPDATE}>
                                    <EditIcon className={styles.orderAction} />
                                  </Tooltip>
                                </a>
                              </Link>
                            </div>
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

                            <Link href={`/?${`p=${_page - 1}`}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}>
                              <a className={_page === 1 ? styles.disabled : ''}>
                                <PreviousPageIcon className={styles.icon} />
                              </a>
                            </Link>

                            <Link href={`/?${`p=${_page + 1}`}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}>
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
  );
};

export async function getServerSideProps(context) {
  let _user = null, __user = null, _signout = false, _page = 1, _keyword = '', _totalRecords = 0, _rowCount = 0, _orders = [], _noMatch = false;
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

        if (_user) {

          if (_user.verified) {
            if (typeof context.query.u !== 'undefined') __user = context.query.u;
            if (typeof context.query.p !== 'undefined') _page = parseInt(context.query.p);
            if (typeof context.query.s !== 'undefined') _keyword = context.query.s;

            if (_page >= 1) {
              const data = await OrderService.getOrders(context, __user ? __user : _user._id, _page, Env.PAGE_SIZE, _keyword);
              const _data = data[0];
              _orders = _data.resultData;
              _rowCount = ((_page - 1) * Env.PAGE_SIZE) + _orders.length;
              _totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0;

              if (_totalRecords > 0 && _page > Math.ceil(_totalRecords / Env.PAGE_SIZE)) {
                _noMatch = true;
              }
            } else {
              _noMatch = true;
            }
          }

        } else {
          _signout = true;
        }
      } else {
        _signout = true;
      }
    } else {
      _signout = true;
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
      _keyword,
      _page,
      _rowCount,
      _totalRecords,
      _orders,
      _noMatch
    }
  };
}
