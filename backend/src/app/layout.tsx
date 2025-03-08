import React from 'react'
import type { Metadata } from 'next'
import '@/styles/globals.css'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  title: 'wexCommerce',
  description: 'Minimalistic but powerful eCommerce platform',
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => (
  <html>
    <body>{children}</body>
  </html>
)

export default RootLayout
