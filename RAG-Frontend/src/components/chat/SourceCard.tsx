import { MapPin, MessageSquareText, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { RagSource } from "@/types/rag"

function sentimentClasses(sentiment: string | null) {
  if (sentiment === "positive") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
  if (sentiment === "negative") return "border-red-500/20 bg-red-500/10 text-red-300"
  return "border-zinc-700 bg-zinc-800/70 text-zinc-300"
}

export function SourceCard({ source }: { source: RagSource }) {
  return (
    <Card className="p-4 transition hover:border-zinc-700 hover:bg-zinc-900/70">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-300">{source.label}</Badge>
        {source.sentiment_label && (
          <Badge className={sentimentClasses(source.sentiment_label)}>
            {source.sentiment_label}
          </Badge>
        )}
        {source.topic && <Badge>{source.topic}</Badge>}
      </div>

      <p className="text-sm leading-6 text-zinc-300">“{source.comment}”</p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
        {source.city && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {source.city}
          </span>
        )}
        {source.rating !== null && (
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-3.5" />
            {source.rating}/5
          </span>
        )}
        {source.review_id && (
          <span className="inline-flex items-center gap-1.5">
            <MessageSquareText className="size-3.5" />
            #{source.review_id}
          </span>
        )}
      </div>

      {source.key_issue && (
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-400">
          <span className="font-medium text-zinc-300">Key issue:</span> {source.key_issue}
        </div>
      )}
    </Card>
  )
}
