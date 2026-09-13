import { useEffect, useRef, useState } from "react"
import {
  Bot,
  Database,
  MessageSquareText,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  TerminalSquare,
} from "lucide-react"

import { ChatComposer } from "@/components/chat/ChatComposer"
import { EmptyState } from "@/components/chat/EmptyState"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { askRag } from "@/lib/api"
import type { ChatMessage } from "@/types/rag"

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function RagChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function handleQuestion(question: string, topK = 5) {
    setError(null)
    setMessages((current) => [
      ...current,
      { id: makeId(), role: "user", content: question },
    ])
    setLoading(true)

    try {
      const response = await askRag({ question, top_k: topK })
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: response.answer,
          sources: response.sources,
        },
      ])
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Something went wrong."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden text-zinc-100">
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } hidden shrink-0 overflow-hidden border-r border-zinc-800/80 bg-zinc-950/80 transition-[width] duration-300 lg:block`}
      >
        <div className="flex h-full w-72 flex-col p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-950/30">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="font-semibold tracking-tight text-white">Zomato Intelligence</p>
              <p className="text-xs text-zinc-500">AI data portfolio</p>
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
              Workspace
            </p>
            <button className="flex w-full items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-left text-sm text-rose-200">
              <MessageSquareText className="size-4" />
              Review RAG Chat
            </button>
            <button
              disabled
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-600"
            >
              <TerminalSquare className="size-4" />
              Text to SQL
              <Badge className="ml-auto border-zinc-800 bg-zinc-900 text-[9px] text-zinc-600">Soon</Badge>
            </button>
          </div>

          <div className="mt-7">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
              Pipeline
            </p>
            {[
              [Database, "Snowflake", "Source + enrichment"],
              [Network, "Chroma Cloud", "Vector retrieval"],
              [Bot, "Gemini", "Answer generation"],
            ].map(([Icon, title, description]) => {
              const IconComponent = Icon as typeof Database
              return (
                <div key={String(title)} className="flex items-center gap-3 px-3 py-2.5">
                  <IconComponent className="size-4 text-zinc-600" />
                  <div>
                    <p className="text-xs font-medium text-zinc-400">{String(title)}</p>
                    <p className="text-[11px] text-zinc-600">{String(description)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]" />
              RAG backend connected
            </div>
            <p className="mt-2 text-[11px] leading-5 text-zinc-600">
              FastAPI → Chroma Cloud → Gemini
            </p>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/60 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setSidebarOpen((value) => !value)}
            >
              {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-white sm:text-base">Customer Review RAG</h1>
                <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Live</Badge>
              </div>
              <p className="hidden text-xs text-zinc-500 sm:block">
                Evidence-grounded answers from your indexed customer reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Search className="size-3.5" />
            Semantic retrieval
          </div>
        </header>

        <section className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState onSelect={(question) => void handleQuestion(question, 5)} />
          ) : (
            <div className="mx-auto w-full max-w-5xl space-y-7 px-4 py-6 sm:px-6 sm:py-8">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300">
                    <Bot className="size-4" />
                  </div>
                  <div className="w-full max-w-xl rounded-2xl rounded-tl-md border border-zinc-800 bg-zinc-900/75 p-4">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="mt-3 h-3 w-full" />
                    <Skeleton className="mt-3 h-3 w-2/3" />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </section>

        <div className="mx-auto w-full max-w-5xl">
          <ChatComposer loading={loading} onSubmit={handleQuestion} />
        </div>
      </main>
    </div>
  )
}
