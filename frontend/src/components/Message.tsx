'use client'

import React from 'react'

import styles from '@/styles/message.module.css'

interface MessageProps {
  message: string
}

const Message: React.FC<MessageProps> = ({ message }) => (
  <div className={styles.message}>{message}</div>
)

export default Message
