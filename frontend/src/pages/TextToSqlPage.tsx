import { useState } from "react"
import ReactMarkdown from "react-markdown"
import {
  BarChart3,
  Bot,
  CheckCircle2,
  Database,
  DatabaseZap,
  MessageSquareText,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  Table2,
  TerminalSquare,
  Wrench,
} from "lucide-react"

import { QueryChart } from "@/components/sql/QueryChart"
import { SqlCodeBlock } from "@/components/sql/SqlCodeBlock"
import { SqlComposer } from "@/components/sql/SqlComposer"
import { SqlEmptyState } from "@/components/sql/SqlEmptyState"
import { SqlResultTable } from "@/components/sql/SqlResultTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { askTextToSql } from "@/lib/api"
import type { TextToSqlResponse } from "@/types/textToSql"

interface TextToSqlPageProps {
  onNavigateRag: () => void
}

export function TextToSqlPage({ onNavigateRag }: TextToSqlPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TextToSqlResponse | null>(null)

  async function handleQuestion(question: string) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      setResult(await askTextToSql({ question }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong while querying Snowflake.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden text-zinc-100">
      <aside
        className={`${sidebarOpen ? "w-72" : "w-0"} hidden shrink-0 overflow-hidden border-r border-zinc-800/80 bg-zinc-950/80 transition-[width] duration-300 lg:block`}
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
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Workspace</p>
            <button
              type="button"
              onClick={onNavigateRag}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-300"
            >
              <MessageSquareText className="size-4" />
              Review RAG Chat
            </button>
            <button className="mt-1 flex w-full items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-left text-sm text-rose-200">
              <TerminalSquare className="size-4" />
              Text to SQL
              <Badge className="ml-auto border-emerald-500/20 bg-emerald-500/10 text-[9px] text-emerald-300">Live</Badge>
            </button>
          </div>

          <div className="mt-7">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Query pipeline</p>
            {[
              [Database, "Snowflake MARTS", "Analytics source"],
              [Bot, "Gemini", "SQL + insight"],
              [ShieldCheck, "SQLGlot", "Read-only validation"],
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
              Text-to-SQL backend connected
            </div>
            <p className="mt-2 text-[11px] leading-5 text-zinc-600">FastAPI → Gemini → SQLGlot → Snowflake</p>
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
                <h1 className="truncate text-sm font-semibold text-white sm:text-base">Data Intelligence</h1>
                <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Read only</Badge>
              </div>
              <p className="hidden text-xs text-zinc-500 sm:block">Natural language → validated Snowflake SQL → insight</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <DatabaseZap className="size-3.5" />
            MARTS only
          </div>
        </header>

        <section className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
          {!result && !loading && !error ? (
            <SqlEmptyState onSelect={(question) => void handleQuestion(question)} />
          ) : (
            <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
              {loading && (
                <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-5 h-4 w-5/6" />
                    <Skeleton className="mt-3 h-4 w-3/4" />
                    <Skeleton className="mt-3 h-4 w-2/3" />
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="mt-5 h-36 w-full" />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                  <p className="text-sm font-semibold text-red-300">Query failed</p>
                  <p className="mt-2 text-sm leading-6 text-red-300/75">{error}</p>
                </div>
              )}

              {result && (
                <>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/65 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-300">Question</Badge>
                      {result.repaired && (
                        <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-300">
                          <Wrench className="mr-1 size-3" /> Repaired once
                        </Badge>
                      )}
                      {result.truncated && (
                        <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-300">Rows truncated</Badge>
                      )}
                    </div>
                    <h2 className="mt-4 text-lg font-semibold tracking-tight text-white">{result.question}</h2>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/65 p-5 sm:p-6">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                        <Bot className="size-3.5" /> Analysis
                      </div>
                      <div className="markdown-answer mt-4 text-sm leading-7 text-zinc-300">
                        <ReactMarkdown>{result.answer}</ReactMarkdown>
                      </div>
                      {result.explanation && (
                        <div className="mt-5 border-t border-zinc-800 pt-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Query logic</p>
                          <p className="mt-2 text-xs leading-5 text-zinc-500">{result.explanation}</p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/65 p-5 sm:p-6">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                        <CheckCircle2 className="size-3.5" /> Execution
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/55 p-3">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">Rows</p>
                          <p className="mt-1.5 text-xl font-semibold text-white">{result.rows.length}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/55 p-3">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">Columns</p>
                          <p className="mt-1.5 text-xl font-semibold text-white">{result.columns.length}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">Tables used</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {result.tables_used.length > 0 ? result.tables_used.map((table) => (
                            <Badge key={table} className="border-zinc-700 bg-zinc-950 text-zinc-400">{table}</Badge>
                          )) : <span className="text-xs text-zinc-600">No physical table reported</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <QueryChart question={result.question} columns={result.columns} rows={result.rows} />

                  {result.rows.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Table2 className="size-4 text-zinc-500" />
                          <h3 className="text-sm font-semibold text-zinc-200">Query results</h3>
                        </div>
                        <span className="text-xs text-zinc-600">{result.rows.length} returned row{result.rows.length === 1 ? "" : "s"}</span>
                      </div>
                      <SqlResultTable columns={result.columns} rows={result.rows} />
                    </div>
                  )}

                  {result.sql && <SqlCodeBlock sql={result.sql} />}

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/35 px-4 py-3 text-xs text-zinc-600">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-3.5 text-emerald-500" />
                      Query access is restricted to the read-only MARTS role and validated before execution.
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <div className="mx-auto w-full max-w-6xl">
          <SqlComposer loading={loading} onSubmit={(question) => void handleQuestion(question)} />
        </div>
      </main>
    </div>
  )
}
