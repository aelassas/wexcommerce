import React from 'react'
import type { Metadata } from 'next'
import ScrollToTop from '@/components/ScrollToTop'

import '@/styles/globals.css'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  title: 'wexCommerce Admin Panel',
  description: 'Single Vendor Marketplace',
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => (
  <html>
    <body>
      <ScrollToTop />
      {children}
    </body>
  </html>
)

export default RootLayout
