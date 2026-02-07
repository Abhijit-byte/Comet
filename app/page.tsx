'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Radio, TrendingUp, Zap, Search } from 'lucide-react'
import Dashboard from '@/components/dashboard'
import AsteroidList from '@/components/asteroid-list'
import RiskAnalysis from '@/components/risk-analysis'
import Chat from '@/components/chat'
import AsteroidSearch from '@/components/asteroid-search'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [hasAlerts, setHasAlerts] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Cosmic Watch</h1>
                <p className="text-sm text-slate-400">NEO Real-Time Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-sm text-green-400">Live Feed Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Alert Banner */}
        {hasAlerts && (
          <Alert className="mb-6 border-orange-800 bg-orange-950">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-200">
              High-risk asteroids detected! Check Risk Analysis for details.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
              <Zap className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-blue-600">
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="asteroids" className="data-[state=active]:bg-blue-600">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Asteroids</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Risk</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-blue-600">
              <Radio className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard onAlertsDetected={setHasAlerts} />
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <AsteroidSearch />
          </TabsContent>

          {/* Asteroids Tab */}
          <TabsContent value="asteroids" className="space-y-6">
            <AsteroidList />
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <RiskAnalysis />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Chat />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
