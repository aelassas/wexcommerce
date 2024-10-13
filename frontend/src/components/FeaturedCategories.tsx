'use client'

import React from 'react'
import Link from 'next/link'
import * as wexcommerceTypes from ':wexcommerce-types'
import env from '@/config/env.config'
import FeaturedProducts from './FeaturedProducts'

import styles from '@/styles/featured-categories.module.css'

interface FeaturedCategoriesProps {
  categoryGroups: wexcommerceTypes.FeaturedCategory[]
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ categoryGroups }) => categoryGroups.length > 0 && (
  <section className={styles.main}>
    {
      categoryGroups.map((categoryGroup) => categoryGroup.products.length > 0 && (
        <article key={categoryGroup.category._id} className={styles.categoryGroup}>
          <Link href={`/search?c=${categoryGroup.category._id}`} className={styles.title}>{categoryGroup.category.name}</Link>
          <section className={styles.products}>
            <FeaturedProducts products={categoryGroup.products} showNavigation={env.isMobile()} />
          </section>
        </article>
      ))
    }
  </section>
)

export default FeaturedCategories
