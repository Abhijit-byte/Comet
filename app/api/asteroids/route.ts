import { NextResponse } from 'next/server'

const NASA_API_KEY = process.env.NASA_API_KEY
const NASA_BASE_URL = 'https://api.nasa.gov/neo/rest/v1'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '7'

    if (!NASA_API_KEY) {
      return NextResponse.json({ error: 'NASA_API_KEY not configured' }, { status: 500 })
    }

    // Get today's date and calculate start/end dates
    const today = new Date()
    const startDate = today.toISOString().split('T')[0]
    const endDate = new Date(today.getTime() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Fetch feed data with date range
    const feedUrl = `${NASA_BASE_URL}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`
    const feedResponse = await fetch(feedUrl)

    if (!feedResponse.ok) {
      throw new Error(`NASA API error: ${feedResponse.statusText}`)
    }

    const data = await feedResponse.json()

    // Process and enhance data - collect all unique asteroids
    const asteroidsMap = new Map()
    const neoFeed = data.near_earth_objects || {}

    for (const date in neoFeed) {
      const dayAsteroids = neoFeed[date] || []
      for (const asteroid of dayAsteroids) {
        const asteroidId = asteroid.id
        
        // If we haven't seen this asteroid, add it
        if (!asteroidsMap.has(asteroidId)) {
          // Get the closest approach from all close approach data
          let closeApproachData = asteroid.close_approach_data?.[0]
          let closestDistance = parseFloat(closeApproachData?.miss_distance?.kilometers) || Infinity
          
          for (const approach of asteroid.close_approach_data || []) {
            const distance = parseFloat(approach.miss_distance?.kilometers) || Infinity
            if (distance < closestDistance) {
              closestDistance = distance
              closeApproachData = approach
            }
          }

          asteroidsMap.set(asteroidId, {
            id: asteroid.id,
            name: asteroid.name,
            diameter: asteroid.estimated_diameter?.meters,
            velocity: closeApproachData?.relative_velocity?.kilometers_per_second,
            distance: closeApproachData?.miss_distance?.kilometers,
            date: closeApproachData?.close_approach_date,
            hazardous: asteroid.is_potentially_hazardous_asteroid,
            url: asteroid.nasa_jpl_url,
            absoluteMagnitude: asteroid.absolute_magnitude_h,
            orbitalData: asteroid.orbital_data,
          })
        }
      }
    }

    // Convert to array and sort by distance
    const asteroids = Array.from(asteroidsMap.values())
    asteroids.sort((a, b) => (parseFloat(a.distance) || Infinity) - (parseFloat(b.distance) || Infinity))

    return NextResponse.json({
      count: asteroids.length,
      asteroids: asteroids, // Return all asteroids
      totalAsteroids: data.element_count || asteroids.length,
      date: new Date().toISOString(),
      dateRange: { startDate, endDate },
    })
  } catch (error) {
    console.error('[v0] API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch asteroid data', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
