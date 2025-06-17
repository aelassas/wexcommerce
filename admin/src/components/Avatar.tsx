'use client'

import React from 'react'
import { AccountCircle } from '@mui/icons-material'

interface AvatarProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'disabled' | 'action' | 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ size, color, className }) => (
  <div className={className}>
    <AccountCircle className={size ? ('avatar-' + size) : 'avatar'} color={color || 'inherit'} />
  </div>
)

export default Avatar
