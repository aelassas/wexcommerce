import React from 'react'
import { AccountCircle } from '@mui/icons-material'

const Avatar = ({ size, color, className }) => (
    <div className={className}>
        <AccountCircle className={size ? ('avatar-' + size) : 'avatar'} color={color || 'inherit'} />
    </div>
)

export default Avatar