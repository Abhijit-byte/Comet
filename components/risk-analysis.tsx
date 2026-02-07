'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Activity, TrendingUp, Target } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function RiskAnalysis() {
  const [stats, setStats] = useState<any>(null)
  const [asteroids, setAsteroids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsRes, asteroidsRes] = await Promise.all([fetch('/api/stats'), fetch('/api/asteroids')])

        if (!statsRes.ok || !asteroidsRes.ok) throw new Error('Failed to fetch data')

        const statsData = await statsRes.json()
        const asteroidsData = await asteroidsRes.json()

        setStats(statsData)
        setAsteroids(asteroidsData.asteroids || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis')
        console.error('Risk analysis error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-sm h-32 rounded-xl shimmer" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="sci-fi-card border-red-500/50 bg-gradient-to-r from-red-950/40 to-red-900/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  const hazardousAsteroids = asteroids.filter((a) => a.hazardous)
  const closestApproaches = asteroids
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, 5)
  const largestAsteroids = asteroids
    .sort((a, b) => (b.diameter?.estimated_diameter_max || 0) - (a.diameter?.estimated_diameter_max || 0))
    .slice(0, 5)

  const pieData = [
    { name: 'Hazardous', value: stats?.hazardousCount || 0, color: '#ff6b35' },
    { name: 'Safe', value: stats?.safeCount || 0, color: '#00d9ff' },
  ]

  const riskByVelocity = asteroids
    .slice(0, 10)
    .map((a, idx) => ({
      name: `A${idx + 1}`,
      risk: Math.min(100, parseFloat(a.velocity) * 2),
    }))

  const RiskCard = ({
    icon: Icon,
    label,
    value,
    subtitle,
    gradient,
    glow,
  }: {
    icon: React.ReactNode
    label: string
    value: string | number
    subtitle: string
    gradient: string
    glow: string
  }) => (
    <div
      className={`sci-fi-card neon-border p-6 ${gradient}`}
      style={{ boxShadow: `0 0 20px ${glow}` }}
    >
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">{Icon}</div>
        <Target className="h-4 w-4 text-cyan-400/50" />
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="text-3xl font-bold text-white">{value}</div>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Risk Overview */}
      <div>
        <h2 className="text-lg font-bold text-cyan-300 mb-4 uppercase tracking-wider">Threat Assessment</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <RiskCard
            icon={<AlertTriangle className="h-6 w-6 text-orange-400" />}
            label="Critical Risk"
            value={hazardousAsteroids.length}
            subtitle="Potentially hazardous NEOs"
            gradient="from-orange-950/40 to-red-900/20"
            glow="rgba(255, 165, 0, 0.3)"
          />
          <RiskCard
            icon={<TrendingUp className="h-6 w-6 text-yellow-400" />}
            label="High Velocity"
            value={asteroids.filter((a) => parseFloat(a.velocity) > 50).length}
            subtitle="Moving > 50 km/s"
            gradient="from-yellow-950/40 to-orange-900/20"
            glow="rgba(234, 179, 8, 0.3)"
          />
          <RiskCard
            icon={<Target className="h-6 w-6 text-red-400" />}
            label="Close Passes"
            value={asteroids.filter((a) => parseFloat(a.distance) < 4000000).length}
            subtitle="Within 4M km"
            gradient="from-red-950/40 to-pink-900/20"
            glow="rgba(239, 68, 68, 0.3)"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="sci-fi-card neon-border">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-300 uppercase tracking-wider">Hazard Distribution</h3>
            <p className="text-xs text-slate-400 mt-1">Safe vs Hazardous Objects</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={pieData} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                label={({ name, value }) => `${name}: ${value}`} 
                outerRadius={80} 
                fill="#8884d8" 
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 14, 39, 0.9)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="sci-fi-card neon-border">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-violet-300 uppercase tracking-wider">Risk Score</h3>
            <p className="text-xs text-slate-400 mt-1">Impact Risk Assessment</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskByVelocity}>
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
              <Bar dataKey="risk" fill="#ff6b35" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Closest Approaches */}
      <div className="sci-fi-card neon-border">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-cyan-300 uppercase tracking-wider">Closest Approaches</h3>
          <p className="text-xs text-slate-400 mt-1">Five nearest asteroids to Earth</p>
        </div>
        <div className="space-y-4">
          {closestApproaches.map((asteroid, idx) => (
            <div key={idx} className="glass-sm neon-border p-4 rounded-lg group hover:bg-cyan-500/5 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-cyan-300">{asteroid.name}</p>
                  <p className="text-xs text-cyan-400/60 font-mono">Approach: {asteroid.date?.split('T')[0]}</p>
                </div>
                {asteroid.hazardous && (
                  <span className="px-2 py-1 rounded bg-orange-500/30 border border-orange-500/50 text-orange-300 text-xs font-bold uppercase">
                    HAZARD
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-cyan-400/70 font-mono min-w-fit">
                  {(parseFloat(asteroid.distance) / 1000000).toFixed(2)}M km
                </span>
                <div className="flex-1 h-1 bg-cyan-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, (parseFloat(asteroid.distance) / 100000000) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Largest Asteroids */}
      <div className="sci-fi-card neon-border">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-violet-300 uppercase tracking-wider">Largest Asteroids</h3>
          <p className="text-xs text-slate-400 mt-1">Five biggest objects tracked</p>
        </div>
        <div className="space-y-4">
          {largestAsteroids.map((asteroid, idx) => (
            <div key={idx} className="glass-sm neon-border-purple p-4 rounded-lg group hover:bg-violet-500/5 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-violet-300">{asteroid.name}</p>
                  <p className="text-xs text-violet-400/60 font-mono">
                    Diameter: {(asteroid.diameter?.estimated_diameter_max || 0).toFixed(1)}m
                  </p>
                </div>
                {asteroid.hazardous && (
                  <span className="px-2 py-1 rounded bg-orange-500/30 border border-orange-500/50 text-orange-300 text-xs font-bold uppercase">
                    HAZARD
                  </span>
                )}
              </div>
              <div className="flex-1 h-1 bg-violet-500/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                  style={{
                    width: `${Math.min(100, (asteroid.diameter?.estimated_diameter_max || 0) / 10)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Legend */}
      <div className="sci-fi-card neon-border">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-cyan-300 uppercase tracking-wider">Risk Criteria</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-sm p-3 rounded border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
              <span className="text-xs font-bold text-orange-300 uppercase">HAZARDOUS</span>
            </div>
            <p className="text-xs text-slate-400">Larger than 140m with close approach within 19.5M km</p>
          </div>
          <div className="glass-sm p-3 rounded border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" />
              <span className="text-xs font-bold text-yellow-300 uppercase">HIGH VELOCITY</span>
            </div>
            <p className="text-xs text-slate-400">Objects moving faster than 50 km/s</p>
          </div>
          <div className="glass-sm p-3 rounded border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500" />
              <span className="text-xs font-bold text-red-300 uppercase">VERY CLOSE</span>
            </div>
            <p className="text-xs text-slate-400">Closer than 4 million kilometers</p>
          </div>
          <div className="glass-sm p-3 rounded border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
              <span className="text-xs font-bold text-green-300 uppercase">SAFE</span>
            </div>
            <p className="text-xs text-slate-400">Non-hazardous objects monitored</p>
          </div>
        </div>
      </div>
    </div>
  )
}

