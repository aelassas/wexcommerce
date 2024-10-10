'use client'

import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'
import * as wexcommerceTypes from ':wexcommerce-types'
import { strings } from '@/lang/wishlist'

import styles from '@/styles/wishlist.module.css'

export const EmptyWishlist: React.FC = () => (
  <Card variant="outlined" className={styles.empty}>
    <CardContent>
      <Typography color="textSecondary">{strings.EMPTY}</Typography>
    </CardContent>
  </Card>
)

interface WishlistProps {
  wishlist: wexcommerceTypes.Wishlist
}

const Wishlist: React.FC<WishlistProps> = ({ wishlist }) => {
  return (
    <div>{`Products: ${wishlist.products.length}`}</div>
  )
}

export default Wishlist
