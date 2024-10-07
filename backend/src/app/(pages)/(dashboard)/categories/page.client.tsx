'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@mui/material'
import { strings } from '@/lang/categories'

import styles from '@/styles/categories.module.css'

export const NewCategoryButton: React.FC = () => {
  const router = useRouter()

  return (
    <Button
      variant="contained"
      className={`btn-primary ${styles.newCategory}`}
      size="small"
      onClick={() => {
        router.push('/create-category')
      }}
    >
      {strings.NEW_CATEGORY}
    </Button>
  )
}
