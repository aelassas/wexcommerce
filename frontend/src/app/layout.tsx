import React from 'react'
import type { Metadata } from 'next'
import env from '@/config/env.config'

// import 'github-fork-ribbon-css/gh-fork-ribbon.css'
import '@/styles/globals.css'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  title: env.WEBSITE_NAME,
  description: 'Single Vendor Marketplace',
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => (
  <html>
    <body>
      {/* {
        process.env.NODE_ENV === 'production' &&
        <a
          className="github-fork-ribbon fixed left-bottom"
          href="https://github.com/aelassas/wexcommerce"
          data-ribbon="Fork me on GitHub"
          title="Fork me on GitHub">Fork me on GitHub
        </a>
      } */}
      {children}
    </body>
  </html>
)

export default RootLayout
