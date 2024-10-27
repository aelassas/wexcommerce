'use server'

import { Suspense } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as SettingService from '@/lib/SettingService'
import * as CategoryService from '@/lib/CategoryService'
import CategoryForm from './page.client'
import { EmptyList } from '@/components/CategoryList.client'
import Indicator from '@/components/Indicator'

const Category = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams
  let category: wexcommerceTypes.CategoryInfo | null = null
  try {
    const language = await SettingService.getLanguage()
    category = await CategoryService.getCategory(language, searchParams['c'] as string)
  } catch (err) {
    console.error(err)
  }
  return (
    <Suspense fallback={<Indicator />}>
      {
        category ? <CategoryForm category={category} /> : <EmptyList />
      }
    </Suspense>
  )
}

export default Category
