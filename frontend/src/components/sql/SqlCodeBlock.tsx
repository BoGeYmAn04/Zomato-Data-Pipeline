import { useState } from "react"
import { Check, Copy, TerminalSquare } from "lucide-react"

import { Button } from "@/components/ui/button"

interface SqlCodeBlockProps {
  sql: string
}

export function SqlCodeBlock({ sql }: SqlCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function copySql() {
    await navigator.clipboard.writeText(sql)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#08080a]">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <TerminalSquare className="size-3.5" />
          Snowflake SQL
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => void copySql()} className="h-7 gap-1.5 text-xs text-zinc-500 hover:text-zinc-200">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="custom-scrollbar overflow-x-auto p-4 text-[12px] leading-6 text-zinc-300">
        <code>{sql}</code>
      </pre>
    </div>
  )
}
