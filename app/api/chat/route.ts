import { NextResponse } from 'next/server'

const NASA_API_KEY = process.env.NASA_API_KEY

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1].content.toLowerCase()

    // Simple AI-like responses based on keywords
    let response = ''

    if (lastMessage.includes('hazard') || lastMessage.includes('risk')) {
      response =
        'Hazardous asteroids are tracked based on size and proximity to Earth. The NASA API identifies potentially hazardous NEOs (Near-Earth Objects) that are larger than 140 meters and come within 19.5 million km of Earth. I can help you analyze the current risk levels!'
    } else if (lastMessage.includes('largest') || lastMessage.includes('biggest')) {
      response =
        'I can fetch data on the largest asteroids currently being tracked. The diameters are typically measured in meters, with some large NEOs reaching several kilometers in diameter. Would you like me to show you the current largest asteroids?'
    } else if (lastMessage.includes('velocity') || lastMessage.includes('speed')) {
      response =
        'Asteroid velocities relative to Earth vary widely, typically ranging from 5 to 70 kilometers per second. These velocities are crucial for impact risk assessment and trajectory prediction. The exact speed depends on the asteroid\'s orbit and approach vector.'
    } else if (lastMessage.includes('distance')) {
      response =
        'Distance measurements are in kilometers from Earth. The miss distance shows how close an asteroid passes to our planet. Some asteroids come within 400,000 km (closer than the Moon), while others stay much farther away.'
    } else if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
      response =
        'Hello! I\'m your Cosmic Watch assistant. I can help you understand asteroid data, explain NEO tracking, and answer questions about Near-Earth Objects. What would you like to know?'
    } else if (lastMessage.includes('alert') || lastMessage.includes('notification')) {
      response =
        'The system monitors for potentially hazardous asteroids and generates alerts when high-risk objects are detected. You can customize alert thresholds in the Risk Analysis tab to focus on what matters most to you.'
    } else if (lastMessage.includes('how') && lastMessage.includes('work')) {
      response =
        'Cosmic Watch uses NASA\'s Near-Earth Object API to fetch real-time data on asteroids. The system analyzes their size, velocity, and distance to Earth to assess risk levels. All data is updated continuously with the latest observations.'
    } else {
      response =
        'I\'m here to help you understand asteroid data and NEO tracking. Feel free to ask me about hazardous asteroids, impact risks, asteroid sizes, velocities, or any other space-related questions. What interests you?'
    }

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chat Error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
