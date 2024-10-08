'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import { ShoppingCart as CartIcon } from '@mui/icons-material'
import * as wexcommerceTypes from ':wexcommerce-types'
import env from '@/config/env.config'
import { strings } from '@/lang/product-list'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'
import * as CartService from '@/lib/CartService'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { CartContextType, useCartContext } from '@/context/CartContext'
import PagerComponent from './Pager'
import SoldOut from './SoldOut'

import styles from '@/styles/product-list.module.css'

export const EmptyList: React.FC = () => (
  <Card variant="outlined" className={styles.emptyList}>
    <CardContent>
      <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
    </CardContent>
  </Card>
)

interface PagerProps {
  page: number
  totalRecords: number
  rowCount: number
  categoryId?: string
  keyword: string
}

export const Pager: React.FC<PagerProps> = ({
  page,
  totalRecords,
  rowCount,
  categoryId,
  keyword,
}) => {
  const router = useRouter()

  return (
    <PagerComponent
      page={page}
      pageSize={env.PAGE_SIZE}
      rowCount={rowCount}
      totalRecords={totalRecords}
      onPrevious={() => router.push(`/search?${`p=${page - 1}`}${(categoryId && `&c=${categoryId}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`)}
      onNext={() => router.push(`/search?${`p=${page + 1}`}${(categoryId && `&c=${categoryId}`) || ''}${(keyword !== '' && `&s=${encodeURIComponent(keyword)}`) || ''}`)}
    />
  )
}

interface TagsProps {
  product: wexcommerceTypes.Product
}

export const Tags: React.FC<TagsProps> = ({ product }) => (
  product.soldOut && <SoldOut className={styles.label} />
)

interface ActionsProps {
  product: wexcommerceTypes.Product
}

export const Actions: React.FC<ActionsProps> = ({ product }) => {
  const { user } = useUserContext() as UserContextType
  const { cartItemCount, setCartItemCount } = useCartContext() as CartContextType
  const [inCart, setInCart] = useState(product.inCart)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  return !product.soldOut && (
    <div className={styles.actions}>
      {
        inCart ?
          <Button
            variant="outlined"
            color='error'
            className={styles.removeButton}
            onClick={async () => {
              // setOpenDeleteDialog(true)

              try {
                const cartId = await CartService.getCartId()
                const res = await CartService.deleteItem(cartId, product._id)

                if (res.status === 200) {
                  setInCart(false)
                  setCartItemCount(cartItemCount - 1)

                  if (res.data.cartDeleted) {
                    await CartService.deleteCartId()
                  }

                  setOpenDeleteDialog(false)
                  helper.info(commonStrings.ARTICLE_REMOVED)
                } else {
                  helper.error()
                }
              } catch (err) {
                helper.error(err)
              }
            }}
          >
            {commonStrings.REMOVE_FROM_CART}
          </Button>
          :
          <IconButton
            className={`${styles.button} btn-primary`}
            title={commonStrings.ADD_TO_CART}
            onClick={async () => {
              try {
                const cartId = await CartService.getCartId()
                const userId = (user && user._id) || ''

                const res = await CartService.addItem(cartId, userId, product._id)

                if (res.status === 200) {
                  if (!cartId) {
                    await CartService.setCartId(res.data)
                  }
                  setInCart(true)
                  setCartItemCount(cartItemCount + 1)
                  helper.info(commonStrings.ARTICLE_ADDED)
                } else {
                  helper.error()
                }
              } catch (err) {
                helper.error(err)
              }
            }}
          >
            <CartIcon className={styles.buttonIcon} />
          </IconButton>
      }

      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={openDeleteDialog}
      >
        <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{commonStrings.REMOVE_FROM_CART_CONFIRM}</DialogContent>
        <DialogActions className='dialog-actions'>
          <Button onClick={() => setOpenDeleteDialog(false)} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
          <Button onClick={async () => {
            try {
              const cartId = await CartService.getCartId()
              const res = await CartService.deleteItem(cartId, product._id)

              if (res.status === 200) {
                setInCart(false)
                setCartItemCount(cartItemCount - 1)

                if (res.data.cartDeleted) {
                  await CartService.deleteCartId()
                }

                setOpenDeleteDialog(false)
                helper.info(commonStrings.ARTICLE_REMOVED)
              } else {
                helper.error()
              }
            } catch (err) {
              helper.error(err)
            }
          }} variant='contained' color='error'>{commonStrings.REMOVE_FROM_CART}</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
