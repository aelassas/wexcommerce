'use server'

import Image from 'next/image'
import * as wexcommerceHelper from ':wexcommerce-helper'
import env from '@/config/env.config'
import * as SettingService from '../lib/SettingService'
import * as CategoryService from '../lib/CategoryService'
import { Actions, EmptyList, EmptyCategoryIcon } from './CategoryList.client'

import styles from '../styles/category-list.module.css'

interface CategoryList {
  keyword: string
}

const CategoryList = async ({ keyword }: CategoryList) => {
  const language = await SettingService.getLanguage()
  const categories = await CategoryService.searchCategories(language, keyword)

  return (
    <div className={styles.categories}>
      {
        categories.length === 0 && <EmptyList />
      }
      {
        categories.length > 0 &&
        <section className={styles.categoryList}>
          {
            categories.map((category) => (
              <article key={category._id}>
                <div className={styles.categoryItem}>
                  <div className={styles.categoryImage}>
                    {
                      category.image ? (
                        <Image
                          alt={category.name}
                          src={wexcommerceHelper.joinURL(env.CDN_CATEGORIES, category.image)}
                          width={0}
                          height={0}
                          sizes='100vw'
                          priority={true}
                          className={styles.categoryImage}
                        />
                      ) : (
                        <EmptyCategoryIcon />
                      )
                    }
                  </div>
                  <span>{category.name}</span>
                </div>

                <Actions categoryId={category._id} />

              </article>
            ))
          }
        </section>
      }

    </div>
  )
}

export default CategoryList
