'use server'

import { NewCategoryButton } from './page.client'
import CategoryList from '@/components/CategoryList'

import styles from '@/styles/categories.module.css'

const Categories = ({ searchParams }: { searchParams: SearchParams }) => {
  const keyword = (searchParams['s'] as string) || ''

  return (
    <div className={styles.categories}>
      <div className={styles.sideBar}>
        <NewCategoryButton />
      </div>

      <div className={styles.categoryList}>
        <CategoryList keyword={keyword} />
      </div>
    </div>
  )
}

export default Categories
