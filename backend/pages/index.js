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
  IconButton,
  Select,
  MenuItem
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
import PaymentTypeFilter from '../components/PaymentTypeFilter';
import OrderStatusFilter from '../components/OrderStatusFilter';
import OrderDateFilter from '../components/OrderDateFilter';
import { useRouter } from 'next/router';
import SettingService from '../services/SettingService';

import styles from '../styles/home.module.css';

export default function Home({
  _user,
  _signout,
  _language,
  _currency,
  _keyword,
  _page,
  _rowCount,
  _totalRecords,
  _orders,
  _noMatch,
  _paymentTypes,
  _statuses,
  _from,
  _to
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leftPanelRef, setLeftPanelRef] = useState();
  const [orderListRef, setOrderListRef] = useState();
  const [edit, setEdit] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [previousStatuses, setPreviousStatuses] = useState([]);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const _fr = _language === 'fr';
  const _format = _fr ? 'eee d LLLL, kk:mm' : 'eee, d LLLL, kk:mm';
  const _locale = _fr ? fr : enUS;

  useEffect(() => {
    if (_language) {
      Helper.setLanguage(strings, _language);
      Helper.setLanguage(commonStrings, _language);
      Helper.setLanguage(masterStrings, _language);
      Helper.setLanguage(headerStrings, _language);
    }
  }, [_language]);

  useEffect(() => {
    if (_user) {
      setLoading(false);
    }
  }, [_user]);

  useEffect(() => {
    if (_signout) {
      UserService.signout();
    }
  }, [_signout]);

  useEffect(() => {
    if (orderListRef) orderListRef.scrollTo(0, 0);
  }, [_orders, orderListRef]);

  useEffect(() => {
    if (_orders) {
      setEdit(_orders.map(() => false));
      setStatuses(_orders.map((order) => order.status));
      setPreviousStatuses(_orders.map((order) => order.status));
    }
  }, [_orders]);

  useEffect(() => {
    if (_from) {
      setFrom(new Date(_from));
    } else {
      setFrom(null);
    }
  }, [_from]);

  useEffect(() => {
    if (_to) {
      setTo(new Date(_to));
    } else {
      setTo(null);
    }
  }, [_to]);

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

  return !loading && _user && _language &&
    <>
      <Header user={_user} _language={_language} />
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
                <PaymentTypeFilter
                  onChange={(paymentTypes) => {
                    const pt = paymentTypes.join(',');
                    const os = _statuses.join(',');
                    const url = `/?pt=${encodeURIComponent(pt)}&os=${encodeURIComponent(os)}${(_from && `&from=${_from}`) || ''}${(_to && `&to=${_to}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`;
                    router.replace(url);
                  }}
                  selectedOptions={_paymentTypes}
                  className={styles.paymentTypeFilter}
                  language={_language}
                />

                <OrderStatusFilter
                  onChange={(statuses) => {
                    const pt = _paymentTypes.join(',');
                    const os = statuses.join(',');
                    const url = `/?pt=${encodeURIComponent(pt)}&os=${encodeURIComponent(os)}${(_from && `&from=${_from}`) || ''}${(_to && `&to=${_to}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`;
                    router.replace(url);
                  }}
                  selectedOptions={_statuses}
                  className={styles.statusFilter}
                  language={_language}
                />

                <OrderDateFilter
                  language={_language}
                  from={from}
                  to={to}
                  onSubmit={(filter) => {
                    const { from, to } = filter;

                    const pt = _paymentTypes.join(',');
                    const os = _statuses.join(',');
                    const url = `/?pt=${encodeURIComponent(pt)}&os=${encodeURIComponent(os)}${(from && `&from=${from.getTime()}`) || ''}${(to && `&to=${to.getTime()}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`;
                    router.replace(url);
                  }}
                  className={styles.dateFilter}
                />
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
                        _orders.map((order, index) => (
                          <article key={order._id}>
                            <div className={styles.order}>
                              <div className={styles.orderContent}>
                                <div className={styles.orderInfo}>
                                  <span className={styles.orderLabel}>{strings.ID}</span>
                                  <span>{order._id}</span>
                                </div>
                                <div className={styles.orderInfo}>
                                  <span className={styles.orderLabel}>{strings.STATUS}</span>
                                  <span>
                                    {edit[index] ?
                                      <Select
                                        variant="standard"
                                        value={statuses[index]}
                                        SelectDisplayProps={{ style: { paddingTop: 0, paddingRight: 24, paddingBottom: 4, paddingLeft: 0 } }}
                                        onChange={(e) => {
                                          const __statuses = Helper.cloneArray(statuses);
                                          const __previousStatuses = Helper.cloneArray(previousStatuses);
                                          __previousStatuses[index] = __statuses[index];
                                          __statuses[index] = e.target.value;
                                          setStatuses(__statuses);
                                        }}
                                      >
                                        {Helper.getOrderStatuses().map((status) => (
                                          <MenuItem key={status} value={status} ><OrderStatus value={status} language={_language} /></MenuItem>
                                        ))}
                                      </Select>
                                      : <OrderStatus value={statuses[index]} language={_language} />
                                    }
                                  </span>
                                </div>
                                <div className={styles.orderInfo}>
                                  <span className={styles.orderLabel}>{strings.PAYMENT_TYPE}</span>
                                  <span><PaymentType value={order.paymentType} language={_language} /></span>
                                </div>
                                <div className={styles.orderInfo}>
                                  <span className={styles.orderLabel}>{strings.CLIENT}</span>
                                  <Link href={`/users?s=${order.user._id}`}>

                                    <span>{order.user.fullName}</span>

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
                                              <Link
                                                href={`/update-product?p=${orderItem.product._id}`}
                                                className={styles.orderItemText}
                                                title={orderItem.product.name}>

                                                {orderItem.product.name}

                                              </Link>
                                            </span>
                                          </div>
                                          <div className={styles.orderItemInfo}>
                                            <span className={styles.orderItemLabel}>{cpStrings.PRICE}</span>
                                            <span>{`${Helper.formatNumber(orderItem.product.price)} ${_currency}`}</span>
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
                                  <span>{`${Helper.formatNumber(order.total)} ${_currency}`}</span>
                                </div>
                              </div>

                              <div className={styles.orderActions}>
                                <IconButton
                                  style={{ visibility: edit[index] ? 'hidden' : 'visible' }}
                                  onClick={(e) => {
                                    const _edit = Helper.cloneArray(edit);
                                    _edit[index] = true;
                                    setEdit(_edit);
                                  }}>
                                  <EditIcon />
                                </IconButton>
                              </div>
                            </div>
                            {
                              edit[index] &&
                              <div className="buttons">

                                <Button
                                  variant="contained"
                                  className='btn-primary btn-margin-bottom'
                                  size="small"
                                  onClick={async (e) => {
                                    try {
                                      const _status = statuses[index];
                                      const status = await OrderService.updateOrder(_user._id, order._id, _status);

                                      if (status === 200) {
                                        const _previousStatuses = Helper.cloneArray(previousStatuses);
                                        _previousStatuses[index] = _status;
                                        setPreviousStatuses(_previousStatuses);

                                        const _edit = Helper.cloneArray(edit);
                                        _edit[index] = false;
                                        setEdit(_edit);
                                        Helper.info(commonStrings.UPDATED);
                                      } else {
                                        Helper.error();
                                      }

                                    } catch (err) {
                                      console.log(err);
                                      Helper.error();
                                    }
                                  }}
                                >
                                  {commonStrings.SAVE}
                                </Button>

                                <Button
                                  variant="contained"
                                  className='btn-secondary btn-margin-bottom'
                                  size="small"
                                  onClick={async () => {
                                    const _edit = Helper.cloneArray(edit);
                                    _edit[index] = false;
                                    setEdit(_edit);

                                    const __statuses = Helper.cloneArray(statuses);
                                    __statuses[index] = previousStatuses[index];
                                    setStatuses(__statuses);
                                  }}
                                >
                                  {commonStrings.CANCEL}
                                </Button>
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
                              href={`/?pt=${encodeURIComponent(_paymentTypes.join(','))}&os=${encodeURIComponent(_statuses.join(','))}&${`p=${_page - 1}`}${(_from && `&from=${_from}`) || ''}${(_to && `&to=${_to}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}
                              className={_page === 1 ? styles.disabled : ''}>

                              <PreviousPageIcon className={styles.icon} />

                            </Link>

                            <Link
                              href={`/?pt=${encodeURIComponent(_paymentTypes.join(','))}&os=${encodeURIComponent(_statuses.join(','))}&${`p=${_page + 1}`}${(_from && `&from=${_from}`) || ''}${(_to && `&to=${_to}`) || ''}${(_keyword !== '' && `&s=${encodeURIComponent(_keyword)}`) || ''}`}
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
    </>;
};

export async function getServerSideProps(context) {
  let _user = null, __user = null, _signout = false, _page = 1, _keyword = '',
    _totalRecords = 0, _rowCount = 0, _orders = [], _noMatch = false,
    _paymentTypes = [], _statuses = [], _from = null, _to = null, _language = '', _currency = '';

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
            _language = await SettingService.getLanguage();
            _currency = await SettingService.getCurrency();

            if (typeof context.query.u !== 'undefined') __user = context.query.u;
            if (typeof context.query.p !== 'undefined') _page = parseInt(context.query.p);
            if (typeof context.query.s !== 'undefined') _keyword = context.query.s;
            if (typeof context.query.o !== 'undefined') _keyword = context.query.o;
            if (typeof context.query.from !== 'undefined') _from = parseInt(context.query.from);
            if (typeof context.query.to !== 'undefined') _to = parseInt(context.query.to);

            if (typeof context.query.pt !== 'undefined') {
              const allPaymentTypes = Helper.getPaymentTypes();
              _paymentTypes = [];
              const pts = context.query.pt.split(',');

              for (const pt of pts) {
                if (allPaymentTypes.includes(pt)) _paymentTypes.push(pt);
              }
            } else {
              _paymentTypes = Helper.getPaymentTypes();
            }

            if (typeof context.query.os !== 'undefined') {
              const allStatuses = Helper.getOrderStatuses();
              _statuses = [];
              const oss = context.query.os.split(',');

              for (const os of oss) {
                if (allStatuses.includes(os)) _statuses.push(os);
              }
            } else {
              _statuses = Helper.getOrderStatuses();
            }

            if (_page >= 1) {
              const data = await OrderService.getOrders(context,
                __user ? __user : _user._id,
                _page,
                Env.PAGE_SIZE,
                _keyword,
                _paymentTypes,
                _statuses,
                _from,
                _to);
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
      _currency,
      _keyword,
      _page,
      _rowCount,
      _totalRecords,
      _orders,
      _noMatch,
      _paymentTypes,
      _statuses,
      _from,
      _to
    }
  };
}
