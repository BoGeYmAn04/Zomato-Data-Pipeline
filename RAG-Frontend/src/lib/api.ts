import type { RagChatRequest, RagChatResponse } from "@/types/rag"

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
)

export async function askRag(request: RagChatRequest): Promise<RagChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/rag/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) message = body.detail
    } catch {
      // Keep the fallback message if the response body is not JSON.
    }

    throw new Error(message)
  }

  return response.json() as Promise<RagChatResponse>
}
