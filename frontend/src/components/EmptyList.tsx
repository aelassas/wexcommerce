import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'

import styles from '@/styles/empty-list.module.css'

interface EmptyListProps {
  text: string,
  marginTop?: boolean
}

const EmptyList: React.FC<EmptyListProps> = ({ text, marginTop }) => (
  <Card variant="outlined" className={styles.emptyList} style={{ marginTop: marginTop ? 15 : 0 }}>
    <CardContent>
      <Typography color="textSecondary">{text}</Typography>
    </CardContent>
  </Card>
)

export default EmptyList
