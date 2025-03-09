import React, { Suspense } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as serverHelper from '@/common/serverHelper'
import env from '@/config/env.config'
import * as ProductService from '@/lib/ProductService'
import * as CartService from '@/lib/CartService'
import * as UserService from '@/lib/UserService'
import * as WishlistService from '@/lib/WishlistService'
import ProductsWrapper, { EmptyList, Pager } from './page.client'
import ProductListItem from '@/components/ProductListItem'
import Indicator from '@/components/Indicator'
import ScrollToTop from '@/components/ScrollToTop'

import styles from '@/styles/search-server.module.css'

const Search = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams
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

  let sortBy = wexcommerceTypes.SortProductBy.featured
  const sb = searchParams['sb'] as string
  if (sb) {
    if (sb.toLowerCase() === wexcommerceTypes.SortProductBy.priceAsc.toLowerCase()) {
      sortBy = wexcommerceTypes.SortProductBy.priceAsc
    } else if (sb.toLowerCase() === wexcommerceTypes.SortProductBy.priceDesc.toLowerCase()) {
      sortBy = wexcommerceTypes.SortProductBy.priceDesc
    } else if (sb.toLowerCase() === wexcommerceTypes.SortProductBy.dateDesc.toLowerCase()) {
      sortBy = wexcommerceTypes.SortProductBy.dateDesc
    } else {
      sortBy = wexcommerceTypes.SortProductBy.featured
    }
  }

  const cartId = await CartService.getCartId()
  const userId = await UserService.getUserId()
  const wishlistId = await WishlistService.getWishlistId(userId)

  const categoryId = (searchParams['c'] as string) || ''
  const keyword = (searchParams['s'] as string) || ''

  let products: wexcommerceTypes.Product[] = []
  let rowCount = 0
  let totalRecords = 0
  let noMatch = false

  try {
    if (page >= 1) {
      try {
        const data = await ProductService.getProducts(keyword, page, env.PAGE_SIZE, categoryId, cartId, wishlistId, sortBy)
        const _data = data && data.length > 0 ? data[0] : { pageInfo: [{ totalRecords: 0 }], resultData: [] }
        if (!_data) {
          console.log('Users data empty')
          return
        }
        const _products = _data.resultData
        const _rowCount = ((page - 1) * env.PAGE_SIZE) + _products.length
        const _totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

        if (_totalRecords > 0 && page > Math.ceil(_totalRecords / env.PAGE_SIZE)) {
          noMatch = true
        }

        for (const product of _products) {
          product.url = await serverHelper.getProductURL(product)
        }

        products = _products
        rowCount = _rowCount
        totalRecords = _totalRecords
      } catch (err) {
        console.error(err)
      }
    }
  } catch (err) {
    console.error(err)
    noMatch = true
  }

  return (
    <>
      <ScrollToTop />

      {
        page > 0 && (
          <Suspense fallback={<Indicator />}>
            <ProductsWrapper
              rowCount={rowCount}
              totalRecords={totalRecords}
              page={page}
            >
              <div className={styles.products}>

                {
                  (totalRecords === 0 || noMatch) && <EmptyList />
                }

                {
                  totalRecords > 0 &&
                  <>
                    <div className={styles.productList}>
                      {
                        products.map((product) => (
                          <ProductListItem key={product._id} product={product} />
                        ))
                      }
                    </div>

                    {!noMatch && (
                      <Pager
                        page={page}
                        rowCount={rowCount}
                        totalRecords={totalRecords}
                        categoryId={categoryId}
                        keyword={keyword}
                        sortBy={sortBy}
                        className={styles.pager}
                      />
                    )}

                  </>
                }
              </div>
            </ProductsWrapper>
          </Suspense>
        )
      }
    </>
  )
}

export default Search
