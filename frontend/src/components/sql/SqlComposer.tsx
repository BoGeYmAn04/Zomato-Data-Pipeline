import { FormEvent, KeyboardEvent, useState } from "react"
import { ArrowUp, DatabaseZap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface SqlComposerProps {
  loading: boolean
  onSubmit: (question: string) => void
}

export function SqlComposer({ loading, onSubmit }: SqlComposerProps) {
  const [question, setQuestion] = useState("")

  function submit(event?: FormEvent) {
    event?.preventDefault()
    const value = question.trim()
    if (!value || loading) return
    onSubmit(value)
    setQuestion("")
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={submit} className="border-t border-zinc-800/80 bg-zinc-950/80 p-4 backdrop-blur-xl sm:p-5">
      <div className="mx-auto flex max-w-5xl items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/85 p-2 shadow-2xl shadow-black/20 focus-within:border-rose-500/35">
        <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 sm:flex">
          <DatabaseZap className="size-4" />
        </div>
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a business question… e.g. Which city generated the highest revenue?"
          rows={1}
          className="min-h-10 max-h-32 resize-none border-0 bg-transparent px-2 py-2 text-sm text-zinc-100 shadow-none placeholder:text-zinc-600 focus-visible:ring-0"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !question.trim()}
          className="size-10 shrink-0 rounded-xl bg-rose-600 text-white hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-600"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
      <p className="mx-auto mt-2 max-w-5xl px-2 text-[11px] text-zinc-600">
        Enter to run · Shift + Enter for a new line · queries are validated and executed read-only
      </p>
    </form>
  )
}
