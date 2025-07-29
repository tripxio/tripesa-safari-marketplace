"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { X, Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface AISearchInterfaceProps {
  query: string;
  onClose: () => void;
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

// Helper function to generate unique IDs
const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

export default function AISearchInterface({
  query,
  onClose,
}: AISearchInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuery, setCurrentQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const processedQueries = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate session and conversation IDs when the component mounts
    setSessionId(generateUniqueId());
    setConversationId(generateUniqueId());
  }, []);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (query && !processedQueries.current.has(query) && sessionId) {
      processedQueries.current.add(query);
      handleSearch(query);
    }
  }, [query, sessionId]); // Depend on sessionId to ensure it's set

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !sessionId) return;

    const userMessage: Message = {
      id: generateUniqueId(),
      type: "user",
      content: searchQuery,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    console.log("Sending chat request with:", {
      chatInput: searchQuery,
      sessionId,
      conversationId,
    });

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_AI_CHAT_WEBHOOK_URL as string,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatInput: searchQuery,
            sessionId,
            conversationId,
          }),
        }
      );

      console.log("Raw API response:", response);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Network response was not ok. Status: ${response.status}`
        );
      }

      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      try {
        const data = JSON.parse(responseText);
        console.log("Parsed JSON data:", data);

        const aiResponse: Message = {
          id: generateUniqueId(),
          type: "ai",
          content: data.output || "Sorry, I couldn't get a response.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      } catch (jsonError) {
        console.error("Failed to parse JSON:", jsonError);
        // If JSON parsing fails, maybe the raw text is the message.
        const aiResponse: Message = {
          id: generateUniqueId(),
          type: "ai",
          content:
            responseText || "Received an invalid response from the server.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = {
        id: generateUniqueId(),
        type: "ai",
        content: "Sorry, something went wrong. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setCurrentQuery("");
  };

  // generateAIResponse function is no longer needed

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
              <p>
                Ask me anything about safaris, destinations, or tour packages!
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-orange-500 text-white"
                    : "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 text-gray-800 dark:text-white border border-blue-200 dark:border-slate-500"
                }`}
              >
                <div className="prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 prose-p:text-gray-800 dark:prose-p:text-white prose-ul:text-gray-800 dark:prose-ul:text-white prose-li:text-gray-800 dark:prose-li:text-white prose-strong:text-gray-900 dark:prose-strong:text-white">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <p className="text-xs opacity-70 mt-1 text-gray-600 dark:text-gray-300">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600 text-gray-800 dark:text-white border border-blue-200 dark:border-slate-500 p-3 rounded-lg flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-gray-800 dark:text-white">
                  AI is thinking...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about safaris, destinations, or packages..."
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  currentQuery.trim() &&
                  !isLoading
                ) {
                  e.preventDefault();
                  handleSearch(currentQuery);
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSearch(currentQuery)}
              disabled={isLoading || !currentQuery.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
