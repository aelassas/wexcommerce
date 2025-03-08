import React, { Suspense } from 'react'
import { NewCategoryButton } from './page.client'
import CategoryList from '@/components/CategoryList'
import Indicator from '@/components/Indicator'

import styles from '@/styles/categories.module.css'

const Categories = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams
  const keyword = (searchParams['s'] as string) || ''

  return (
    <Suspense fallback={<Indicator />}>
      <div className={styles.categories}>
        <div className={styles.sideBar}>
          <NewCategoryButton />
        </div>

        <div className={styles.categoryList}>
          <CategoryList keyword={keyword} />
        </div>
      </div>
    </Suspense>
  )
}

export default Categories
