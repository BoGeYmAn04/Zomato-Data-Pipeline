import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SqlCell } from "@/types/textToSql"

interface SqlResultTableProps {
  columns: string[]
  rows: SqlCell[][]
}

function formatColumn(column: string) {
  return column.replaceAll("_", " ")
}

function formatCell(value: SqlCell) {
  if (value === null) return <span className="text-zinc-600">NULL</span>
  if (typeof value === "boolean") return value ? "True" : "False"
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)
  }
  return value
}

export function SqlResultTable({ columns, rows }: SqlResultTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-900/75 hover:bg-zinc-900/75">
            {columns.map((column) => (
              <TableHead key={column}>{formatColumn(column)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, columnIndex) => (
                <TableCell key={`${rowIndex}-${column}`}>{formatCell(row[columnIndex] ?? null)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
