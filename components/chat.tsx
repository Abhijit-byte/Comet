'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Send, Zap } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_QUESTIONS = [
  'What makes an asteroid hazardous?',
  'How are velocities calculated?',
  'What are the largest asteroids?',
  'How does impact risk assessment work?',
  'What is a close approach?',
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        'Hello! I am your Cosmic Watch assistant. I can help you understand asteroid data, explain NEO tracking, and answer questions about Near-Earth Objects. What would you like to know?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('[v0] Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Chat Container */}
      <div className="lg:col-span-3">
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle>Cosmic Watch Assistant</CardTitle>
            <CardDescription>Ask questions about asteroids and NEO tracking</CardDescription>
          </CardHeader>
          <CardContent className="flex h-[600px] flex-col">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-600 bg-slate-700/50 text-slate-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="mt-1 text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="border border-slate-600 bg-slate-700/50 px-4 py-2 text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                      <div className="animation-delay-100 h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                      <div className="animation-delay-200 h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about asteroids..."
                  className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading}
                />
                <Button onClick={handleSendMessage} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Questions Sidebar */}
      <div>
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Quick Questions</CardTitle>
            <CardDescription>Popular topics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {QUICK_QUESTIONS.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="h-auto w-full border-slate-600 text-left text-xs text-slate-300 hover:bg-slate-700 bg-transparent"
                onClick={() => handleQuickQuestion(question)}
              >
                <Zap className="mr-2 h-3 w-3 flex-shrink-0" />
                <span className="text-pretty">{question}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 border-blue-800 bg-blue-950/50">
          <CardHeader>
            <CardTitle className="text-sm">About NEOs</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-300">
            <p className="mb-2">Near-Earth Objects (NEOs) are asteroids and comets in orbits that pass close to Earth.</p>
            <p>NASA tracks them to understand impact risks and advance planetary defense research.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
