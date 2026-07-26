'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Volume2,
  RefreshCw,
  Wand2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  sender: 'user' | 'sophi'
  text: string
  timestamp: string
  updatedFields?: string[]
}

interface SophiJobCopilotProps {
  currentJobData: Record<string, any>
  onUpdateForm: (updatedFields: Record<string, any>) => void
}

export default function SophiJobCopilot({ currentJobData, onUpdateForm }: SophiJobCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'sophi',
      text: "Hi! I'm Sophi, your AI Job Co-pilot. Tell or speak to me your job details (e.g. 'Looking for a Senior Python Developer in Lahore, remote, salary 250k-350k') and I will fill out the job posting form for you!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setSpeechSupported(true)
        const rec = new SpeechRecognition()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'

        rec.onresult = (event: any) => {
          let transcript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          if (transcript) {
            setInputText(transcript)
          }
        }

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
          toast.error('Voice input error: ' + event.error)
        }

        rec.onend = () => {
          setIsRecording(false)
        }

        recognitionRef.current = rec
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const toggleRecording = () => {
    if (!speechSupported) {
      toast.error('Voice input is not supported in this browser. Please type your message.')
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      toast.success('Voice note processing...')
    } else {
      try {
        recognitionRef.current?.start()
        setIsRecording(true)
        toast('Listening to your voice note... speak now!', { icon: '🎙️' })
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
      }
    }
  }

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText
    if (!textToSend.trim() || loading) return

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    }

    const userMsgId = Date.now().toString()
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: timeStr,
    }

    setMessages((prev) => [...prev, newMsg])
    setInputText('')
    setLoading(true)

    try {
      const res = await fetch('/api/jobs/parse-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          currentJobData,
        }),
      })

      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Failed to talk to Sophi')

      const updatedKeys = Object.keys(result.extractedFields || {})

      if (updatedKeys.length > 0) {
        onUpdateForm(result.extractedFields)
        toast.success(`Sophi updated: ${updatedKeys.join(', ')}`)
      }

      const sophiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'sophi',
        text: result.reply || "I've updated your job posting based on your instructions!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedFields: updatedKeys,
      }

      setMessages((prev) => [...prev, sophiMsg])
    } catch (err: any) {
      toast.error(err.message || 'Error communicating with Sophi')
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    'Senior Full Stack Dev in Karachi, hybrid, 200k-350k salary',
    'Draft comprehensive job description and requirements',
    'Set work setup to Remote and employment type to Full-Time',
    'Add PKR 150k - 250k salary range with benefits',
  ]

  return (
    <div className="flex flex-col h-full min-h-[550px] max-h-[750px] rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Bot className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold tracking-wide">Sophi AI Co-Pilot</h3>
              <span className="rounded-full bg-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-400/20">
                Voice & Chat
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Interactive Job Form Assistant</p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: '1',
                sender: 'sophi',
                text: "Chat reset! How can Sophi help you refine your job posting?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }}
          title="Reset chat"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-2xs"
          >
            <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-end gap-2 max-w-[85%]">
              {msg.sender === 'sophi' && (
                <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                }`}
              >
                {msg.text}

                {msg.updatedFields && msg.updatedFields.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold text-emerald-600">
                    <Wand2 className="h-3 w-3 text-emerald-500" />
                    <span>Updated fields:</span>
                    {msg.updatedFields.map((f) => (
                      <span key={f} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 capitalize">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="h-7 w-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>

            <span className="text-[10px] font-semibold text-slate-400 mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-blue-600 font-bold p-2 bg-blue-50/80 rounded-xl w-max">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sophi is thinking & auto-filling form...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Note & Text Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-3">
        {isRecording && (
          <div className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
              <span>Recording Voice Note... Speak now</span>
            </div>
            <button
              onClick={toggleRecording}
              className="text-[11px] bg-red-600 text-white px-2.5 py-1 rounded-lg hover:bg-red-700"
            >
              Done Recording
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Voice Microphone Toggle Button */}
          <button
            type="button"
            onClick={toggleRecording}
            title={isRecording ? 'Stop recording' : 'Provide Voice Note'}
            className={`p-3 rounded-xl border transition-all shrink-0 ${
              isRecording
                ? 'bg-red-600 text-white border-red-600 animate-bounce shadow-md'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
            }`}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              isRecording
                ? 'Listening to voice...'
                : 'Type message or voice note for Sophi...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="flex-1 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white transition-all"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0 shadow-md"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
