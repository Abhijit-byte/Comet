'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Activity, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

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
        console.error('[v0] Risk analysis error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Activity className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-800 bg-red-950">
        <CardContent className="pt-6 text-red-200">{error}</CardContent>
      </Card>
    )
  }

  // Risk categorization
  const hazardousAsteroids = asteroids.filter((a) => a.hazardous)
  const closestApproaches = asteroids
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, 5)
  const largestAsteroids = asteroids
    .sort((a, b) => (b.diameter?.estimated_diameter_max || 0) - (a.diameter?.estimated_diameter_max || 0))
    .slice(0, 5)

  const pieData = [
    { name: 'Hazardous', value: stats?.hazardousCount || 0, color: '#ea580c' },
    { name: 'Safe', value: stats?.safeCount || 0, color: '#16a34a' },
  ]

  const riskByVelocity = asteroids
    .slice(0, 10)
    .map((a, idx) => ({
      name: `A${idx + 1}`,
      risk: Math.min(100, parseFloat(a.velocity) * 2),
    }))

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-orange-800 bg-orange-950/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              Critical Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-200">{hazardousAsteroids.length}</div>
            <p className="text-xs text-orange-300">Potentially hazardous asteroids</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-800 bg-yellow-950/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-yellow-400">
              <TrendingUp className="h-4 w-4" />
              High Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-200">
              {asteroids.filter((a) => parseFloat(a.velocity) > 50).length}
            </div>
            <p className="text-xs text-yellow-300">Asteroids moving above 50 km/s</p>
          </CardContent>
        </Card>

        <Card className="border-red-800 bg-red-950/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Very Close Pass</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-200">
              {asteroids.filter((a) => parseFloat(a.distance) < 4000000).length}
            </div>
            <p className="text-xs text-red-300">Within 4 million km</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle>Hazard Distribution</CardTitle>
            <CardDescription>Safe vs Hazardous objects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle>Risk Score by Velocity</CardTitle>
            <CardDescription>Impact risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskByVelocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Bar dataKey="risk" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Closest Approaches */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle>Closest Approaches</CardTitle>
          <CardDescription>Five nearest asteroids to Earth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {closestApproaches.map((asteroid, idx) => (
            <div key={idx} className="space-y-2 border-b border-slate-700 pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{asteroid.name}</p>
                  <p className="text-xs text-slate-400">Closest approach: {asteroid.date?.split('T')[0]}</p>
                </div>
                {asteroid.hazardous && <Badge className="bg-orange-600">Hazardous</Badge>}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Distance: </span>
                  <span className="font-semibold text-white">{(parseFloat(asteroid.distance) / 1000000).toFixed(2)}M km</span>
                </div>
                <Progress value={Math.max(0, Math.min(100, (parseFloat(asteroid.distance) / 100000000) * 100))} className="flex-1" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Largest Asteroids */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle>Largest Asteroids</CardTitle>
          <CardDescription>Five biggest objects tracked</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {largestAsteroids.map((asteroid, idx) => (
            <div key={idx} className="space-y-2 border-b border-slate-700 pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{asteroid.name}</p>
                  <p className="text-xs text-slate-400">Diameter: {(asteroid.diameter?.estimated_diameter_max || 0).toFixed(1)}m</p>
                </div>
                {asteroid.hazardous && <Badge className="bg-orange-600">Hazardous</Badge>}
              </div>
              <Progress value={Math.min(100, (asteroid.diameter?.estimated_diameter_max || 0) / 10)} className="flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Assessment Legend */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle>Risk Assessment Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded bg-orange-600" />
            <span className="text-slate-300">Potentially Hazardous: Larger than 140m with close approach within 19.5M km</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded bg-yellow-600" />
            <span className="text-slate-300">High Velocity: Objects moving faster than 50 km/s</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded bg-red-600" />
            <span className="text-slate-300">Very Close Pass: Closer than 4 million kilometers</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded bg-green-600" />
            <span className="text-slate-300">Safe: Non-hazardous objects tracked for monitoring</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
