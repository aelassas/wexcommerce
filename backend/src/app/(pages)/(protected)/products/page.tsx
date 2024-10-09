'use server'

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

  return page > 0 && (
    <ProductsWrapper>
      <ProductList
        page={page}
        categoryId={(searchParams['c'] as string) || ''}
        keyword={(searchParams['s'] as string) || ''}
      />
    </ProductsWrapper>
  )
}

export default Products
