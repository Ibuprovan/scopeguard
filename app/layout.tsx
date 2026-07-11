import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'ScopeGuard — 范围蔓延守卫',
  description: '让每一次"再加一个需求"都可量化、可管理、可收费。自由职业者的范围蔓延追踪工具。',
  openGraph: {
    title: 'ScopeGuard — 范围蔓延守卫',
    description: '让每一次"再加一个需求"都可量化、可管理、可收费。自由职业者的范围蔓延追踪工具。',
    url: 'https://scopeguard.app',
    siteName: 'ScopeGuard',
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://scopeguard.app" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
