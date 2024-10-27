'use server'

import { Suspense } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as OrderService from '@/lib/OrderService'
import OrderForm from './page.client'
import EmptyOrderList from '@/components/EmptyOrderList'
import Indicator from '@/components/Indicator'

const Order = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams
  const orderId = searchParams['o'] as string
  let order: wexcommerceTypes.OrderInfo | null = null

  try {
    const res = await OrderService.getOrder(orderId)

    if (res.status === 204) {
      console.log(`Order ${orderId} not found`)
      return
    }

    order = res.data
  } catch (err) {
    console.error(err)
  }

  return (
    <Suspense fallback={<Indicator />}>
      {order ? <OrderForm order={order} /> : <EmptyOrderList />}
    </Suspense>
  )
}

export default Order
