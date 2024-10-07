'use client'

import React from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import FeaturedProducts from './FeaturedProducts'

import styles from '@/styles/featured-categories.module.css'
import Link from 'next/link'

interface FeaturedCategoriesProps {
  categoryGroups: wexcommerceTypes.FeaturedCategory[]
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ categoryGroups }) => categoryGroups.length > 0 && (
  <section className={styles.main}>
    {
      categoryGroups.map((categoryGroup) => (
        <article key={categoryGroup.category._id} className={styles.categoryGroup}>
          <Link href={`/search?c=${categoryGroup.category._id}`} className={styles.title}>{categoryGroup.category.name}</Link>
          <section className={styles.products}>
            <FeaturedProducts products={categoryGroup.products} />
          </section>
        </article>
      ))
    }
  </section>
)

export default FeaturedCategories
