import { Bot, UserRound } from "lucide-react"
import ReactMarkdown from "react-markdown"

import { SourceCard } from "@/components/chat/SourceCard"
import type { ChatMessage } from "@/types/rag"

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300">
          <Bot className="size-4" />
        </div>
      )}

      <div className={`min-w-0 ${isUser ? "max-w-[82%]" : "max-w-[92%]"}`}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-md bg-rose-600 px-4 py-3 text-sm leading-6 text-white shadow-lg shadow-rose-950/20"
              : "rounded-2xl rounded-tl-md border border-zinc-800 bg-zinc-900/75 px-4 py-3 text-sm leading-6 text-zinc-300"
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-answer">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Retrieved evidence
            </p>
            <div className="grid gap-2 lg:grid-cols-2">
              {message.sources.map((source) => (
                <SourceCard key={`${message.id}-${source.label}`} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300">
          <UserRound className="size-4" />
        </div>
      )}
    </div>
  )
}
