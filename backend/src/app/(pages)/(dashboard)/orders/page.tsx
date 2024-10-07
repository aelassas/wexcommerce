'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as helper from '@/common/helper'
import OrderList from '@/components/OrderList'
import { Filters } from './page.client'

import styles from '@/styles/orders.module.css'

const Orders = ({ searchParams }: { searchParams: SearchParams }) => {
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

  const userId = (searchParams['u'] as string) || ''
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

  return (
    <div className={styles.main}>
      <div className={styles.leftPanel}>
        <Filters
          paymentTypes={paymentTypes}
          deliveryTypes={deliveryTypes}
          statuses={statuses}
          keyword={keyword}
          from={from}
          to={to}
        />
      </div>

      <OrderList
        page={page}
        userId={userId}
        keyword={keyword}
        from={from?.getTime()}
        to={to?.getTime()}
        paymentTypes={paymentTypes}
        deliveryTypes={deliveryTypes}
        statuses={statuses}
      />

    </div>
  )
}

export default Orders
