'use client'

import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { strings } from '@/lang/wishlist'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'
import * as WishlistService from '@/lib/WishlistService'
import { useWishlistContext, WishlistContextType } from '@/context/WishlistContext'
import ProductListItem from './ProductListItem'
import EmptyList from './EmptyList'

import styles from '@/styles/wishlist.module.css'

export const EmptyWishlist: React.FC = () => (
  <EmptyList text={strings.EMPTY} marginTop />
)

interface WishlistProps {
  wishlist: wexcommerceTypes.Wishlist
}

const Wishlist: React.FC<WishlistProps> = ({ wishlist }) => {
  const { setWishlistCount } = useWishlistContext() as WishlistContextType
  const [openClearDialog, setOpenClearDialog] = useState(false)
  const [products, setProducts] = useState<wexcommerceTypes.Product[]>(wishlist.products)

  return (!products || (products && products.length === 0)) ? (
    <EmptyWishlist />
  ) : (
    <div className={styles.main}>

      {products && products.length > 0 && (
        <>
          <div className={styles.header}>
            <Button
              variant="outlined"
              color="error"
              className={styles.btn}
              onClick={() => {
                setOpenClearDialog(true)
              }}
            >
              {strings.CLEAR_WISHLIST}
            </Button>
          </div>
          <div className={styles.products}>
            {
              products.map((product) => (
                <ProductListItem
                  key={product._id}
                  product={product}
                  onRemoveWishlistItem={(productId) => {
                    const _products = wexcommerceHelper.cloneArray(products) as wexcommerceTypes.Product[]
                    const index = _products.findIndex((p) => p._id === productId)
                    _products.splice(index, 1)
                    setProducts(_products)
                  }}
                />
              ))
            }
          </div>
        </>
      )}

      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={openClearDialog}
      >
        <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{strings.CLEAR_WISHLIST_CONFIRM}</DialogContent>
        <DialogActions className='dialog-actions'>
          <Button onClick={() => setOpenClearDialog(false)} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
          <Button onClick={async () => {
            try {
              const wishlistId = wishlist._id
              const status = await WishlistService.clearWishlist(wishlistId)

              if (status === 200) {
                await WishlistService.deleteWishlistId()
                setProducts([])
                setWishlistCount(0)
              } else {
                helper.error()
              }
            } catch (err) {
              console.error(err)
              helper.error()
            }
            setOpenClearDialog(false)
          }} variant='contained' color='error'>
            {strings.CLEAR_WISHLIST}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Wishlist
