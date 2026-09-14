import { ArrowUpRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

const suggestions = [
  "What are the main complaints from customers?",
  "What do customers say about food quality?",
  "Summarize delivery-related issues.",
  "Which positive themes appear in the reviews?",
]

export function EmptyState({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300 shadow-xl shadow-rose-950/20">
        <Sparkles className="size-6" />
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">Review intelligence</p>
      <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Ask your customer reviews a business question.
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
        The assistant retrieves the most relevant reviews from Chroma and answers only from that evidence.
      </p>

      <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            type="button"
            variant="outline"
            className="h-auto justify-between whitespace-normal px-4 py-3 text-left text-zinc-300"
            onClick={() => onSelect(suggestion)}
          >
            <span>{suggestion}</span>
            <ArrowUpRight className="size-4 shrink-0 text-zinc-600" />
          </Button>
        ))}
      </div>
    </div>
  )
}
