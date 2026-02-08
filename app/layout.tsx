import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'sonner'
import 'react-loading-skeleton/dist/skeleton.css'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CosmosTrace - NEO Command Center',
  description: 'Enterprise-grade NEO monitoring system - Real-time asteroid tracking and risk analysis from NASA',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-100 antialiased">
        <div className="grid-bg fixed inset-0 opacity-5 pointer-events-none" />
        <Toaster 
          position="top-right" 
          theme="dark" 
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              color: '#00d9ff',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

