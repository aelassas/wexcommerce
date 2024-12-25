import { Suspense } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as SettingService from '@/lib/SettingService'
import * as ProductService from '@/lib/ProductService'
import { strings } from '@/lang/products'
import CreateProductForm from './page.client'
import EmptyList from '@/components/EmptyList'
import Indicator from '@/components/Indicator'

const Product = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams

  const language = await SettingService.getLanguage()
  strings.setLanguage(language)

  let product: wexcommerceTypes.Product | null = null
  try {
    const language = await SettingService.getLanguage()
    product = await ProductService.getProduct(searchParams['p'] as string, language)
  } catch (err) {
    console.error(err)
  }
  return (
    <Suspense fallback={<Indicator />}>
      {product
        ? <CreateProductForm product={product} />
        : <EmptyList text={strings.EMPTY_LIST} marginTop />}
    </Suspense>
  )
}

export default Product
