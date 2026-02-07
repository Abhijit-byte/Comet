'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink, Search, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function AsteroidSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [asteroidResult, setAsteroidResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [famousAsteroids] = useState([
    { name: 'Eros', description: 'S-type asteroid, NEAR mission' },
    { name: 'Apophis', description: '325m asteroid with close approaches' },
    { name: 'Bennu', description: 'B-type, OSIRIS-REx sample return' },
    { name: 'Itokawa', description: 'S-type, Hayabusa mission' },
    { name: '2023 DW', description: 'Recently discovered NEO' },
    { name: 'Toutatis', description: 'Multiple Earth encounters' },
  ])

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      setLoading(true)
      setError(null)
      setAsteroidResult(null)

      const res = await fetch(`/api/asteroid-lookup?name=${encodeURIComponent(query)}`)

      if (!res.ok) {
        throw new Error(`Asteroid "${query}" not found`)
      }

      const data = await res.json()
      setAsteroidResult(data)
      toast.success(`Found asteroid: ${data.name}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Search failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <div className="sci-fi-card neon-border space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-cyan-300 uppercase tracking-wider">Asteroid Database Query</h2>
          <p className="text-xs text-cyan-400/60 mt-2">Search NASA NEO database for detailed asteroid information</p>
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/50" />
            <Input
              placeholder="Search asteroid name (Eros, Apophis, Bennu...)..."
              className="bg-black/40 border border-cyan-500/30 pl-10 text-cyan-300 placeholder:text-cyan-500/40 hover:border-cyan-400/50 transition-colors rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery)
                }
              }}
            />
          </div>
          <button
            onClick={() => handleSearch(searchQuery)}
            disabled={loading || !searchQuery.trim()}
            className="sci-fi-button flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                SCANNING
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                SCAN
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg border border-orange-500/50 bg-gradient-to-r from-orange-950/40 to-red-950/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-300">Search Error</p>
                <p className="text-xs text-orange-200/70">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Result */}        <AnimatePresence mode="wait">
          {asteroidResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`space-y-4 rounded-lg border p-6 ${asteroidResult.hazardous ? 'border-orange-500/40 bg-gradient-to-br from-orange-950/20 to-red-950/10' : 'border-green-500/40 bg-gradient-to-br from-green-950/20 to-emerald-950/10'}`}
            >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-cyan-300">{asteroidResult.name}</h3>
                <p className="text-xs font-mono text-cyan-400/50 mt-1">{asteroidResult.id}</p>
              </div>
              {asteroidResult.hazardous && (
                <span className="px-3 py-1 rounded-full bg-orange-500/30 border border-orange-500/50 text-orange-300 text-xs font-bold uppercase">
                  ⚠ HAZARD
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="glass-sm p-3 rounded border border-cyan-500/20">
                <p className="text-xs text-cyan-400/70 uppercase font-bold tracking-wider">Diameter</p>
                <p className="text-sm font-bold text-cyan-300 mt-1">
                  {asteroidResult.diameter ? `${(asteroidResult.diameter.estimated_diameter_max || 0).toFixed(1)}m` : 'N/A'}
                </p>
              </div>
              <div className="glass-sm p-3 rounded border border-violet-500/20">
                <p className="text-xs text-violet-400/70 uppercase font-bold tracking-wider">Magnitude</p>
                <p className="text-sm font-bold text-violet-300 mt-1">{(asteroidResult.absoluteMagnitude || 0).toFixed(2)}</p>
              </div>
              <div className="glass-sm p-3 rounded border border-cyan-500/20">
                <p className="text-xs text-cyan-400/70 uppercase font-bold tracking-wider">Orbital Period</p>
                <p className="text-sm font-bold text-cyan-300 mt-1">
                  {asteroidResult.orbitalData?.orbital_period
                    ? `${Number(asteroidResult.orbitalData.orbital_period).toFixed(1)}d`
                    : 'N/A'}
                </p>
              </div>
              <div className="glass-sm p-3 rounded border border-emerald-500/20">
                <p className="text-xs text-emerald-400/70 uppercase font-bold tracking-wider">Status</p>
                <span className={`text-sm font-bold mt-1 inline-block px-2 py-1 rounded ${asteroidResult.hazardous ? 'bg-orange-500/30 text-orange-300' : 'bg-green-500/30 text-green-300'}`}>
                  {asteroidResult.hazardous ? 'HAZARD' : 'SAFE'}
                </span>
              </div>
            </div>

            {/* Close Approach Data */}
            {asteroidResult.closeApproachData && asteroidResult.closeApproachData.length > 0 && (
              <div className="border-t border-cyan-500/20 pt-4">
                <p className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-3">Next Close Approaches</p>
                <div className="space-y-2">
                  {asteroidResult.closeApproachData.slice(0, 3).map((approach: any, idx: number) => (
                    <div key={idx} className="glass-sm p-2 rounded border border-cyan-500/10 flex items-center justify-between">
                      <span className="text-xs font-mono text-cyan-400/70">{approach.close_approach_date}</span>
                      <span className="text-xs font-bold text-cyan-300">{parseFloat(approach.miss_distance?.kilometers || 0).toLocaleString()} km</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {asteroidResult.url && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open(asteroidResult.url, '_blank')}
                className="sci-fi-button-secondary w-full flex items-center justify-center gap-2 mt-2"
              >
                NASA JPL Details
                <ExternalLink className="h-4 w-4" />
              </motion.button>
            )}
          </motion.div>
        )}
        </AnimatePresence>

        {/* Famous Asteroids */}
        <div className="space-y-4 border-t border-cyan-500/20 pt-6">
          <div>
            <p className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Quick Access</p>
            <p className="text-xs text-cyan-400/60 mt-1">Browse notable asteroids</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {famousAsteroids.map((asteroid, idx) => (
              <motion.button
                key={asteroid.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSearchQuery(asteroid.name)
                  setTimeout(() => handleSearch(asteroid.name), 0)
                }}
                className="glass-sm neon-border p-4 text-left hover:bg-cyan-500/10 transition-all group rounded"
              >
                <p className="font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">{asteroid.name}</p>
                <p className="text-xs text-cyan-400/60 mt-1">{asteroid.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

