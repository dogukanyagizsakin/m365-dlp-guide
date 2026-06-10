import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'M365 DLP Rehberi — UnifyTech',
  description: 'Microsoft 365 Data Loss Prevention adım adım yapılandırma rehberi',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  )
}
