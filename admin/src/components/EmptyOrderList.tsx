import React from 'react'
import { strings } from '@/lang/orders'
import EmptyList from './EmptyList'

export const EmptyOrderList: React.FC = () => (
  <EmptyList text={strings.EMPTY_LIST} />
)

export default EmptyOrderList
