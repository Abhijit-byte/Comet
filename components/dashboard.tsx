'use client'

import { useEffect, useState } from 'react'
import { ActivitySquare, AlertTriangle, Zap, TrendingUp, Target, LogOut, Shield } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import Skeleton from 'react-loading-skeleton'
import { toast } from 'sonner'

interface DashboardProps {
  onAlertsDetected: (hasAlerts: boolean) => void
}

export default function Dashboard({ onAlertsDetected }: DashboardProps) {
  const [stats, setStats] = useState<any>(null)
  const [asteroids, setAsteroids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, logout, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsRes, asteroidsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/asteroids'),
        ])

        if (!statsRes.ok || !asteroidsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const statsData = await statsRes.json()
        const asteroidsData = await asteroidsRes.json()

        setStats(statsData)
        setAsteroids(asteroidsData.asteroids || [])

        const hazardousCount = asteroidsData.asteroids?.filter((a: any) => a.hazardous).length || 0
        onAlertsDetected(hazardousCount > 0)
        
        if (hazardousCount > 0) {
          toast.warning(`${hazardousCount} hazardous asteroids detected`, {
            duration: 3000,
          })
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load data'
        setError(errorMsg)
        toast.error(errorMsg)
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [onAlertsDetected])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-sm rounded-lg p-6">
              <Skeleton height={40} baseColor="rgba(0, 217, 255, 0.1)" highlightColor="rgba(0, 217, 255, 0.2)" />
              <Skeleton height={20} className="mt-4" baseColor="rgba(0, 217, 255, 0.1)" highlightColor="rgba(0, 217, 255, 0.2)" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-sm rounded-xl p-6">
              <Skeleton height={300} baseColor="rgba(0, 217, 255, 0.1)" highlightColor="rgba(0, 217, 255, 0.2)" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sci-fi-card border-red-500/50 bg-gradient-to-r from-red-950/40 to-red-900/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <div>
            <p className="font-bold text-red-300">Error Loading Data</p>
            <p className="text-sm text-red-200/70">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = asteroids.slice(0, 10).map((asteroid, idx) => ({
    name: asteroid.name.replace(/[^0-9]/g, '').slice(0, 6) || `A${idx + 1}`,
    velocity: parseFloat(asteroid.velocity) || 0,
    distance: (parseFloat(asteroid.distance) / 1000000) || 0,
  }))

  const StatCard = ({
    icon: Icon,
    label,
    value,
    unit,
    gradient,
    glow,
  }: {
    icon: React.ReactNode
    label: string
    value: string | number
    unit: string
    gradient: string
    glow: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`group sci-fi-card border neon-border p-6 overflow-hidden relative ${gradient} cursor-pointer`}
      style={{ boxShadow: `0 0 20px ${glow}` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">{Icon}</div>
          <ActivitySquare className="h-4 w-4 text-cyan-400/50" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{value}</span>
            <span className="text-xs text-slate-400">{unit}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-8">
      {/* Session Control Panel */}
      {isAuthenticated && user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="sci-fi-card neon-border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 to-violet-950/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30">
                <Shield className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Operator Session</p>
                <p className="text-xs text-slate-400 mt-1">
                  Active User: <span className="font-mono text-cyan-400">{user.username || user.email}</span>
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/50 hover:border-red-400/70 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
            >
              <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-300" />
              <span className="font-bold text-red-300 group-hover:text-red-200 uppercase tracking-wider">
                Terminate Session
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* SassName="space-y-8">
      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-bold text-cyan-300 mb-4 uppercase tracking-wider">System Metrics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Zap className="h-6 w-6 text-cyan-400" />}
            label="Total NEOs Tracked"
            value={stats?.totalAsteroids || 0}
            unit="objects"
            gradient="from-cyan-950/40 to-cyan-900/20"
            glow="rgba(0, 217, 255, 0.3)"
          />
          <StatCard
            icon={<AlertTriangle className="h-6 w-6 text-orange-400" />}
            label="Hazardous Objects"
            value={stats?.hazardousCount || 0}
            unit={`${stats?.hazardousPercentage || 0}%`}
            gradient="from-orange-950/40 to-red-900/20"
            glow="rgba(255, 165, 0, 0.3)"
          />
          <StatCard
            icon={<Target className="h-6 w-6 text-green-400" />}
            label="Safe Objects"
            value={stats?.safeCount || 0}
            unit="monitored"
            gradient="from-green-950/40 to-emerald-900/20"
            glow="rgba(34, 197, 94, 0.3)"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6 text-violet-400" />}
            label="Max Velocity"
            value={stats?.maxVelocity || 0}
            unit="km/s"
            gradient="from-violet-950/40 to-purple-900/20"
            glow="rgba(139, 92, 246, 0.3)"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {/* Velocity Distribution */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="sci-fi-card neon-border hover:shadow-2xl hover:shadow-cyan-500/10"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-300 uppercase tracking-wider">Velocity Distribution</h3>
            <p className="text-xs text-slate-400 mt-1">Top 10 asteroids by velocity</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 14, 39, 0.9)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="velocity" fill="#00d9ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distance from Earth */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="sci-fi-card neon-border hover:shadow-2xl hover:shadow-violet-500/10"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-violet-300 uppercase tracking-wider">Distance from Earth</h3>
            <p className="text-xs text-slate-400 mt-1">Top 10 asteroids by distance (millions km)</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 14, 39, 0.9)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="distance" stroke="#8b5cf6" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Close Approaches Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="sci-fi-card neon-border"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-cyan-300 uppercase tracking-wider">Close Approaches</h3>
          <p className="text-xs text-slate-400 mt-1">Next 7 days - Real-time monitoring</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/30">
                <th className="px-4 py-3 text-left font-bold text-cyan-300 uppercase text-xs">Name</th>
                <th className="px-4 py-3 text-left font-bold text-cyan-300 uppercase text-xs">Diameter</th>
                <th className="px-4 py-3 text-left font-bold text-cyan-300 uppercase text-xs">Velocity</th>
                <th className="px-4 py-3 text-left font-bold text-cyan-300 uppercase text-xs">Distance</th>
                <th className="px-4 py-3 text-left font-bold text-cyan-300 uppercase text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {asteroids.slice(0, 5).map((asteroid, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  whileHover={{ backgroundColor: 'rgba(0, 217, 255, 0.05)', scale: 1.01 }}
                  className="border-b border-cyan-500/10 transition-colors duration-300 group"
                >
                  <td className="px-4 py-3 font-semibold text-cyan-200 group-hover:text-cyan-300">{asteroid.name}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {asteroid.diameter ? `${(asteroid.diameter.estimated_diameter_max || 0).toFixed(1)}m` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{parseFloat(asteroid.velocity).toFixed(2)} km/s</td>
                  <td className="px-4 py-3 text-slate-300">{(parseFloat(asteroid.distance) / 1000000).toFixed(2)}M km</td>
                  <td className="px-4 py-3">
                    {asteroid.hazardous ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/30 to-red-500/30 border border-orange-500/50 text-orange-300 text-xs font-bold uppercase">
                        <AlertTriangle className="h-3 w-3" />
                        HAZARD
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/50 text-green-300 text-xs font-bold uppercase">
                        <Zap className="h-3 w-3" />
                        SAFE
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

