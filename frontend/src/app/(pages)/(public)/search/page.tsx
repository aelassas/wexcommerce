'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import ProductList from '@/components/ProductList'
import ProductsWrapper from './page.client'

const Products = async ({ searchParams }: { searchParams: SearchParams }) => {
  let page = 0
  const p = searchParams['p'] as string
  if (p) {
    const _p = Number.parseInt(p, 10)
    if (_p > 0) {
      page = _p
    } else {
      page = 1
    }
  } else {
    page = 1
  }

  let orderBy = wexcommerceTypes.ProductOrderBy.featured
  const o = searchParams['o'] as string
  if (o) {
    if (o.toLowerCase() === wexcommerceTypes.ProductOrderBy.priceAsc.toLowerCase()) {
      orderBy = wexcommerceTypes.ProductOrderBy.priceAsc
    } else if (o.toLowerCase() === wexcommerceTypes.ProductOrderBy.priceDesc.toLowerCase()) {
      orderBy = wexcommerceTypes.ProductOrderBy.priceDesc
    }
  }

  return page > 0 && (
    <ProductsWrapper>
      <ProductList
        page={page}
        categoryId={(searchParams['c'] as string) || ''}
        keyword={(searchParams['s'] as string) || ''}
        orderBy={orderBy}
      />
    </ProductsWrapper>
  )
}

export default Products
