"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface AISearchInterfaceProps {
  query: string
  onClose: () => void
}

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

export default function AISearchInterface({ query, onClose }: AISearchInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuery, setCurrentQuery] = useState(query)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query) {
      handleSearch(query)
    }
  }, [query])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: searchQuery,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateAIResponse(searchQuery),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)

    setCurrentQuery("")
  }

  const generateAIResponse = (query: string): string => {
    const responses = {
      gorilla:
        "I found some amazing gorilla trekking experiences! Uganda's Bwindi Impenetrable Forest offers the best gorilla encounters. Here are 3 top-rated packages: 1) 3-day Bwindi Gorilla Trek ($1,200) 2) 5-day Uganda Gorilla & Wildlife ($2,100) 3) 7-day Rwanda-Uganda Gorilla Adventure ($3,500). All include permits, accommodation, and expert guides.",
      luxury:
        "For luxury safari experiences, I recommend these premium packages: 1) 6-day Serengeti Luxury Lodge Safari ($4,500) - Stay at Four Seasons Safari Lodge 2) 8-day Kenya Luxury Safari ($5,200) - Private conservancies and luxury camps 3) 10-day Tanzania Premium Circuit ($6,800) - Exclusive lodges and private game drives.",
      budget:
        "Great budget-friendly options available! 1) 4-day Masai Mara Budget Safari ($450) - Camping with shared facilities 2) 5-day Tanzania Budget Circuit ($680) - Basic lodges, group tours 3) 3-day Uganda Budget Wildlife ($320) - Camping in Queen Elizabeth NP. All include meals, transport, and park fees.",
      default:
        "I can help you find the perfect safari experience! Based on your interests, here are some personalized recommendations. Would you like me to show you specific packages for wildlife viewing, cultural experiences, or adventure activities? I can also filter by budget, duration, or destination.",
    }

    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes("gorilla")) return responses.gorilla
    if (lowerQuery.includes("luxury") || lowerQuery.includes("premium")) return responses.luxury
    if (lowerQuery.includes("budget") || lowerQuery.includes("cheap")) return responses.budget
    return responses.default
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">AI Safari Assistant</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-orange-500" />
              <p>Ask me anything about safaris, destinations, or tour packages!</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === "user" ? "bg-orange-500 text-white" : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about safaris, destinations, or packages..."
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch(currentQuery)}
              disabled={isLoading}
            />
            <Button onClick={() => handleSearch(currentQuery)} disabled={isLoading || !currentQuery.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
