'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import env from '@/config/env.config'
import * as ProductService from '@/lib/ProductService'
import * as CartService from '@/lib/CartService'
import * as WishlistService from '@/lib/WishlistService'
import { EmptyList, Pager } from './ProductList.client'
import ProductListItem from './ProductListItem'

import styles from '@/styles/product-list.module.css'

interface ProductListProps {
  categoryId: string
  keyword: string
  page: number
}

const ProductList = async (
  {
    categoryId,
    keyword,
    page,
  }: ProductListProps) => {

  const cartId = await CartService.getCartId()
  const wishlistId = await WishlistService.getWishlistId()

  let products: wexcommerceTypes.Product[] = []
  let rowCount = 0
  let totalRecords = 0
  let noMatch = false

  try {
    if (page >= 1) {
      try {
        const data = await ProductService.getProducts(keyword, page, env.PAGE_SIZE, categoryId, cartId, wishlistId)
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
            />
          )}

        </>
      }
    </div>
  )
}

export default ProductList
