import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { fr, enUS } from 'date-fns/locale'
import { format } from 'date-fns'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import * as helper from '@/common/helper'
import env from '@/config/env.config'
import * as SettingService from '@/lib/SettingService'
import * as UserService from '@/lib/UserService'
import * as OrderService from '@/lib/OrderService'
import { strings as cpStrings } from '@/lang/create-product'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/orders'
import EmptyOrderList from '@/components/EmptyOrderList'
import {
  Filters,
  Pager,
  OdrerStatusField,
  PaymentTypeField,
  DeliveryTypeField,
  Actions,
  Header,
} from './page.client'
import Indicator from '@/components/Indicator'

import styles from '@/styles/orders.module.css'

const Orders = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams
  const allPaymentTypes = helper.getPaymentTypes()
  const allDeliveryTypes = helper.getDeliveryTypes()
  const allStatuses = helper.getOrderStatuses()

  let page = 1
  const p = searchParams['p'] as string
  if (p) {
    const _p = Number.parseInt(p, 10)
    if (_p > 0) {
      page = _p
    }
  }

  const userIdFromSearchParams = (searchParams['u'] as string) || ''
  const keyword = (searchParams['o'] || searchParams['s'] || '') as string
  const _from = searchParams['from'] as string
  const from = _from ? new Date(Number.parseInt(_from, 10)) : null
  const _to = searchParams['to'] as string
  const to = _to ? new Date(Number.parseInt(_to, 10)) : null
  let paymentTypes: wexcommerceTypes.PaymentType[] = []
  const _pt = searchParams['pt'] as string
  if (_pt) {
    const pts = _pt.split(',').map((pt) => pt as wexcommerceTypes.PaymentType)

    for (const pt of pts) {
      if (allPaymentTypes.includes(pt)) {
        paymentTypes.push(pt)
      }
    }
  } else {
    paymentTypes = allPaymentTypes
  }
  let deliveryTypes: wexcommerceTypes.DeliveryType[] = []
  const _dt = searchParams['dt'] as string
  if (_dt) {
    const dts = _dt.split(',').map((dt) => dt as wexcommerceTypes.DeliveryType)

    for (const dt of dts) {
      if (allDeliveryTypes.includes(dt)) {
        deliveryTypes.push(dt)
      }
    }
  } else {
    deliveryTypes = allDeliveryTypes
  }
  let statuses: wexcommerceTypes.OrderStatus[] = []
  const _os = searchParams['os'] as string
  if (_os) {
    const oss = _os.split(',').map((os) => os as wexcommerceTypes.OrderStatus)

    for (const os of oss) {
      if (allStatuses.includes(os)) {
        statuses.push(os)
      }
    }
  } else {
    statuses = allStatuses
  }

  let orders: wexcommerceTypes.OrderInfo[] = []
  let rowCount = 0
  let totalRecords = 0
  let noMatch = false

  const language = await SettingService.getLanguage()
  const currency = await SettingService.getCurrency()
  const userId = userIdFromSearchParams || (await UserService.getCurrentUser())?._id

  let sortBy = wexcommerceTypes.SortOrderBy.dateDesc
  const sb = searchParams['sb'] as string
  if (sb) {
    if (sb.toLowerCase() === wexcommerceTypes.SortOrderBy.dateAsc.toLowerCase()) {
      sortBy = wexcommerceTypes.SortOrderBy.dateAsc
    }
  }

  try {
    if (userId && page >= 1 && paymentTypes.length > 0 && deliveryTypes.length > 0 && statuses.length > 0) {
      const data = await OrderService.getOrders(
        userId,
        page,
        env.ORDERS_PAGE_SIZE,
        keyword,
        paymentTypes,
        deliveryTypes,
        statuses,
        sortBy,
        from?.getTime(),
        to?.getTime())

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

  return userId && (
    <Suspense fallback={<Indicator />}>
      <div className={styles.main}>
        <div className={styles.leftPanel}>
          <Filters
            user={userId}
            paymentTypes={paymentTypes}
            deliveryTypes={deliveryTypes}
            statuses={statuses}
            keyword={keyword}
            from={from}
            to={to}
            sortBy={sortBy}
          />
        </div>

        <div className={styles.orders}>

          <Header
            user={userId}
            page={page}
            rowCount={rowCount}
            totalRecords={totalRecords}
            paymentTypes={paymentTypes}
            deliveryTypes={deliveryTypes}
            statuses={statuses}
            keyword={keyword}
            from={from}
            to={to}
            sortBy={sortBy}
          />

          {
            (totalRecords === 0 || noMatch) && <EmptyOrderList />
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
                            <span className={styles.orderLabel}>{strings.CLIENT}</span>
                            <Link href={`/users?u=${(order.user as wexcommerceTypes.User)._id}`}>
                              <span>{(order.user as wexcommerceTypes.User).fullName}</span>
                            </Link>
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
                                          href={`/product?p=${(orderItem.product as wexcommerceTypes.Product)._id}`}
                                          className={styles.orderItemText}
                                          title={(orderItem.product as wexcommerceTypes.Product).name}>

                                          {(orderItem.product as wexcommerceTypes.Product).name}

                                        </Link>
                                      </span>
                                    </div>
                                    <div className={styles.orderItemInfo}>
                                      <span className={styles.orderItemLabel}>{cpStrings.PRICE}</span>
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

                        <Actions orderId={order._id!} />
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
                  from={from?.getTime()}
                  to={to?.getTime()}
                  sortBy={sortBy}
                  className={styles.pager}
                />
              )}
            </>
          }
        </div>

      </div>
    </Suspense>
  )
}

export default Orders
