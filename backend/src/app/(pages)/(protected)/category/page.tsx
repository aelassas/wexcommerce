'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as SettingService from '@/lib/SettingService'
import * as CategoryService from '@/lib/CategoryService'
import CategoryForm from './page.client'
import { EmptyList } from '@/components/CategoryList.client'


const Category = async ({ searchParams }: { searchParams: SearchParams }) => {
  let category: wexcommerceTypes.CategoryInfo | null = null
  try {
    const language = await SettingService.getLanguage()
    category = await CategoryService.getCategory(language, searchParams['c'] as string)
  } catch (err) {
    console.error(err)
  }
  return (
    category ? (
      <CategoryForm category={category} />
    )
      : (
        <EmptyList />
      )
  )
}

export default Category
