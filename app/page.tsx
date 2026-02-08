'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Radio, TrendingUp, Zap, Search, Satellite, Menu, X, Sparkles } from 'lucide-react'
import Dashboard from '@/components/dashboard'
import AsteroidList from '@/components/asteroid-list'
import RiskAnalysis from '@/components/risk-analysis'
import Chat from '@/components/chat'
import AsteroidSearch from '@/components/asteroid-search'
import UserMenu from '@/components/user-menu'
import { motion } from 'framer-motion'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [hasAlerts, setHasAlerts] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Zap },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'asteroids', label: 'Asteroids', icon: TrendingUp },
    { id: 'analysis', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'chat', label: 'AI Assistant', icon: Radio },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden text-slate-200 selection:bg-cyan-500/30">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/media/15562120-hd_1920_1080_24fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
      {/* Top Header */}
      <div className="relative border-b border-cyan-500/20 bg-black/40 backdrop-blur-md z-40">
        <div className="mx-auto max-w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-300" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-black">
                    <Satellite className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                    CosmosTrace
                  </h1>
                  <p className="text-xs text-cyan-300/60">NEO Command Center</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-green-500 glow-pulse" />
                <span className="text-xs font-semibold text-green-400">System Active</span>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-30 flex gap-0 min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div
          className={`fixed lg:relative w-64 h-full bg-black/60 border-r border-cyan-500/20 backdrop-blur-md overflow-y-auto transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="p-6 space-y-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.03, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/30 to-violet-500/30 border border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300 border border-transparent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">{item.label}</span>
                  {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-cyan-400" />}
                </motion.button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Alert Banner */}
            {hasAlerts && (
              <div className="mb-8 p-4 rounded-lg border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-sm font-semibold text-orange-300">High-Risk Asteroids Detected</p>
                    <p className="text-xs text-orange-200/70">Check Risk Analysis tab for detailed information</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="hidden grid w-full grid-cols-5 bg-black/40 border border-cyan-500/20 backdrop-blur-md mb-8">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-violet-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {/* Content Tabs */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-violet-950/40 p-8 md:p-12"
                >
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1],
                      }}
                      transition={{ duration: 20, repeat: Infinity }}
                      className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.1, 0.2, 0.1],
                      }}
                      transition={{ duration: 25, repeat: Infinity }}
                      className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl"
                    />
                  </div>

                  <div className="relative z-10 text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 backdrop-blur-sm"
                    >
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                        Real-Time NEO Intelligence Platform
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent"
                    >
                      CosmosTrace
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-lg md:text-xl text-cyan-300/80 max-w-3xl mx-auto"
                    >
                      Real-Time Near Earth Object Intelligence Platform
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="text-sm text-slate-400 max-w-2xl mx-auto"
                    >
                      Monitor NEOs, analyze threats, and explore NASA's comprehensive database with enterprise-grade tools and AI-powered insights
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="flex flex-wrap items-center justify-center gap-4 pt-4"
                    >
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-green-400">SYSTEM ONLINE</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                        <Satellite className="h-3 w-3 text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-400">NASA DATA LIVE</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <Dashboard onAlertsDetected={setHasAlerts} />
              </TabsContent>

              <TabsContent value="search" className="space-y-6">
                <AsteroidSearch />
              </TabsContent>

              <TabsContent value="asteroids" className="space-y-6">
                <AsteroidList />
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <RiskAnalysis />
              </TabsContent>

              <TabsContent value="chat" className="space-y-6">
                <Chat />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  )
}

