'use server'

import Link from 'next/link'
import Image from 'next/image'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import env from '@/config/env.config'
import * as SettingService from '@/lib/SettingService'
import * as UserService from '@/lib/UserService'
import * as ProductService from '@/lib/ProductService'
import { strings } from '@/lang/products'
import EmptyList from '@/components/EmptyList'
import ProductsWrapper, { Pager, Tags } from './page.client'

import styles from '@/styles/products-server.module.css'

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

  const language = await SettingService.getLanguage()
  const currency = await SettingService.getCurrency()
  const userId = (await UserService.getCurrentUser())?._id || ''

  let products: wexcommerceTypes.Product[] = []
  let rowCount = 0
  let totalRecords = 0
  let noMatch = false

  let sortBy = wexcommerceTypes.SortProductBy.featured
  const o = searchParams['sb'] as string
  if (o) {
    if (o.toLowerCase() === wexcommerceTypes.SortProductBy.priceAsc.toLowerCase()) {
      sortBy = wexcommerceTypes.SortProductBy.priceAsc
    } else if (o.toLowerCase() === wexcommerceTypes.SortProductBy.priceDesc.toLowerCase()) {
      sortBy = wexcommerceTypes.SortProductBy.priceDesc
    }
  }

  const categoryId = (searchParams['c'] as string) || ''
  const keyword = (searchParams['s'] as string) || ''

  try {
    if (userId && page >= 1) {
      try {
        const data = await ProductService.getProducts(userId, keyword, page, env.PAGE_SIZE, categoryId, sortBy)
        const _data = data && data.length > 0 ? data[0] : { pageInfo: [{ totalRecords: 0 }], resultData: [] }
        if (!_data) {
          console.log('Products data empty')
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

  return page > 0 && (
    <ProductsWrapper
      rowCount={rowCount}
      totalRecords={totalRecords}
      page={page}
    >
      <div className={styles.products}>

        {
          (totalRecords === 0 || noMatch) && <EmptyList text={strings.EMPTY_LIST} />
        }

        {
          totalRecords > 0 &&
          <>
            <div className={styles.productList}>
              {
                products.map((product) => (
                  <article key={product._id} className={styles.product}>
                    <Link href={`/product?p=${product._id}`} title={product.name}>

                      <div className={styles.thumbnail}>
                        <Image
                          alt=""
                          src={wexcommerceHelper.joinURL(env.CDN_PRODUCTS, product.image)}
                          width={0}
                          height={0}
                          sizes='100vw'
                          priority={true}
                          className={styles.thumbnail}
                        />
                      </div>
                      <Tags product={product} />
                      <span className={styles.name} title={product.name}>{product.name}</span>
                      <span className={styles.price}>{`${wexcommerceHelper.formatPrice(product.price, currency, language)}`}</span>

                    </Link>
                  </article>
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
  )
}

export default Products
