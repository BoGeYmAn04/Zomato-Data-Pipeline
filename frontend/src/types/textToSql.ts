export interface TextToSqlRequest {
  question: string
}

export type SqlCell = string | number | boolean | null

export interface TextToSqlResponse {
  question: string
  answer: string
  sql: string | null
  explanation: string | null
  columns: string[]
  rows: SqlCell[][]
  tables_used: string[]
  repaired: boolean
  truncated: boolean
}
