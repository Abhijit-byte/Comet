import { NextResponse } from 'next/server'

const NASA_API_KEY = process.env.NASA_API_KEY
const NASA_BASE_URL = 'https://api.nasa.gov/neo/rest/v1'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Asteroid {
  id: string
  name: string
  designation?: string
  diameter?: {
    estimated_diameter_min: number
    estimated_diameter_max: number
  }
  hazardous: boolean
  url: string
  absolute_magnitude_h?: number
  close_approach_data?: Array<{
    close_approach_date: string
    relative_velocity?: {
      kilometers_per_second: string
    }
    miss_distance?: {
      kilometers: string
    }
  }>
}

async function fetchAsteroidData(query: string): Promise<Asteroid[]> {
  try {
    if (!NASA_API_KEY) {
      throw new Error('NASA_API_KEY not configured')
    }

    // Check if query is a specific name/number or a general search
    const browseUrl = `${NASA_BASE_URL}/neo/browse?api_key=${NASA_API_KEY}`
    const browseResponse = await fetch(browseUrl)

    if (!browseResponse.ok) {
      throw new Error(`NASA API error: ${browseResponse.statusText}`)
    }

    const data = await browseResponse.json()
    const neoObjects = data.near_earth_objects || []

    // Filter results by search query
    const filtered = neoObjects.filter((asteroid: Asteroid) =>
      asteroid.name?.toLowerCase().includes(query.toLowerCase()) ||
      asteroid.designation?.toLowerCase().includes(query.toLowerCase())
    )

    return filtered
  } catch (error) {
    console.error('Error fetching asteroid data:', error)
    return []
  }
}

function formatAsteroidDetails(asteroids: Asteroid[]): string {
  if (asteroids.length === 0) {
    return 'No asteroids found matching your query. Try searching for specific asteroid names or browse our database.'
  }

  let response = `Found ${asteroids.length} asteroid${asteroids.length !== 1 ? 's' : ''}:\n\n`

  for (let i = 0; i < Math.min(asteroids.length, 3); i++) {
    const ast = asteroids[i]
    const diameterMin = ast.diameter?.estimated_diameter_min?.toFixed(2) || 'N/A'
    const diameterMax = ast.diameter?.estimated_diameter_max?.toFixed(2) || 'N/A'
    const hazardStatus = ast.hazardous ? '⚠️ POTENTIALLY HAZARDOUS' : '✓ Not hazardous'
    const closeApproach = ast.close_approach_data?.[0]
    const velocity = closeApproach?.relative_velocity?.kilometers_per_second || 'N/A'
    const distance = closeApproach?.miss_distance?.kilometers || 'N/A'
    const approachDate = closeApproach?.close_approach_date || 'N/A'

    response += `**${ast.name}** (${ast.designation || 'No designation'})\n`
    response += `• Status: ${hazardStatus}\n`
    response += `• Size: ${diameterMin}m - ${diameterMax}m diameter\n`
    response += `• Absolute Magnitude: ${ast.absolute_magnitude_h?.toFixed(2) || 'N/A'}\n`
    response += `• Closest Approach Date: ${approachDate}\n`
    response += `• Velocity: ${velocity} km/s\n`
    response += `• Miss Distance: ${distance} km\n`
    response += `• More info: ${ast.url || 'N/A'}\n\n`
  }

  if (asteroids.length > 3) {
    response += `... and ${asteroids.length - 3} more asteroid${asteroids.length - 3 !== 1 ? 's' : ''} matching your search.`
  }

  return response
}

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1].content

    // Check for greeting/help questions
    if (
      lastMessage.toLowerCase().includes('hello') ||
      lastMessage.toLowerCase().includes('hi') ||
      lastMessage.toLowerCase().includes('help')
    ) {
      const response =
        'Hello! I\'m your CosmosTrace assistant. I can help you with:\n\n' +
        '• Search for specific asteroids (e.g., "Tell me about Apophis")\n' +
        '• Explain asteroid characteristics (size, velocity, hazard level)\n' +
        '• Discuss NEO tracking and impact risks\n' +
        '• Analyze close approaches and distances\n\n' +
        'What asteroid would you like to learn about?'
      return NextResponse.json({ message: response })
    }

    // Check if it's asking about largest asteroids
    if (lastMessage.toLowerCase().includes('largest') || lastMessage.toLowerCase().includes('biggest')) {
      try {
        const data = await fetchAsteroidData('')
        const sorted = data.sort(
          (a, b) => (b.diameter?.estimated_diameter_max || 0) - (a.diameter?.estimated_diameter_max || 0)
        )
        const largest = sorted.slice(0, 3)
        const response = formatAsteroidDetails(largest)
        return NextResponse.json({
          message: `Here are the largest asteroids in our database:\n\n${response}`,
        })
      } catch (error) {
        console.error('Error fetching largest asteroids:', error)
      }
    }

    // Check if it's asking about hazardous asteroids
    if (lastMessage.toLowerCase().includes('hazard') || lastMessage.toLowerCase().includes('risk')) {
      try {
        const data = await fetchAsteroidData('')
        const hazardous = data.filter((ast) => ast.hazardous)
        const response = formatAsteroidDetails(hazardous.slice(0, 3))
        return NextResponse.json({
          message: `Here are potentially hazardous asteroids:\n\n${response}`,
        })
      } catch (error) {
        console.error('Error fetching hazardous asteroids:', error)
      }
    }

    // Try to search for specific asteroid name
    const searchQuery = lastMessage
      .replace(/tell me about/i, '')
      .replace(/search for/i, '')
      .replace(/find/i, '')
      .replace(/show me/i, '')
      .trim()

    if (searchQuery.length > 2) {
      const asteroids = await fetchAsteroidData(searchQuery)
      const response = formatAsteroidDetails(asteroids)
      return NextResponse.json({ message: response })
    }

    // Default helpful response
    const response =
      'I can help you explore asteroid data! Try asking me:\n' +
      '• "Tell me about [asteroid name]"\n' +
      '• "Show the largest asteroids"\n' +
      '• "What are the hazardous asteroids?"\n' +
      '• "Search for Apophis"\n\n' +
      'Or provide an asteroid name you\'d like to learn more about.'

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat Error:', error)
    return NextResponse.json({ error: 'Failed to process message', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
