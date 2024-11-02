'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@mui/material'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'

interface ToastWishlistProps {
  action: 'add' | 'remove'
}

const ToastWishlist: React.FC<ToastWishlistProps> = ({ action }) => {
  const router = useRouter()

  return (
    <div style={helper.toastComponentContainerStyle}>
      <span style={helper.toastComponentTextStyle}>
        {action === 'add' ? commonStrings.ARTICLE_ADDED_TO_WISH_LIST : commonStrings.ARTICLE_REMOVED_FROM_WISH_LIST}
      </span>
      <Button
        variant="contained"
        size="small"
        style={helper.toastComponentButtonStyle}
        className="toastButton"
        onClick={() => {
          router.push('/wishlist')
          router.refresh()
        }}
      >
        {commonStrings.VIEW_WISHLIST}
      </Button>
    </div>
  )
}



export default ToastWishlist
