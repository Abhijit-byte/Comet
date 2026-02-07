import { NextResponse } from 'next/server'

const NASA_API_KEY = process.env.NASA_API_KEY
const NASA_BASE_URL = 'https://api.nasa.gov/neo/rest/v1'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const asteroidId = searchParams.get('id')
    const asteroidName = searchParams.get('name')

    if (!NASA_API_KEY) {
      return NextResponse.json({ error: 'NASA_API_KEY not configured' }, { status: 500 })
    }

    if (!asteroidId && !asteroidName) {
      return NextResponse.json(
        { error: 'Provide either id or name parameter' },
        { status: 400 }
      )
    }

    let url = ''
    
    // If ID is provided, fetch specific asteroid by ID
    if (asteroidId) {
      url = `${NASA_BASE_URL}/neo/${asteroidId}?api_key=${NASA_API_KEY}`
    } else {
      // Otherwise, search by name in the browse endpoint
      url = `${NASA_BASE_URL}/neo/browse?api_key=${NASA_API_KEY}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`NASA API error: ${response.statusText}`)
    }

    const data = await response.json()

    // If searching by name, filter results
    if (asteroidName) {
      const neoObjects = data.near_earth_objects || []
      const asteroid = neoObjects.find((neo: any) =>
        neo.name.toLowerCase().includes(asteroidName.toLowerCase()) ||
        neo.designation?.toLowerCase().includes(asteroidName.toLowerCase())
      )

      if (!asteroid) {
        return NextResponse.json(
          { error: `Asteroid "${asteroidName}" not found` },
          { status: 404 }
        )
      }

      return NextResponse.json({
        id: asteroid.id,
        name: asteroid.name,
        designation: asteroid.designation,
        diameter: asteroid.estimated_diameter?.meters,
        hazardous: asteroid.is_potentially_hazardous_asteroid,
        url: asteroid.nasa_jpl_url,
        absoluteMagnitude: asteroid.absolute_magnitude_h,
        orbitalData: asteroid.orbital_data,
        closeApproachData: asteroid.close_approach_data?.slice(0, 5), // Include multiple close approaches
        timestamp: new Date().toISOString(),
      })
    }

    // Return single asteroid by ID
    return NextResponse.json({
      id: data.id,
      name: data.name,
      designation: data.designation,
      diameter: data.estimated_diameter?.meters,
      hazardous: data.is_potentially_hazardous_asteroid,
      url: data.nasa_jpl_url,
      absoluteMagnitude: data.absolute_magnitude_h,
      orbitalData: data.orbital_data,
      closeApproachData: data.close_approach_data?.slice(0, 10),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Asteroid lookup error:', error)
    return NextResponse.json(
      {
        error: 'Failed to lookup asteroid',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
