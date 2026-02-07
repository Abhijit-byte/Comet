'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink, Search, Activity, Zap } from 'lucide-react'

export default function AsteroidList() {
  const [asteroids, setAsteroids] = useState<any[]>([])
  const [filteredAsteroids, setFilteredAsteroids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterHazardous, setFilterHazardous] = useState(false)
  const [searchMode, setSearchMode] = useState(false)

  useEffect(() => {
    const fetchAsteroids = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/asteroids')
        if (!res.ok) throw new Error('Failed to fetch asteroids')

        const data = await res.json()
        setAsteroids(data.asteroids || [])
        setFilteredAsteroids(data.asteroids || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load asteroids')
        console.error('[v0] Asteroid list error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAsteroids()
  }, [])

  // Search for specific asteroids by name (e.g., Eros, Apophis)
  const handleSpecialSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      setSearching(true)
      setError(null)
      const res = await fetch(`/api/asteroid-lookup?name=${encodeURIComponent(query)}`)
      
      if (!res.ok) {
        throw new Error(`Asteroid "${query}" not found`)
      }

      const asteroid = await res.json()
      setAsteroids([asteroid])
      setFilteredAsteroids([asteroid])
      setSearchMode(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Asteroid not found')
      setAsteroids([])
      setFilteredAsteroids([])
    } finally {
      setSearching(false)
    }
  }

  // Filter asteroids based on search and filters
  useEffect(() => {
    let filtered = asteroids

    if (searchTerm && !searchMode) {
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (filterHazardous) {
      filtered = filtered.filter((a) => a.hazardous)
    }

    setFilteredAsteroids(filtered)
  }, [searchTerm, filterHazardous, asteroids, searchMode])

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

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle>Near-Earth Objects Catalog</CardTitle>
          <CardDescription>Browse and filter all tracked asteroids</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search asteroids by name..."
                  className="border-slate-600 bg-slate-700 pl-10 text-white placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSearchMode(false)
                  }}
                />
              </div>
              <Button
                onClick={() => setFilterHazardous(!filterHazardous)}
                variant={filterHazardous ? 'default' : 'outline'}
                className={filterHazardous ? 'bg-orange-600' : 'border-slate-600 text-slate-300'}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Hazardous Only
              </Button>
            </div>

            {/* Quick Search for Famous Asteroids */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 border-t border-slate-700 pt-3">
              <div className="col-span-2 text-xs font-semibold text-slate-400">Quick Search:</div>
              {['Eros', 'Apophis', 'Bennu', 'Itokawa'].map((name) => (
                <Button
                  key={name}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleSpecialSearch(name)
                    setSearchTerm('')
                  }}
                  disabled={searching}
                  className="border-blue-800 bg-blue-950 text-blue-300 hover:bg-blue-900 text-xs"
                >
                  <Zap className="mr-1 h-3 w-3" />
                  {name}
                </Button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md border border-orange-800 bg-orange-950 p-3 text-sm text-orange-200">
              {error}
              {searchMode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchMode(false)
                    setSearchTerm('')
                    setError(null)
                    setLoading(true)
                    fetch('/api/asteroids')
                      .then((res) => res.json())
                      .then((data) => {
                        setAsteroids(data.asteroids || [])
                        setFilteredAsteroids(data.asteroids || [])
                        setLoading(false)
                      })
                      .catch(() => setLoading(false))
                  }}
                  className="ml-2 border-orange-600 text-orange-300 hover:bg-orange-900"
                >
                  Back to Live Feed
                </Button>
              )}
            </div>
          )}

          {/* Results Count */}
          <p className="text-sm text-slate-400">
            Showing {filteredAsteroids.length} {searchMode ? 'search result' : `of ${asteroids.length} asteroids`}
          </p>

          {/* Asteroids Grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredAsteroids.length > 0 ? (
              filteredAsteroids.map((asteroid, idx) => (
                <Card
                  key={idx}
                  className={`border ${asteroid.hazardous ? 'border-orange-800 bg-orange-950/30' : 'border-slate-700 bg-slate-700/50'}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2 text-base text-white">{asteroid.name}</CardTitle>
                        <p className="text-xs text-slate-400">ID: {asteroid.id}</p>
                      </div>
                      {asteroid.hazardous && (
                        <Badge className="ml-2 bg-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-400">Diameter</p>
                        <p className="font-semibold text-white">
                          {asteroid.diameter ? `${(asteroid.diameter.estimated_diameter_max || 0).toFixed(1)}m` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Velocity</p>
                        <p className="font-semibold text-white">{parseFloat(asteroid.velocity).toFixed(1)} km/s</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Distance</p>
                        <p className="font-semibold text-white">{(parseFloat(asteroid.distance) / 1000000).toFixed(2)}M km</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Approach</p>
                        <p className="font-semibold text-white">{asteroid.date?.split('T')[0] || 'N/A'}</p>
                      </div>
                    </div>

                    {asteroid.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-600 bg-transparent"
                        onClick={() => window.open(asteroid.url, '_blank')}
                      >
                        View Details
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400">
                No asteroids found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
