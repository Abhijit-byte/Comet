'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink, Search, Activity, Zap, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Skeleton from 'react-loading-skeleton'
import { toast } from 'sonner'

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
        console.error('Asteroid list error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAsteroids()
  }, [])

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
      toast.success(`Found asteroid: ${query}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Asteroid not found'
      setError(errorMsg)
      toast.error(errorMsg)
      setAsteroids([])
      setFilteredAsteroids([])
    } finally {
      setSearching(false)
    }
  }

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
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-sm rounded-xl p-6">
            <Skeleton height={100} baseColor="rgba(0, 217, 255, 0.1)" highlightColor="rgba(0, 217, 255, 0.2)" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="sci-fi-card neon-border space-y-4">
        <div>
          <h2 className="text-lg font-bold text-cyan-300 uppercase tracking-wider mb-4">NEO Database Search</h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/50" />
                <Input
                  placeholder="Search asteroids by name..."
                  className="bg-black/40 border border-cyan-500/30 pl-10 text-cyan-300 placeholder:text-cyan-500/40 hover:border-cyan-400/50 transition-colors rounded-lg"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSearchMode(false)
                  }}
                />
              </div>
              <button
                onClick={() => setFilterHazardous(!filterHazardous)}
                className={`sci-fi-button-secondary flex items-center gap-2 ${filterHazardous ? 'bg-orange-500/20 border-orange-500/50' : ''}`}
              >
                <Filter className="h-4 w-4" />
                {filterHazardous ? 'Hazardous Only' : 'All Objects'}
              </button>
            </div>

            {/* Quick Search Buttons */}
            <div className="pt-3 border-t border-cyan-500/20">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Quick Search:</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {['Eros', 'Apophis', 'Bennu', 'Itokawa'].map((name) => (
                  <motion.button
                    key={name}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleSpecialSearch(name)
                      setSearchTerm('')
                    }}
                    disabled={searching}
                    className="glass-sm neon-border p-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/10 transition-all uppercase tracking-wide disabled:opacity-50"
                  >
                    <Zap className="h-3 w-3 inline mr-1" />
                    {name}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg border border-orange-500/50 bg-gradient-to-r from-orange-950/40 to-red-950/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm font-semibold text-orange-300">Search Error</p>
                  <p className="text-xs text-orange-200/70">{error}</p>
                </div>
              </div>
              {searchMode && (
                <button
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
                  className="text-xs px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded hover:bg-orange-500/20 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="pt-2 border-t border-cyan-500/20">
          <p className="text-xs font-mono text-cyan-400/70">
            RESULTS: {filteredAsteroids.length} / {asteroids.length} OBJECTS
          </p>
        </div>
      </div>

      {/* Asteroids Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredAsteroids.length > 0 ? (
            filteredAsteroids.map((asteroid, idx) => (
              <motion.div
                key={asteroid.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`sci-fi-card neon-border group relative overflow-hidden cursor-pointer ${
                  asteroid.hazardous
                    ? 'border-orange-500/40 bg-gradient-to-br from-orange-950/20 to-red-950/10 hover:shadow-2xl hover:shadow-orange-500/10'
                    : 'border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-blue-950/10 hover:shadow-2xl hover:shadow-cyan-500/10'
                }`}
              >
              {/* Hazard Indicator */}
              {asteroid.hazardous && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-orange-500/30 border border-orange-500/50 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-orange-400" />
                  <span className="text-xs font-bold text-orange-300 uppercase">HAZARD</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h3 className="text-base font-bold text-cyan-300 line-clamp-2">{asteroid.name}</h3>
                  <p className="text-xs font-mono text-cyan-400/50 mt-1">ID: {asteroid.id}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-sm neon-border-cyan p-2 rounded">
                    <p className="text-xs text-cyan-400/70 uppercase font-bold tracking-wider">Diameter</p>
                    <p className="text-sm font-bold text-cyan-300 mt-1">
                      {asteroid.diameter ? `${(asteroid.diameter.estimated_diameter_max || 0).toFixed(1)}m` : 'N/A'}
                    </p>
                  </div>
                  <div className="glass-sm neon-border-cyan p-2 rounded">
                    <p className="text-xs text-cyan-400/70 uppercase font-bold tracking-wider">Velocity</p>
                    <p className="text-sm font-bold text-cyan-300 mt-1">{parseFloat(asteroid.velocity).toFixed(1)} km/s</p>
                  </div>
                  <div className="glass-sm neon-border-cyan p-2 rounded">
                    <p className="text-xs text-cyan-400/70 uppercase font-bold tracking-wider">Distance</p>
                    <p className="text-sm font-bold text-cyan-300 mt-1">{(parseFloat(asteroid.distance) / 1000000).toFixed(2)}M km</p>
                  </div>
                  <div className="glass-sm neon-border-cyan p-2 rounded">
                    <p className="text-xs text-cyan-400/70 uppercase font-bold tracking-wider">Approach</p>
                    <p className="text-sm font-bold text-cyan-300 mt-1">{asteroid.date?.split('T')[0] || 'N/A'}</p>
                  </div>
                </div>

                {/* Action Button */}
                {asteroid.url && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(asteroid.url, '_blank')}
                    className="w-full sci-fi-button-secondary text-xs flex items-center justify-center gap-2 mt-2"
                  >
                    NASA Details
                    <ExternalLink className="h-3 w-3" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-12 text-center"
          >
            <Search className="h-12 w-12 mx-auto text-cyan-500/30 mb-4" />
            <p className="text-cyan-400/70 text-sm">No asteroids found matching your criteria</p>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  )
}

