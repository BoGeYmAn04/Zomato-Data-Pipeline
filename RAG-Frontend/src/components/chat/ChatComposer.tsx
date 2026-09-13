import { useState, type FormEvent, type KeyboardEvent } from "react"
import { ArrowUp, LoaderCircle, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatComposerProps {
  loading: boolean
  onSubmit: (question: string, topK: number) => Promise<void>
}

export function ChatComposer({ loading, onSubmit }: ChatComposerProps) {
  const [question, setQuestion] = useState("")
  const [topK, setTopK] = useState(5)

  async function submit(event?: FormEvent) {
    event?.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || loading) return
    setQuestion("")
    await onSubmit(trimmed, topK)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void submit()
    }
  }

  return (
    <form onSubmit={submit} className="border-t border-zinc-800/80 bg-zinc-950/80 p-3 backdrop-blur-xl sm:p-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2 shadow-2xl shadow-black/20 transition focus-within:border-rose-500/35">
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Ask what customers are saying about delivery, food quality, pricing…"
          className="min-h-20 border-0 bg-transparent px-2 py-2 shadow-none focus:ring-0"
        />

        <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-2">
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            <SlidersHorizontal className="size-3.5" />
            Top K
            <select
              value={topK}
              onChange={(event) => setTopK(Number(event.target.value))}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 outline-none"
              disabled={loading}
            >
              {[3, 5, 6, 8, 10].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] text-zinc-600 sm:inline">Enter to send · Shift+Enter for new line</span>
            <Button type="submit" size="icon" disabled={loading || !question.trim()} aria-label="Send question">
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
