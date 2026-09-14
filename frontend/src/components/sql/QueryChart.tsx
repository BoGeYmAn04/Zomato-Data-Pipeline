import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { SqlCell } from "@/types/textToSql"

type ChartKind = "bar" | "line" | "pie"

interface QueryChartProps {
  question: string
  columns: string[]
  rows: SqlCell[][]
}

interface ChartPoint {
  label: string
  value: number
}

const pieColors = ["#f43f5e", "#fb7185", "#e11d48", "#be123c", "#fda4af", "#9f1239"]

function compact(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: Math.abs(value) >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value)
}

function looksTemporal(value: SqlCell, column: string) {
  const name = column.toLowerCase()
  if (/date|month|year|week|quarter|day|time/.test(name)) return true
  if (typeof value !== "string") return false
  return /^\d{4}[-/]\d{1,2}/.test(value) || /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(value)
}

function chooseChart(question: string, firstValue: SqlCell, firstColumn: string, points: ChartPoint[]): ChartKind {
  const normalized = question.toLowerCase()
  if (looksTemporal(firstValue, firstColumn)) return "line"
  if (
    points.length <= 6 &&
    points.every((point) => point.value >= 0) &&
    /share|distribution|breakdown|percentage|proportion|mix/.test(normalized)
  ) {
    return "pie"
  }
  return "bar"
}

export function QueryChart({ question, columns, rows }: QueryChartProps) {
  if (columns.length < 2 || rows.length < 2) return null

  const numericColumnIndex = columns.findIndex((_, index) =>
    index > 0 && rows.some((row) => typeof row[index] === "number"),
  )

  if (numericColumnIndex === -1) return null

  const labelColumnIndex = columns.findIndex((_, index) =>
    index !== numericColumnIndex && rows.some((row) => typeof row[index] === "string" || typeof row[index] === "number"),
  )

  if (labelColumnIndex === -1) return null

  const points = rows
    .map((row) => ({
      label: String(row[labelColumnIndex] ?? "Unknown"),
      value: Number(row[numericColumnIndex]),
    }))
    .filter((point) => Number.isFinite(point.value))
    .slice(0, 12)

  if (points.length < 2) return null

  const kind = chooseChart(question, rows[0]?.[labelColumnIndex] ?? null, columns[labelColumnIndex], points)
  const metric = columns[numericColumnIndex].replaceAll("_", " ")
  const category = columns[labelColumnIndex].replaceAll("_", " ")

  const tooltipStyle = {
    background: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: 12,
    fontSize: 12,
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 sm:p-5">
      <div className="mb-5">
        <p className="text-sm font-semibold capitalize text-zinc-200">{metric} by {category}</p>
        <p className="mt-1 text-xs text-zinc-600">Visualization generated from the returned Snowflake rows</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "line" ? (
            <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#71717a" tickLine={false} axisLine={false} fontSize={11} minTickGap={20} />
              <YAxis stroke="#71717a" tickLine={false} axisLine={false} fontSize={11} tickFormatter={compact} width={58} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [compact(Number(value)), metric]} />
              <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2.4} dot={{ fill: "#f43f5e", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          ) : kind === "pie" ? (
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [compact(Number(value)), metric]} />
              <Pie data={points} dataKey="value" nameKey="label" innerRadius={58} outerRadius={96} paddingAngle={3} stroke="none">
                {points.map((point, index) => (
                  <Cell key={`${point.label}-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#71717a" tickLine={false} axisLine={false} fontSize={11} minTickGap={16} />
              <YAxis stroke="#71717a" tickLine={false} axisLine={false} fontSize={11} tickFormatter={compact} width={58} />
              <Tooltip cursor={{ fill: "rgba(63,63,70,0.25)" }} contentStyle={tooltipStyle} formatter={(value) => [compact(Number(value)), metric]} />
              <Bar dataKey="value" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
