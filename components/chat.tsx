'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Send, Zap, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

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
        'CosmosTrace AI Online. I can assist with asteroid data analysis, NEO tracking explanations, and asteroid impact assessment. What queries do you have?',
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
  }, [messages, loading])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
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
      console.error('[Chat] Error:', error)
      toast.error('Failed to get response from AI')
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'SYSTEM ERROR: Failed to process query. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuestion = async (question: string) => {
    if (loading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
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
      console.error('[Chat] Quick question error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'SYSTEM ERROR: Failed to process query.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Chat Container */}
      <div className="lg:col-span-3">
        <div className="sci-fi-card neon-border flex flex-col h-[600px] overflow-hidden">
          {/* Chat Header */}
          <div className="border-b border-cyan-500/20 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
                <MessageCircle className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-cyan-300 uppercase tracking-wider">AI Assistant</h3>
                <p className="text-xs text-cyan-400/60">Real-time NEO database query engine</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2">
            <AnimatePresence mode="popLayout">
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/50 text-cyan-300'
                        : 'glass-sm neon-border bg-gradient-to-br from-violet-950/20 to-blue-950/20 text-slate-300'
                    }`}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                    <p className="mt-2 text-xs opacity-60 font-mono">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="glass-sm neon-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 glow-pulse" />
                    <div className="h-2 w-2 rounded-full bg-cyan-400 glow-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="h-2 w-2 rounded-full bg-cyan-400 glow-pulse" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-cyan-500/20 pt-4 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Ask about asteroids, NEOs, or impact assessment..."
                  className="bg-black/40 border border-cyan-500/30 text-cyan-300 placeholder:text-cyan-500/40 hover:border-cyan-400/50 transition-colors rounded-lg pr-4"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={loading}
                className="sci-fi-button flex items-center justify-center gap-2 px-4 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">SEND</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Questions Sidebar */}
      <div className="space-y-4">
        {/* Quick Questions Card */}
        <div className="sci-fi-card neon-border">
          <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-4">Quick Queries</h3>
          <div className="space-y-2">
            {QUICK_QUESTIONS.map((question, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickQuestion(question)}
                disabled={loading}
                className="w-full glass-sm neon-border p-3 text-left text-xs text-cyan-300 hover:bg-cyan-500/10 transition-all disabled:opacity-50 rounded"
              >
                <div className="flex items-start gap-2">
                  <Zap className="h-3 w-3 flex-shrink-0 mt-0.5 text-cyan-400" />
                  <span className="line-clamp-2">{question}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="sci-fi-card neon-border-purple">
          <h3 className="text-sm font-bold text-violet-300 uppercase tracking-wider mb-3">System Info</h3>
          <div className="text-xs text-slate-400 space-y-2">
            <p>
              <span className="text-violet-400 font-semibold">NEOs:</span> Asteroids & comets in Earth-crossing orbits
            </p>
            <p>
              <span className="text-violet-400 font-semibold">NASA:</span> Tracks impacts risk for planetary defense
            </p>
            <div className="mt-3 pt-3 border-t border-violet-500/20">
              <p className="text-violet-300 font-mono text-xs">
                Status: <span className="text-green-400 font-bold">OPERATIONAL</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

