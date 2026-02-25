'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@mui/material'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/utils/helper'

interface ToastCartProps {
  action: 'add' | 'remove'
}

const ToastCart: React.FC<ToastCartProps> = ({ action }) => {
  const router = useRouter()

  return (
    <div style={helper.toastComponentContainerStyle}>
      <span style={helper.toastComponentTextStyle}>
        {action === 'add' ? commonStrings.ARTICLE_ADDED : commonStrings.ARTICLE_REMOVED}
      </span>
      <Button
        variant="contained"
        size="small"
        style={helper.toastComponentButtonStyle}
        className="toastButton"
        onClick={() => {
          router.push('/cart')
          // router.refresh()
        }}
      >
        {commonStrings.VIEW_CART}
      </Button>
    </div>
  )
}

export default ToastCart
