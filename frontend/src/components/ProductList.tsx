'use server'

import Link from 'next/link'
import Image from 'next/image'
import slugify from '@sindresorhus/slugify'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import env from '@/config/env.config'
import * as SettingService from '@/lib/SettingService'
import * as ProductService from '@/lib/ProductService'
import * as CartService from '@/lib/CartService'
import { Actions, EmptyList, Pager, Tags } from './ProductList.client'

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

  const language = await SettingService.getLanguage()
  const currency = await SettingService.getCurrency()
  const cartId = await CartService.getCartId()

  let products: wexcommerceTypes.Product[] = []
  let rowCount = 0
  let totalRecords = 0
  let noMatch = false

  try {
    if (page >= 1) {
      try {
        const data = await ProductService.getProducts(keyword, page, env.PAGE_SIZE, categoryId, cartId)
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
                <article key={product._id} className={styles.product}>
                  <Link href={`/product/${product._id}/${slugify(product.name)}`} title={product.name}>
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
                  <Actions product={product} />
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
            />
          )}

        </>
      }
    </div>
  )
}

export default ProductList
