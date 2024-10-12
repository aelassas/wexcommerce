'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material'
import {
  ShoppingBag as CategoryIcon,
  Home as HomeIcon,
  Clear as CloseIcon,
} from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import * as CategoryService from '@/lib/CategoryService'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import env from '@/config/env.config'
import { strings } from '@/lang/search'
import { strings as headerStrings } from '@/lang/header'
import PagerComponent from '@/components/Pager'

import styles from '@/styles/search-client.module.css'

export const EmptyList: React.FC = () => (
  <Card variant="outlined" className={styles.emptyList}>
    <CardContent>
      <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
    </CardContent>
  </Card>
)

interface PagerProps {
  page: number
  totalRecords: number
  rowCount: number
  categoryId?: string
  keyword: string
  orderBy?: wexcommerceTypes.ProductOrderBy
  className?: string
}

export const Pager: React.FC<PagerProps> = ({
  page,
  totalRecords,
  rowCount,
  categoryId,
  keyword,
  orderBy,
  className,
}) => {
  const router = useRouter()

  return (
    <PagerComponent
      page={page}
      pageSize={env.PAGE_SIZE}
      rowCount={rowCount}
      totalRecords={totalRecords}
      className={className}
      onPrevious={() => router.push(`/search?${`p=${page - 1}`}${(categoryId && `&c=${categoryId}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(orderBy && `&o=${orderBy}`) || ''}`)}
      onNext={() => router.push(`/search?${`p=${page + 1}`}${(categoryId && `&c=${categoryId}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(orderBy && `&o=${orderBy}`) || ''}`)}
    />
  )
}

interface ProductsWrapperProps {
  rowCount: number
  totalRecords: number
  page: number
  pageSize: number
  children: React.ReactNode
}

const ProductsWrapper: React.FC<ProductsWrapperProps> = (
  {
    rowCount,
    totalRecords,
    page,
    pageSize,
    children,
  }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { language } = useLanguageContext() as LanguageContextType

  const [categories, setCategories] = useState<wexcommerceTypes.CategoryInfo[]>([])
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [orderBy, setOrderBy] = useState<wexcommerceTypes.ProductOrderBy>()

  const leftPanelRef = useRef<HTMLDivElement>(null)
  const closeIconRef = useRef<SVGSVGElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCategoryId(searchParams.get('c') || '')
    setKeyword(searchParams.get('s') || '')

    let _orderBy = wexcommerceTypes.ProductOrderBy.featured
    const o = searchParams.get('o')
    if (o) {
      if (o.toLowerCase() === wexcommerceTypes.ProductOrderBy.priceAsc.toLowerCase()) {
        _orderBy = wexcommerceTypes.ProductOrderBy.priceAsc
      } else if (o.toLowerCase() === wexcommerceTypes.ProductOrderBy.priceDesc.toLowerCase()) {
        _orderBy = wexcommerceTypes.ProductOrderBy.priceDesc
      }
    }
    setOrderBy(_orderBy)
  }, [searchParams])

  useEffect(() => {
    const fetchCategories = async () => {
      if (language) {
        const _categories = await CategoryService.getCategories(language, false)
        setCategories(_categories)
      }
    }

    fetchCategories()
  }, [language])

  return (
    <>
      {
        env.isMobile() && (
          <div
            className={styles.categoriesAction}
            onClick={() => {
              if (leftPanelRef.current) {
                if (leftPanelRef.current.style.display === 'none') {
                  leftPanelRef.current.style.display = 'block'
                  if (productsRef.current) {
                    productsRef.current.style.display = 'none'
                  }
                  if (closeIconRef.current) {
                    closeIconRef.current.style.visibility = 'visible'
                  }
                } else {
                  leftPanelRef.current.style.display = 'none'
                  if (productsRef.current) {
                    productsRef.current.style.display = 'block'
                  }
                  if (closeIconRef.current) {
                    closeIconRef.current.style.visibility = 'hidden'
                  }
                }
              }
            }}
          >
            <div className={styles.categoriesText} >
              <CategoryIcon className={styles.categoriesIcon} />
              <span>{headerStrings.CATEGORIES}</span>
            </div>
            <CloseIcon
              className={styles.closeIcon}
              ref={closeIconRef}
            />
          </div>
        )
      }

      <div className={styles.main}>
        <div
          ref={leftPanelRef}
          className={styles.leftPanel}
        >
          <ul className={styles.categories}>
            <li>
              <Link href='/search' className={!categoryId ? styles.selected : ''}>

                <HomeIcon className={styles.categoryIcon} />
                <span>{strings.ALL}</span>

              </Link>
            </li>
            {
              categories.map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/search?c=${category._id}`}
                    className={categoryId === category._id ? styles.selected : ''}
                    title={category.name}>

                    <CategoryIcon className={styles.categoryIcon} />
                    <span>{category.name}</span>

                  </Link>
                </li>
              ))
            }
          </ul>
        </div>

        <div
          className={styles.products}
          ref={productsRef}
        >
          {
            totalRecords > 0 && (
              <div className={styles.header}>
                {
                  // 1-24 of over 100,000 results
                  <span className={styles.rowCount}>
                    {`${(page - 1) * pageSize + 1}-${rowCount} ${strings.OF_OVER} ${wexcommerceHelper.formatNumber(totalRecords, language)} ${totalRecords === 1 ? strings.RESULT : strings.RESULTS}`}
                  </span>
                }
                {orderBy &&
                  <FormControl margin="dense" className={styles.sort}>
                    <InputLabel>{strings.SORT_BY}</InputLabel>
                    <Select
                      variant="outlined"
                      size="small"
                      label={strings.SORT_BY}
                      value={orderBy}
                      onChange={(e) => {
                        const _orderBy = e.target.value

                        let url = '/search'

                        const firstParamSet = categoryId || keyword
                        if (categoryId) {
                          url += `?c=${categoryId}`
                        } else if (keyword) {
                          url += `?s=${keyword}`
                        }

                        url += `${firstParamSet ? '&' : '?'}o=${_orderBy}`

                        router.push(url)
                      }}
                    >
                      <MenuItem value={wexcommerceTypes.ProductOrderBy.featured.toString()}>{strings.ORDER_BY_FEATURED}</MenuItem>
                      <MenuItem value={wexcommerceTypes.ProductOrderBy.priceAsc.toString()}>{strings.ORDER_BY_PRICE_ASC}</MenuItem>
                      <MenuItem value={wexcommerceTypes.ProductOrderBy.priceDesc.toString()}>{strings.ORDER_BY_PRICE_DESC}</MenuItem>
                    </Select>
                  </FormControl>}
              </div>
            )}
          {children}
        </div>
      </div>

    </>
  )
}

export default ProductsWrapper
