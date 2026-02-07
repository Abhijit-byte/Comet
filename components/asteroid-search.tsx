'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink, Search, Loader2 } from 'lucide-react'

export default function AsteroidSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [asteroidResult, setAsteroidResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [famousAsteroids] = useState([
    { name: 'Eros', description: 'S-type asteroid, visited by NEAR mission' },
    { name: 'Apophis', description: '325m asteroid with close Earth approaches' },
    { name: 'Bennu', description: 'B-type asteroid, OSIRIS-REx sample return' },
    { name: 'Itokawa', description: 'S-type asteroid, Hayabusa mission' },
    { name: '2023 DW', description: 'Recently discovered near-Earth object' },
    { name: 'Toutatis', description: 'Difficult-to-reach asteroid, multiple encounters' },
  ])

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      setLoading(true)
      setError(null)
      setAsteroidResult(null)

      const res = await fetch(`/api/asteroid-lookup?name=${encodeURIComponent(query)}`)

      if (!res.ok) {
        throw new Error(`Asteroid "${query}" not found in NASA database`)
      }

      const data = await res.json()
      setAsteroidResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle>Find Any Asteroid</CardTitle>
          <CardDescription>Search the NASA NEO database for any near-Earth object</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search by asteroid name (e.g., Eros, Apophis, Bennu)..."
                className="border-slate-600 bg-slate-700 pl-10 text-white placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery)
                  }
                }}
              />
            </div>
            <Button
              onClick={() => handleSearch(searchQuery)}
              disabled={loading || !searchQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md border border-orange-800 bg-orange-950 p-3 text-sm text-orange-200">
              {error}
            </div>
          )}

          {/* Search Result */}
          {asteroidResult && (
            <div className={`space-y-3 rounded-lg border p-4 ${asteroidResult.hazardous ? 'border-orange-800 bg-orange-950/30' : 'border-green-800 bg-green-950/30'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{asteroidResult.name}</h3>
                  <p className="text-sm text-slate-400">ID: {asteroidResult.id}</p>
                </div>
                {asteroidResult.hazardous && (
                  <Badge className="bg-orange-600">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Hazardous
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-400">Diameter</p>
                  <p className="font-semibold text-white">
                    {asteroidResult.diameter ? `${asteroidResult.diameter.estimated_diameter_max?.toFixed(1) || 'N/A'}m` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Magnitude</p>
                  <p className="font-semibold text-white">{asteroidResult.absoluteMagnitude?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Orbital Period</p>
                  <p className="font-semibold text-white">
  {asteroidResult.orbitalData?.orbital_period
    ? `${Number(asteroidResult.orbitalData.orbital_period).toFixed(1)} days`
    : "N/A"}
</p>

                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <Badge className={asteroidResult.hazardous ? 'bg-orange-600' : 'bg-green-600'}>
                    {asteroidResult.hazardous ? 'Hazardous' : 'Safe'}
                  </Badge>
                </div>
              </div>

              {/* Close Approach Data */}
              {asteroidResult.closeApproachData && asteroidResult.closeApproachData.length > 0 && (
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-sm font-semibold text-slate-300 mb-2">Next Close Approaches:</p>
                  <div className="space-y-2">
                    {asteroidResult.closeApproachData.slice(0, 3).map((approach: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-400">
                        <span>{approach.close_approach_date}</span>
                        <span>{parseFloat(approach.miss_distance?.kilometers || 0).toLocaleString()} km</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {asteroidResult.url && (
                <Button
                  variant="outline"
                  className="w-full border-blue-600 text-blue-300 hover:bg-blue-900 bg-transparent"
                  onClick={() => window.open(asteroidResult.url, '_blank')}
                >
                  View on NASA JPL
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Famous Asteroids */}
          <div className="space-y-3 border-t border-slate-700 pt-4">
            <p className="text-sm font-semibold text-slate-300">Famous Asteroids:</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {famousAsteroids.map((asteroid) => (
                <button
                  key={asteroid.name}
                  onClick={() => {
                    setSearchQuery(asteroid.name)
                    setTimeout(() => handleSearch(asteroid.name), 0)
                  }}
                  className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-700/50 p-3 text-left hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{asteroid.name}</p>
                    <p className="text-xs text-slate-400">{asteroid.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
