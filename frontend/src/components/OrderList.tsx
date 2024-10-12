'use server'

import Link from 'next/link'
import Image from 'next/image'
import { fr, enUS } from 'date-fns/locale'
import { format } from 'date-fns'
import slugify from '@sindresorhus/slugify'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import env from '@/config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings } from '@/lang/order-list'
import * as SettingService from '@/lib/SettingService'
import * as UserService from '@/lib/UserService'
import * as OrderService from '@/lib/OrderService'
import { EmptyList, Pager, OdrerStatusField, PaymentTypeField, DeliveryTypeField } from './OrderList.client'

import styles from '@/styles/order-list.module.css'

interface OrderListProps {
  page: number
  userId: string
  keyword: string
  paymentTypes: wexcommerceTypes.PaymentType[]
  deliveryTypes: wexcommerceTypes.DeliveryType[]
  statuses: wexcommerceTypes.OrderStatus[]
  from?: number
  to?: number
}

const OrderList = async (
  {
    page,
    userId: userIdFromProps,
    keyword,
    paymentTypes,
    deliveryTypes,
    statuses,
    from,
    to,
  }: OrderListProps
) => {
  let orders: wexcommerceTypes.OrderInfo[] = []
  let rowCount = 0
  let totalRecords = 0
  let noMatch = false

  const language = await SettingService.getLanguage()
  const currency = await SettingService.getCurrency()
  const userId = (await UserService.getCurrentUser())?._id || ''

  try {
    if (userId && page >= 1 && paymentTypes.length > 0 && deliveryTypes.length > 0 && statuses.length > 0) {
      const data = await OrderService.getOrders(
        userIdFromProps || userId!,
        page,
        env.ORDERS_PAGE_SIZE,
        keyword,
        paymentTypes,
        deliveryTypes,
        statuses,
        from,
        to)

      const _data = data && data.length > 0 ? data[0] : { pageInfo: [{ totalRecords: 0 }], resultData: [] }
      if (!_data) {
        console.log('Orders data empty')
        return
      }
      const _orders = _data.resultData
      const _rowCount = ((page - 1) * env.ORDERS_PAGE_SIZE) + _orders.length
      const _totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

      orders = _orders
      rowCount = _rowCount
      totalRecords = _totalRecords

      if (_totalRecords > 0 && page > Math.ceil(_totalRecords / env.ORDERS_PAGE_SIZE)) {
        noMatch = true
      }
    }
  } catch (err) {
    console.error(err)
    noMatch = true
  }

  const _fr = language === 'fr'
  const _format = wexcommerceHelper.getDateFormat(language)
  const _locale = _fr ? fr : enUS

  return (
    <div className={styles.orders}>
      {
        (totalRecords === 0 || noMatch) && <EmptyList />
      }

      {
        totalRecords > 0 &&
        <>
          <div className={styles.orderList}>
            {
              orders.map((order) => (
                <article key={order._id}>
                  <div className={styles.order}>
                    <div className={styles.orderContent}>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderLabel}>{strings.ID}</span>
                        <span>{order._id}</span>
                      </div>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderLabel}>{strings.STATUS}</span>
                        <OdrerStatusField value={order.status as wexcommerceTypes.OrderStatus} />
                      </div>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderLabel}>{strings.PAYMENT_TYPE}</span>
                        <PaymentTypeField value={(order.paymentType as wexcommerceTypes.PaymentTypeInfo).name} />
                      </div>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderLabel}>{strings.DELIVERY_TYPE}</span>
                        <DeliveryTypeField value={(order.deliveryType as wexcommerceTypes.DeliveryTypeInfo).name} />
                      </div>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderLabel}>{strings.ORDER_ITEMS}</span>
                        <div className={styles.orderItems}>
                          {
                            (order.orderItems as wexcommerceTypes.OrderItem[]).map((orderItem) => (
                              <div key={orderItem._id} className={styles.orderItem}>
                                <div className={styles.orderItemInfo}>
                                  <span className={styles.image}>
                                    <Image
                                      width={0}
                                      height={0}
                                      sizes="100vwh"
                                      priority={true}
                                      alt=""
                                      className={styles.orderItemInfo}
                                      src={wexcommerceHelper.joinURL(env.CDN_PRODUCTS, (orderItem.product as wexcommerceTypes.Product).image)}
                                    />
                                  </span>
                                </div>

                                <div className={styles.orderItemInfo}>
                                  <span className={styles.orderItemLabel}>{strings.PRODUCT}</span>
                                  <span>
                                    <Link
                                      href={`/product/${(orderItem.product as wexcommerceTypes.Product)._id}/${slugify((orderItem.product as wexcommerceTypes.Product).name)}`}
                                      className={styles.orderItemText}
                                      title={(orderItem.product as wexcommerceTypes.Product).name}>

                                      {(orderItem.product as wexcommerceTypes.Product).name}

                                    </Link>
                                  </span>
                                </div>
                                <div className={styles.orderItemInfo}>
                                  <span className={styles.orderItemLabel}>{commonStrings.PRICE}</span>
                                  <span>{`${wexcommerceHelper.formatPrice((orderItem.product as wexcommerceTypes.Product).price, currency, language)}`}</span>
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
                        <span>{wexcommerceHelper.capitalize(format(new Date(order.createdAt!), _format, { locale: _locale }))}</span>
                      </div>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderLabel}>{strings.TOTAL}</span>
                        <span>{`${wexcommerceHelper.formatPrice(order.total, currency, language)}`}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            }
          </div>

          {!noMatch && (
            <Pager
              page={page}
              rowCount={rowCount}
              totalRecords={totalRecords}
              keyword={keyword}
              paymentTypes={paymentTypes}
              deliveryTypes={deliveryTypes}
              statuses={statuses}
              from={from}
              to={to}
              className={styles.pager}
            />
          )}
        </>
      }
    </div>
  )
}

export default OrderList
