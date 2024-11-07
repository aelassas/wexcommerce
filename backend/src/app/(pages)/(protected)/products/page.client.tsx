'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material'
import {
  ShoppingBag as CategoryIcon,
  Home as HomeIcon,
  Clear as CloseIcon,
} from '@mui/icons-material'
import {
  Block as SoldOutIcon,
  VisibilityOff as HiddenIcon
} from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as CategoryService from '@/lib/CategoryService'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import env from '@/config/env.config'
import { strings } from '@/lang/products'
import { strings as commonStrings } from '@/lang/common'
import { strings as headerStrings } from '@/lang/header'
import PagerComponent from '@/components/Pager'

import styles from '@/styles/products-client.module.css'
import RowCount from '@/components/RowCount'

interface PagerProps {
  page: number
  totalRecords: number
  rowCount: number
  categoryId?: string
  keyword: string
  sortBy?: wexcommerceTypes.SortProductBy
  className?: string
}

export const Pager: React.FC<PagerProps> = ({
  page,
  totalRecords,
  rowCount,
  categoryId,
  keyword,
  sortBy,
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
      onPrevious={() => router.push(`/products?${`p=${page - 1}`}${(categoryId && `&c=${categoryId}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(sortBy && `&sb=${sortBy}`) || ''}`)}
      onNext={() => router.push(`/products?${`p=${page + 1}`}${(categoryId && `&c=${categoryId}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}${(sortBy && `&sb=${sortBy}`) || ''}`)}
    />
  )
}

interface TagsProps {
  product: wexcommerceTypes.Product
}

export const Tags: React.FC<TagsProps> = ({ product }) => (
  <>
    {
      product.soldOut &&
      <div className={`${styles.label} ${styles.soldOut}`} title={commonStrings.SOLD_OUT_INFO}>
        <SoldOutIcon className={styles.labelIcon} />
        <span>{commonStrings.SOLD_OUT}</span>
      </div>
    }
    {
      product.hidden &&
      <div className={`${styles.label} ${styles.hidden}`} title={commonStrings.HIDDEN_INFO}>
        <HiddenIcon className={styles.labelIcon} />
        <span>{commonStrings.HIDDEN}</span>
      </div>
    }
  </>
)

interface ProductsWrapperProps {
  rowCount: number
  totalRecords: number
  page: number
  children: React.ReactNode
}

const ProductsWrapper: React.FC<ProductsWrapperProps> = (
  {
    rowCount,
    totalRecords,
    page,
    children,
  }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { language } = useLanguageContext() as LanguageContextType

  const [categories, setCategories] = useState<wexcommerceTypes.CategoryInfo[]>([])
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sortBy, setSortBy] = useState<wexcommerceTypes.SortProductBy>()

  const leftPanelRef = useRef<HTMLDivElement>(null)
  const closeIconRef = useRef<SVGSVGElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setKeyword(searchParams.get('s') || '')
    setCategoryId(searchParams.get('c') || '')

    let _sortBy = wexcommerceTypes.SortProductBy.dateDesc
    const sb = searchParams.get('sb')
    if (sb) {
      if (sb.toLowerCase() === wexcommerceTypes.SortProductBy.priceAsc.toLowerCase()) {
        _sortBy = wexcommerceTypes.SortProductBy.priceAsc
      } else if (sb.toLowerCase() === wexcommerceTypes.SortProductBy.priceDesc.toLowerCase()) {
        _sortBy = wexcommerceTypes.SortProductBy.priceDesc
      } else if (sb.toLowerCase() === wexcommerceTypes.SortProductBy.featured.toLowerCase()) {
        _sortBy = wexcommerceTypes.SortProductBy.featured
      } else {
        _sortBy = wexcommerceTypes.SortProductBy.dateDesc
      }
    }
    setSortBy(_sortBy)
  }, [searchParams])

  useEffect(() => {
    const fetchCategories = async () => {
      if (language) {
        const _categories = await CategoryService.getCategories(language)
        setCategories(_categories)
      }
    }

    fetchCategories()
  }, [language])

  const handleCategoryClick = () => {
    if (env.isMobile() && leftPanelRef.current) {
      leftPanelRef.current.style.display = 'none'
      if (productsRef.current) {
        productsRef.current.style.display = 'block'
      }
      if (closeIconRef.current) {
        closeIconRef.current.style.visibility = 'hidden'
      }
    }
  }

  return (
    <>
      {
        env.isMobile() &&
        <>
          <Button
            variant="contained"
            className={`btn-primary ${styles.newProduct}`}
            size="small"
            onClick={() => {
              router.push('/create-product')
            }}
          >
            {strings.NEW_PRODUCT}
          </Button>

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
        </>
      }

      <div className={styles.main}>
        <div
          ref={leftPanelRef}
          className={styles.leftPanel}
        >
          {
            !env.isMobile() &&
            <Button
              variant="contained"
              className={`btn-primary ${styles.newProduct}`}
              size="small"
              onClick={() => {
                router.push('/create-product')
              }}
            >
              {strings.NEW_PRODUCT}
            </Button>
          }

          <ul className={styles.categories}>
            <li>
              <Link
                href='/products'
                className={!categoryId ? styles.selected : ''}
                onClick={handleCategoryClick}
              >

                <HomeIcon className={styles.categoryIcon} />
                <span>{strings.ALL}</span>

              </Link>
            </li>

            {
              categories.map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/products?c=${category._id}`}
                    className={categoryId === category._id ? styles.selected : ''}
                    title={category.name}
                    onClick={handleCategoryClick}
                  >
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
                <RowCount
                  page={page}
                  rowCount={rowCount}
                  totalRecords={totalRecords}
                  pageSize={env.PAGE_SIZE}
                />

                {sortBy &&
                  <FormControl margin="dense" className={styles.sort}>
                    <InputLabel>{commonStrings.SORT_BY}</InputLabel>
                    <Select
                      variant="outlined"
                      size="small"
                      label={commonStrings.SORT_BY}
                      value={sortBy}
                      onChange={(e) => {
                        const _sortBy = e.target.value

                        let url = '/products'

                        const firstParamSet = categoryId || keyword
                        if (categoryId) {
                          url += `?c=${categoryId}`
                        } else if (keyword) {
                          url += `?s=${keyword}`
                        }

                        url += `${firstParamSet ? '&' : '?'}sb=${_sortBy}`

                        router.push(url)
                      }}
                    >
                      <MenuItem value={wexcommerceTypes.SortProductBy.dateDesc.toString()}>{strings.ORDER_BY_DATE_DESC}</MenuItem>
                      <MenuItem value={wexcommerceTypes.SortProductBy.featured.toString()}>{strings.ORDER_BY_FEATURED}</MenuItem>
                      <MenuItem value={wexcommerceTypes.SortProductBy.priceAsc.toString()}>{strings.ORDER_BY_PRICE_ASC}</MenuItem>
                      <MenuItem value={wexcommerceTypes.SortProductBy.priceDesc.toString()}>{strings.ORDER_BY_PRICE_DESC}</MenuItem>
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
