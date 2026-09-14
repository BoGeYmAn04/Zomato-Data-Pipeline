# Zomato AI Frontend

The frontend for the **Zomato AI Data Pipeline & Analytics** project.

It provides two AI-powered analytics experiences:

1. **Review Intelligence** — RAG chat over customer reviews.
2. **Data Intelligence** — Text-to-SQL analytics over Snowflake marts.

The interface is built with **React, TypeScript, Vite, shadcn/ui, Tailwind CSS, and Recharts** and communicates with the FastAPI backend.

---

## Features

### Review Intelligence

Ask natural-language questions about customer reviews.

Example:

> What are customers complaining about delivery?

The frontend sends the question to:

```http
POST /api/rag/chat
```

and displays:

- grounded AI answer
- retrieved source reviews
- city
- rating
- sentiment
- topic
- key issue

---

### Data Intelligence

Ask business questions in plain English.

Example:

> Show me the top 5 restaurants by number of orders.

The frontend sends the question to:

```http
POST /api/sql/query
```

and displays:

- natural-language business answer
- generated Snowflake SQL
- query explanation
- result table
- tables used
- SQL repair status
- truncation status
- automatic charts when the result is suitable

---

## Visualizations

Query results are visualized with **Recharts**.

The UI chooses an appropriate visualization based on the returned data:

- **Bar chart** — rankings and categorical comparisons
- **Line chart** — time-based trends
- **Pie chart** — small part-to-whole distributions
- **Table only** — when a chart would not improve the result

Examples:

```text
Top restaurants by revenue
→ Bar chart

Monthly order trend
→ Line chart

Revenue share by category
→ Pie chart

Total number of orders
→ KPI / table without an unnecessary chart
```

---

## Tech Stack

- React
- TypeScript
- Vite
- shadcn/ui
- Tailwind CSS
- Recharts
- Lucide React
- FastAPI backend

---

## Project Structure

```text
frontend/
│
├── public/
│   └── logo.png
│
├── src/
│   ├── components/
│   │   ├── sql/
│   │   │   ├── QueryChart.tsx
│   │   │   ├── SqlCodeBlock.tsx
│   │   │   ├── SqlComposer.tsx
│   │   │   ├── SqlEmptyState.tsx
│   │   │   └── SqlResultTable.tsx
│   │   ├── chat/
│   │   │   ├── ChatComposer.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── SourceCard.tsx
│   │   └── ui/
│   │       └── ... shadcn/ui components
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   ├── pages/
│   │   ├── RagChatPage.tsx
│   │   └── TextToSqlPage.tsx
│   │
│   ├── types/
│   │   └── textToSql.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

The exact component list may evolve, but the frontend keeps API access, UI components, pages, and TypeScript types separated.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the backend URL

Create:

```text
.env
```

from `.env.example` and set:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Do not add a trailing `/` unless your API helper expects one.

### 3. Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Make sure FastAPI is also running:

```bash
uvicorn src.ai.api.main:app --reload --port 8000
```

from the repository root.

---

## Backend API Contract

### RAG

Request:

```http
POST /api/rag/chat
Content-Type: application/json
```

```json
{
  "question": "What are the major food quality complaints?",
  "top_k": 5
}
```

Typical response:

```json
{
  "answer": "Customers frequently mention...",
  "sources": [
    {
      "label": "R1",
      "review_id": "20",
      "city": "Mumbai",
      "rating": 2,
      "sentiment_label": "negative",
      "topic": "food quality",
      "key_issue": "Food arrived cold",
      "comment": "..."
    }
  ]
}
```

---

### Text-to-SQL

Request:

```http
POST /api/sql/query
Content-Type: application/json
```

```json
{
  "question": "Show me the top 5 restaurants by number of orders."
}
```

Typical response:

```json
{
  "question": "Show me the top 5 restaurants by number of orders.",
  "answer": "The leading restaurants by order count are...",
  "sql": "SELECT ...",
  "explanation": "Counts orders by restaurant and ranks them.",
  "columns": [
    "RESTAURANT_NAME",
    "ORDER_COUNT"
  ],
  "rows": [
    ["Restaurant A", 1200],
    ["Restaurant B", 1100]
  ],
  "tables_used": [
    "ZOMATO.MARTS.FCT_ORDERS"
  ],
  "repaired": false,
  "truncated": false
}
```

---

## UI Design

The application uses a dashboard-style layout with two primary modes:

```text
Zomato AI
│
├── Review Intelligence
│     └── RAG chat + supporting review cards
│
└── Data Intelligence
      └── AI answer
          + generated SQL
          + result table
          + chart
```

The generated SQL is shown separately so users can understand and inspect the query that produced the result.

The result table uses shadcn-style table components, while charts are rendered using Recharts.

---

## Environment Variables

Only frontend-safe variables should be exposed through Vite.

```env
VITE_API_BASE_URL=http://localhost:8000
```

Do **not** put these in the frontend:

```text
GOOGLE_API_KEY
SNOWFLAKE_PASSWORD
CHROMA_API_KEY
```

Those belong only in the FastAPI/backend environment.

Remember: any `VITE_*` value is included in the browser bundle and should be treated as public.

---

## Production Build

Run:

```bash
npm run build
```

The production output is generated under:

```text
dist/
```

Test the build locally if desired:

```bash
npm run preview
```

---

## Deploy to Render

Create a **Render Static Site** using the same GitHub repository.

Recommended settings:

```text
Root Directory: frontend
Build Command: npm ci && npm run build
Publish Directory: dist
```

If the project does not have a committed `package-lock.json`, use:

```text
npm install && npm run build
```

Set:

```env
VITE_API_BASE_URL=https://<your-fastapi-backend>.onrender.com
```

After the frontend gets its production URL, configure the FastAPI backend:

```env
FRONTEND_ORIGIN=https://<your-frontend>.onrender.com
```

and redeploy/restart the backend so CORS allows the frontend.

---

## Branding

Place the application logo at:

```text
public/logo.png
```

Example favicon metadata in `index.html`:

```html
<link rel="icon" type="image/png" href="/logo.png" />
<link rel="apple-touch-icon" href="/logo.png" />
```

Inside React:

```tsx
<img
  src="/logo.png"
  alt="Zomato AI"
  className="h-10 w-10 object-contain"
/>
```

---

## Development Notes

- Keep all backend communication in the API helper layer.
- Keep API response types in TypeScript interfaces/types.
- Do not expose backend secrets to Vite.
- Prefer shadcn/ui components for consistent styling.
- Use charts only when they improve interpretation.
- Keep tables available even when a chart is displayed so users can inspect exact values.
- Handle Render/backend cold starts with a visible loading state rather than assuming an immediate response.

---

## Related Backend

The backend provides:

```text
GET  /health
POST /api/rag/chat
POST /api/sql/query
```

See the root repository README for the full data pipeline, AI architecture, Airflow DAG, Snowflake setup, and backend deployment.
