<h1 align="center"><b>Cats 🐱, Dogs 🐶, Memes 🐸, etc 🤖. v1</b></h1>

<p align="center">
    <a href="#whats-included"><strong>What's included</strong></a> ·
    <a href="#prerequisites"><strong>Prerequisites</strong></a> ·
    <a href="#getting-started"><strong>Getting Started</strong></a>
</p>

The latest on Next.js framework in a monorepo setup, ready for edge, Supabase, and Expo app development with a focus on code reuse and best practices for edge server computing.

## What's Included

- **Next.js** - Framework
- **Web3Auth MPC** - Custom Wallet Framework
- **Liveblocks** - Real-time Framework
- **Turborepo** - Build System
- **Biome** - Linter and Formatter
- **TailwindCSS** - Styling
- **Shadcn** - UI Components
- **TypeScript** - Type Safety
- **Supabase** - Authentication, Database, Storage
- **Upstash** - Cache and Rate Limiting
- **React Email** - Email Templates
- **Resend** - Email Delivery
- **i18n** - Internationalization
- **Dub** - Sharable Links
- **Trigger.dev** - Background Jobs
- **OpenPanel** - Analytics
- **react-safe-action** - Validated Server Actions
- **nuqs** - Type-safe Search Params State Manager
- **next-themes** - Theme Manager

## Directory Structure

```plaintext
cats_dogs_memes95/
├── packages/
│   ├── v1/                       # Core v1 package containing main application logic
│   ├── solidity/                 # Solidity contracts and blockchain-related code
├── apps/                         # Application workspace
│   ├── api/                      # Supabase (API, Auth, Storage, Realtime, Edge Functions)
│   ├── app/                      # UI for Cats, Dogs, Memes, etc.
│   ├── web/                      # Web application
├── tooling/                      # Shared configurations (TypeScript, etc.)
│   └── typescript/               # Shared TypeScript configuration
├── .cursorrules                  # Cursor rules specific to this project
├── biome.json                    # Biome configuration
├── turbo.json                    # Turbo configuration
├── LICENSE
└── README.md
```
Prerequisites

    Bun
    Docker
    Upstash
    Dub
    Trigger.dev
    Resend
    Supabase
    Sentry
    OpenPanel

Getting Started

To get started, follow these steps:

    Install dependencies using Bun:

    sh

bun i

Copy environment variables:

sh

# Copy .env.example to .env for each app
cp apps/api/.env.example apps/api/.env
cp apps/app/.env.example apps/app/.env
cp apps/web/.env.example apps/web/.env

Start the development server using Bun or Turbo:

    sh

Start everything in development mode (web, app, api, email)
    
    bun dev

Start individual apps in development mode
    
    bun dev:web   # Web app
    bun dev:app   # App
    bun dev:api   # API
    bun dev:email # Email app

Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

### Explanation

1. **`packages\v1`**: This directory contains the core logic and modules for the main application.
2. **`packages\solidity`**: This directory is focused on blockchain and smart contract functionalities, where the Solidity code resides.
3. The README provides a clear guide on what's included in the project, prerequisites, how to get started, and instructions for deployment to Vercel.

Feel free to modify or extend this README to better fit the needs of your specific project! &#8203;:contentReference[oaicite:0]{index=0}&#8203;

# Live long and build! 🖖🏼
