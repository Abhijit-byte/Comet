'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface DashboardProps {
  onAlertsDetected: (hasAlerts: boolean) => void
}

export default function Dashboard({ onAlertsDetected }: DashboardProps) {
  const [stats, setStats] = useState<any>(null)
  const [asteroids, setAsteroids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsRes, asteroidsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/asteroids'),
        ])

        if (!statsRes.ok || !asteroidsRes.ok) throw new Error('Failed to fetch data')

        const statsData = await statsRes.json()
        const asteroidsData = await asteroidsRes.json()

        setStats(statsData)
        setAsteroids(asteroidsData.asteroids || [])

        // Check for hazardous asteroids
        const hazardousCount = asteroidsData.asteroids?.filter((a: any) => a.hazardous).length || 0
        onAlertsDetected(hazardousCount > 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
        console.error('[v0] Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [onAlertsDetected])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <Activity className="h-8 w-8 text-blue-500" />
        </div>
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

  // Prepare chart data
  const chartData = asteroids.slice(0, 10).map((asteroid, idx) => ({
    name: asteroid.name.replace(/[^0-9]/g, '').slice(0, 6) || `A${idx + 1}`,
    velocity: parseFloat(asteroid.velocity) || 0,
    distance: parseFloat(asteroid.distance) || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total NEOs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalAsteroids || 0}</div>
            <p className="text-xs text-slate-400">Near-Earth Objects tracked</p>
          </CardContent>
        </Card>

        <Card className="border-orange-800 bg-orange-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-400">Hazardous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-200">{stats?.hazardousCount || 0}</div>
            <p className="text-xs text-orange-300">{stats?.hazardousPercentage || 0}% of total</p>
          </CardContent>
        </Card>

        <Card className="border-green-800 bg-green-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Safe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-200">{stats?.safeCount || 0}</div>
            <p className="text-xs text-green-300">Non-hazardous NEOs</p>
          </CardContent>
        </Card>

        <Card className="border-blue-800 bg-blue-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Max Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-200">{stats?.maxVelocity || 0}</div>
            <p className="text-xs text-blue-300">km/s fastest</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle>Velocity Distribution</CardTitle>
            <CardDescription>Top asteroids by velocity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Bar dataKey="velocity" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle>Distance from Earth</CardTitle>
            <CardDescription>Top asteroids by distance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Line type="monotone" dataKey="distance" stroke="#06b6d4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Close Approach Table */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle>Close Approaches (Next 7 Days)</CardTitle>
          <CardDescription>Recently discovered or closely approaching asteroids</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-2 text-left font-medium text-slate-300">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-300">Diameter (m)</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-300">Velocity (km/s)</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-300">Distance (km)</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {asteroids.slice(0, 5).map((asteroid, idx) => (
                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="px-4 py-2">{asteroid.name}</td>
                    <td className="px-4 py-2">
                      {asteroid.diameter ? `${(asteroid.diameter.estimated_diameter_max || 0).toFixed(1)}` : 'N/A'}
                    </td>
                    <td className="px-4 py-2">{parseFloat(asteroid.velocity).toFixed(2)}</td>
                    <td className="px-4 py-2">{(parseFloat(asteroid.distance) / 1000000).toFixed(2)}M</td>
                    <td className="px-4 py-2">
                      {asteroid.hazardous ? (
                        <Badge className="bg-orange-600">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Hazardous
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600">Safe</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
