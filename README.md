# Art Gallery — Painting E-Commerce Frontend

Lightweight React frontend for a painting e-commerce store (Tanjore, watercolor, pencil art, and materials).

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- shadcn/ui primitives (Button, Input, Label, Select, Sheet)
- React Router, Zustand, Axios, React Hook Form, Zod

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` to your FastAPI backend base URL (no trailing slash).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Buyer registration |
| `/forgot-password` | Email check + inline password reset |
| `/dashboard` | Banner carousel + 5 featured products |
| `/products` | Search, filters, pagination |
| `/products/:id` | Product details |
| `/cart` | Shopping cart (Zustand, persisted) |
| `/checkout` | Checkout + payment initiation |
| `/orders` | Order list |
| `/orders/:id` | Order details + progress |
| `/profile` | Profile update |

Protected buyer routes require authentication via `ProtectedRoute`.
