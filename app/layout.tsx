import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'CyberGuardian AI - Advanced Security Dashboard',
  description: 'Next-generation AI-powered cybersecurity platform with real-time threat detection, behavioral analysis, and automated response.',
  keywords: 'cybersecurity, AI security, threat detection, malware protection, endpoint security',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-dark-bg text-dark-text`}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}