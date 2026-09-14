export interface RagSource {
  label: string
  review_id: string | null
  city: string | null
  rating: number | null
  sentiment_label: string | null
  topic: string | null
  key_issue: string | null
  comment: string
}

export interface RagChatResponse {
  answer: string
  sources: RagSource[]
}

export interface RagChatRequest {
  question: string
  top_k?: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: RagSource[]
}
