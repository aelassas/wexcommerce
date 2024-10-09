'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@mui/material'
import {
  ShoppingBag as CategoryIcon,
  Home as HomeIcon,
  Clear as CloseIcon,
} from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as CategoryService from '@/lib/CategoryService'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import env from '@/config/env.config'
import { strings } from '@/lang/products'
import { strings as headerStrings } from '@/lang/header'

import styles from '@/styles/products.module.css'

interface ProductsWrapperProps {
  children: React.ReactNode
}

const ProductsWrapper: React.FC<ProductsWrapperProps> = ({ children }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { language } = useLanguageContext() as LanguageContextType

  const [categories, setCategories] = useState<wexcommerceTypes.CategoryInfo[]>([])
  const [categoryId, setCategoryId] = useState('')

  const leftPanelRef = useRef<HTMLDivElement>(null)
  const closeIconRef = useRef<SVGSVGElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCategoryId(searchParams.get('c') || '')
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
              <Link href='/products' className={!categoryId ? styles.selected : ''}>

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
                    onClick={() => {
                      if (env.isMobile() && leftPanelRef.current) {
                        leftPanelRef.current.style.display = 'none'
                        if (productsRef.current) {
                          productsRef.current.style.display = 'block'
                        }
                        if (closeIconRef.current) {
                          closeIconRef.current.style.visibility = 'hidden'
                        }
                      }
                    }}
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
          {children}
        </div>
      </div>

    </>
  )
}

export default ProductsWrapper
