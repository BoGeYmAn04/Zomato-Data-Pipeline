# Zomato Review Intelligence Frontend

React + TypeScript + shadcn-style UI for the Zomato RAG backend.

## Features

- Chat UI for `POST /api/rag/chat`
- Evidence/source cards for retrieved reviews
- Sentiment, topic, city, rating and key-issue metadata
- Configurable `top_k`
- Loading and API error states
- Responsive dark dashboard design
- Placeholder navigation for the upcoming Text-to-SQL module

## Backend contract

The UI expects:

```http
POST /api/rag/chat
Content-Type: application/json
```

Request:

```json
{
  "question": "What are customers complaining about delivery?",
  "top_k": 5
}
```

Response:

```json
{
  "answer": "...",
  "sources": [
    {
      "label": "R1",
      "review_id": "20",
      "city": "Mumbai",
      "rating": 2,
      "sentiment_label": "negative",
      "topic": "delivery",
      "key_issue": "late delivery",
      "comment": "Delivery was extremely late..."
    }
  ]
}
```

## Run locally

1. Copy the environment file:

```powershell
Copy-Item .env.example .env
```

2. Keep your FastAPI server running on port 8000, or edit `VITE_API_BASE_URL` in `.env`.

3. Install dependencies:

```powershell
npm install
```

4. Start Vite:

```powershell
npm run dev
```

Open `http://localhost:5173`.

## FastAPI CORS

Your backend should allow this origin during local development:

```env
FRONTEND_ORIGIN=http://localhost:5173
```

## Render later

When the FastAPI service is deployed, set the frontend environment variable in Render:

```env
VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com
```

Then set `FRONTEND_ORIGIN` on the backend to your deployed frontend URL.

## Project structure

```text
src/
├── components/
│   ├── chat/
│   │   ├── ChatComposer.tsx
│   │   ├── EmptyState.tsx
│   │   ├── MessageBubble.tsx
│   │   └── SourceCard.tsx
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── skeleton.tsx
│       └── textarea.tsx
├── lib/
│   ├── api.ts
│   └── utils.ts
├── pages/
│   └── RagChatPage.tsx
├── types/
│   └── rag.ts
├── App.tsx
├── index.css
└── main.tsx
```
