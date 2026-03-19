# LMS Course Platform - 100% Deployment Ready

This is a full-stack LMS application with a Next.js frontend and Node.js/Express backend, optimized for Vercel deployment and Hugging Face AI integration.

## 🚀 One-Click Vercel Deployment

1. **Import to Vercel**: Connect your GitHub repository.
2. **Important**: Set the **Root Directory** to the base folder (it contains `vercel.json` and `package.json`).
3. **Environment Variables**: You MUST add the following in the Vercel Dashboard:
   - `HUGGINGFACE_API_KEY`: (Your Hugging Face Token)
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: (From your hosted MySQL DB)
   - `NEXT_PUBLIC_API_URL`: `/api`
   - `JWT_SECRET`: (Any random secure string)
   - `JWT_REFRESH_SECRET`: (Any random secure string)

## 🗄️ Database Setup (To fix "Server Error")

Since Vercel cannot connect to your local computer, you must:
1. Use a cloud database (like [Aiven](https://aiven.io/), [Railway](https://railway.app/), or [PlanetScale](https://planetscale.com/)).
2. Log in to your cloud database's SQL console.
3. Copy and run the code from `backend/schema.sql`.

## 🤖 AI Assistant

- The AI assistant is integrated with the latest Hugging Face router API.
- We are using the `Qwen/Qwen2.5-7B-Instruct` model for high-quality responses.
- If you see "Lite Mode", it means your `HUGGINGFACE_API_KEY` is missing in Vercel.

## 🛠️ Local Development

1. Run `npm install` in the root.
2. Create `.env` files in `frontend/` and `backend/`.
3. Start both: `npm run dev` from the root.
