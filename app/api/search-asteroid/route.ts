import { NextResponse } from 'next/server'

const NASA_API_KEY = process.env.NASA_API_KEY
const NASA_BASE_URL = 'https://api.nasa.gov/neo/rest/v1'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const page = searchParams.get('page') || '0'

    if (!NASA_API_KEY) {
      return NextResponse.json({ error: 'NASA_API_KEY not configured' }, { status: 500 })
    }

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query too short (minimum 2 characters)' }, { status: 400 })
    }

    // Search for asteroids by name using the browse endpoint
    const browseUrl = `${NASA_BASE_URL}/neo/browse?page=${page}&api_key=${NASA_API_KEY}`
    const browseResponse = await fetch(browseUrl)

    if (!browseResponse.ok) {
      throw new Error(`NASA API error: ${browseResponse.statusText}`)
    }

    const data = await browseResponse.json()
    
    // Filter results by search query
    const neoObjects = data.near_earth_objects || []
    const filtered = neoObjects.filter((asteroid: any) => 
      asteroid.name.toLowerCase().includes(query.toLowerCase()) ||
      asteroid.designation?.toLowerCase().includes(query.toLowerCase())
    )

    // Map and enhance the data
    const asteroids = filtered.map((asteroid: any) => ({
      id: asteroid.id,
      name: asteroid.name,
      designation: asteroid.designation,
      diameter: asteroid.estimated_diameter?.meters,
      hazardous: asteroid.is_potentially_hazardous_asteroid,
      url: asteroid.nasa_jpl_url,
      absoluteMagnitude: asteroid.absolute_magnitude_h,
      orbitalData: asteroid.orbital_data,
      closeApproachDate: asteroid.close_approach_data?.[0]?.close_approach_date,
      velocity: asteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second,
      distance: asteroid.close_approach_data?.[0]?.miss_distance?.kilometers,
    }))

    return NextResponse.json({
      count: asteroids.length,
      asteroids,
      query,
      page: parseInt(page),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Search asteroid error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search asteroids', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
}
