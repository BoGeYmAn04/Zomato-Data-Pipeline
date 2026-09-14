import { useState } from "react"

import { RagChatPage } from "@/pages/RagChatPage"
import { TextToSqlPage } from "@/pages/TextToSqlPage"

type Workspace = "rag" | "sql"

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>("rag")

  if (workspace === "sql") {
    return <TextToSqlPage onNavigateRag={() => setWorkspace("rag")} />
  }

  return <RagChatPage onNavigateSql={() => setWorkspace("sql")} />
}
