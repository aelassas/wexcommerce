'use client'

import React from 'react'
import { Backdrop, CircularProgress } from '@mui/material'

interface SimpleBackdropProps {
  text?: string
  progress?: boolean
}

const SimpleBackdrop: React.FC<SimpleBackdropProps> = ({ text, progress }) => (
  <div>
    <Backdrop
      open
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      {text}
      {progress ? <CircularProgress color="inherit" /> : null}
    </Backdrop>
  </div>
)

export default SimpleBackdrop
