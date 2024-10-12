'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as SettingService from '@/lib/SettingService'
import * as ProductService from '@/lib/ProductService'
import { strings } from '@/lang/products'
import CreateProductForm from './page.client'
import EmptyList from '@/components/EmptyList'

const CreateProduct = async ({ searchParams }: { searchParams: SearchParams }) => {
  let product: wexcommerceTypes.Product | null = null
  try {
    const language = await SettingService.getLanguage()
    product = await ProductService.getProduct(searchParams['p'] as string, language)
  } catch (err) {
    console.error(err)
  }
  return (
    product ? (
      <CreateProductForm product={product} />
    )
      : (
        <EmptyList text={strings.EMPTY_LIST} marginTop />
      )
  )
}

export default CreateProduct
