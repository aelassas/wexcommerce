import { Suspense } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import env from '@/config/env.config'
import * as serverHelper from '@/common/serverHelper'
import * as SettingService from '@/lib/SettingService'
import * as ProductService from '@/lib/ProductService'
import * as CartService from '@/lib/CartService'
import * as UserService from '@/lib/UserService'
import * as WishlistService from '@/lib/WishlistService'
import * as CategoryService from '@/lib/CategoryService'
import { strings } from '@/lang/home'
import FeaturedProducts from '@/components/FeaturedProducts'
import Carrousel from '@/components/Carrousel'
import CategoryList from '@/components/CategoryList'
import FeaturedCategories from '@/components/FeaturedCategories'
import Indicator from '@/components/Indicator'

import styles from '@/styles/home.module.css'

const slides = [
  '/slides/slide1.jpg',
  '/slides/slide2.jpg',
  '/slides/slide3.jpg',
  '/slides/slide4.jpg',
]

const Home = async () => {
  const language = await SettingService.getLanguage()
  strings.setLanguage(language)
  
  let featuredProducts: wexcommerceTypes.Product[] = []
  let categories: wexcommerceTypes.CategoryInfo[] = []
  let categoryGroups: wexcommerceTypes.FeaturedCategory[] = []

  try {
    const cartId = await CartService.getCartId()
    const userId = await UserService.getUserId()
    const wishlistId = await WishlistService.getWishlistId(userId)
    const language = await SettingService.getLanguage()

    const [featuredProductsRes, categoriesRes, categoryGroupsRes] = await Promise.allSettled([
      ProductService.getFeaturedProducts(env.FEATURED_PRODUCTS_SIZE, cartId, wishlistId),
      CategoryService.getCategories(language, true),
      CategoryService.getFeaturedCategories(language, env.FEATURED_PRODUCTS_SIZE, cartId, wishlistId),
    ])

    featuredProducts = wexcommerceHelper.getPromiseResult(featuredProductsRes)

    for (const product of featuredProducts) {
      product.url = await serverHelper.getProductURL(product)
    }

    categoryGroups = wexcommerceHelper.getPromiseResult(categoryGroupsRes)

    for (const categoryGroup of categoryGroups) {
      for (const product of categoryGroup.products) {
        product.url = await serverHelper.getProductURL(product)
      }
    }

    categories = wexcommerceHelper.getPromiseResult(categoriesRes)
  } catch (err) {
    console.error(err)
  }

  return (
    <Suspense fallback={<Indicator />}>
      <div className={styles.main}>

        <div className={styles.carrousel}>
          <Carrousel
            images={slides}
            autoplay
            autoplaySpeed={4 * 1000}
            showArrows={false}
            showDots
          />
        </div>

        <div className={styles.featuredProducs}>
          <FeaturedProducts
            title={strings.FEATURED_PRODUCTS_TITLE}
            products={featuredProducts}
            autoplay
            autoplaySpeed={5 * 1000}
            showActions
            infinite
          />
        </div>

        <div className={styles.categories}>
          <CategoryList title={strings.CATEGORIES_TITLE} categories={categories} showNavigation />
        </div>

        <div className={styles.featuredCategories}>
          <FeaturedCategories categoryGroups={categoryGroups} />
        </div>

      </div>
    </Suspense>
  )
}

export default Home
