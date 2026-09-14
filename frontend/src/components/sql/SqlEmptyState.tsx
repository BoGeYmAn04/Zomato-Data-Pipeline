import { BarChart3, Database, PieChart, Sparkles, TrendingUp } from "lucide-react"

const suggestions = [
  {
    icon: TrendingUp,
    title: "Revenue leaders",
    question: "Which restaurants generated the most revenue?",
  },
  {
    icon: BarChart3,
    title: "Order volume",
    question: "Show the top 5 restaurants by total orders.",
  },
  {
    icon: PieChart,
    title: "City mix",
    question: "Which cities have the highest number of orders?",
  },
  {
    icon: Database,
    title: "Quick metric",
    question: "Show me the total number of orders.",
  },
]

interface SqlEmptyStateProps {
  onSelect: (question: string) => void
}

export function SqlEmptyState({ onSelect }: SqlEmptyStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-950/20">
          <Sparkles className="size-5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-400">Data Intelligence</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ask the warehouse in plain English.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500">
          Gemini generates read-only Snowflake SQL against your MARTS layer, the query is validated,
          executed, and returned with an explanation, table, and chart when the result is visualizable.
        </p>
      </div>

      <div className="mt-9 grid gap-3 sm:grid-cols-2">
        {suggestions.map(({ icon: Icon, title, question }) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect(question)}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-left transition hover:border-rose-500/25 hover:bg-zinc-900"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500 transition group-hover:bg-rose-500/10 group-hover:text-rose-300">
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-300">{title}</p>
                <p className="mt-1.5 text-sm leading-5 text-zinc-500">{question}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
