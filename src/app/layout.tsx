import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'M365 DLP Rehberi — UnifyTech',
  description: 'Microsoft 365 Data Loss Prevention adım adım yapılandırma rehberi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
