import { NextResponse } from 'next/server'

const NASA_API_KEY = process.env.NASA_API_KEY
const NASA_BASE_URL = 'https://api.nasa.gov/neo/rest/v1'

export async function GET() {
  try {
    if (!NASA_API_KEY) {
      return NextResponse.json({ error: 'NASA_API_KEY not configured' }, { status: 500 })
    }

    // Get today's date and calculate start/end dates for 7 days
    const today = new Date()
    const startDate = today.toISOString().split('T')[0]
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const feedUrl = `${NASA_BASE_URL}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`
    const feedResponse = await fetch(feedUrl)

    if (!feedResponse.ok) {
      throw new Error(`NASA API error: ${feedResponse.statusText}`)
    }

    const data = await feedResponse.json()

    // Calculate stats using unique asteroids only
    const asteroidsMap = new Map()
    let hazardousCount = 0
    let maxDiameter = 0
    let maxVelocity = 0
    const velocities = []

    const neoFeed = data.near_earth_objects || {}

    for (const date in neoFeed) {
      const dayAsteroids = neoFeed[date] || []
      for (const asteroid of dayAsteroids) {
        const asteroidId = asteroid.id
        
        // Only count unique asteroids once
        if (!asteroidsMap.has(asteroidId)) {
          asteroidsMap.set(asteroidId, asteroid)
          
          if (asteroid.is_potentially_hazardous_asteroid) {
            hazardousCount++
          }

          const diameter = asteroid.estimated_diameter?.meters?.estimated_diameter_max || 0
          maxDiameter = Math.max(maxDiameter, diameter)

          const velocity = parseFloat(asteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second) || 0
          maxVelocity = Math.max(maxVelocity, velocity)
          velocities.push(velocity)
        }
      }
    }

    const totalAsteroids = asteroidsMap.size
    const avgVelocity = velocities.length > 0 ? velocities.reduce((a, b) => a + b) / velocities.length : 0

    return NextResponse.json({
      totalAsteroids,
      hazardousCount,
      safeCount: totalAsteroids - hazardousCount,
      hazardousPercentage: totalAsteroids > 0 ? ((hazardousCount / totalAsteroids) * 100).toFixed(1) : 0,
      maxDiameter: maxDiameter.toFixed(0),
      maxVelocity: maxVelocity.toFixed(2),
      avgVelocity: avgVelocity.toFixed(2),
      timestamp: new Date().toISOString(),
      dateRange: { startDate, endDate },
    })
  } catch (error) {
    console.error('[v0] Stats Error:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
