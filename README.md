# FindShyt 🚀  
*You can find-shyt and phish them*

A real-time question & answer chat / challenge application (built with Next.js, TypeScript, Supabase, etc.).  

---

## Table of Contents

- [Demo / Live](#demo--live)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Setup](#setup)  
  - [Env Variables](#env-variables)  
  - [Running Locally](#running-locally)  
  - [Deploying](#deploying)  
- [How it Works / Architecture](#how-it-works--architecture)  
- [Folder Structure](#folder-structure)  
- [Contributing](#contributing)  
- [License](#license)  
- [Acknowledgements](#acknowledgements)  

---

## Demo / Live

👉 [find-shyt.vercel.app](https://find-shyt.vercel.app)  

---

## Features

- 🔄 Real-time updates of chat messages and answers (via Supabase real-time)  
- 👥 Paired Q&A — users respond to the same question and see each other’s answers  
- 💬 Chat interface to discuss or reflect after answering  
- 📅 Daily / Question cycling  
- ⚡ State syncing so that when one user responds, the partner sees it live  
- 🧹 Proper cleanup of subscriptions / listeners  

---

## Tech Stack

- **Frontend / Framework**: [Next.js](https://nextjs.org/) (React) + TypeScript  
- **UI / Styling**: [Tailwind CSS](https://tailwindcss.com/)  
- **Backend / Database / Real-time**: [Supabase](https://supabase.com/) (auth, Postgres, real-time features)  
- **Hosting / Deployment**: [Vercel](https://vercel.com/)  
- **Utilities / Hooks**: Custom React hooks, API wrappers  

---

## Getting Started

### Prerequisites

- Node.js (>= 16)  
- pnpm / npm / yarn  
- Supabase project (with database + real-time enabled)  

### Setup

Clone the repo and install dependencies:

    git clone https://github.com/k499wang/FindShyt.git
    cd FindShyt
    pnpm install   # or npm install / yarn install

### Env Variables

Create a `.env.local` file and provide the required keys:

    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_KEY=your-supabase-service-key

### Running Locally

    pnpm dev
    # or npm run dev / yarn dev

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploying

Deploy easily via **Vercel**.  
Make sure to set the environment variables in your project dashboard.

---

## How it Works / Architecture

1. **User / Pairing**  
   - Users are paired via a `pairId`. Each “question session” is identified by `pairId + day + questionId`.

2. **Subscriptions / Real-Time Updates**  
   - The frontend subscribes (via `apiSubscribeAnswerChat`) to Supabase real-time changes.  
   - On DB updates, callbacks (`onMessagesChange`, `onAnswersChange`) run and refresh local state.

3. **Effect Cleanup & Re-subscription**  
   - The subscription lives inside a React `useEffect`.  
   - When dependencies change or the component unmounts, it unsubscribes to prevent leaks.

4. **Data Flow**  
   - User submits answer → DB insert → Supabase pushes change → frontend updates partner view.  
   - Messages are stored in a `messages` table and synced the same way.  

---

## Folder Structure

    /app
    /components
    /hooks
    /lib
    /public
    /styles
    /types
    /middleware.ts
    /next.config.mjs
    /package.json
    /tsconfig.json

---

## Contributing

Contributions welcome!  

1. Fork the repo  
2. Create a feature branch (`git checkout -b feat/your-feature`)  
3. Commit your changes  
4. Push and open a PR  

---

## License

This project is licensed under the **MIT License**.  

---

## Acknowledgements

- [Supabase](https://supabase.com/) for real-time & database  
- [Vercel](https://vercel.com/) for hosting  
- [Tailwind CSS](https://tailwindcss.com/) for styling  
- Hackathon spirit ✨  
