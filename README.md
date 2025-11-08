# BoltNewClone

![Project Banner](./public/WorkingImage.png)

A modern Next.js web application inspired by Bolt, featuring AI-powered chat and code tools, authentication, and workspace management. Built with TypeScript, Convex, and a modular component structure.

## Features

- AI Chat and Code Generation (OpenAI integration)
- **OpenAPI Workflow Builder** - Transform any API into conversational workflows
- **Natural Language Flow Builder** - Describe workflows in plain English and let AI determine endpoints and order
- **Magoc Backend Integration** - Process OpenAPI specifications automatically
- User Authentication
- Workspace Management
- Modular UI Components
- Convex backend for real-time data
- Responsive and modern design

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Bun (optional, for faster installs)
- Convex account (for backend)

### Installation

```bash
bun run install # or npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your API keys and configuration.

### Running Locally

```bash
bun run dev # or npm run dev
```

### Convex Setup

1.  Install Convex CLI: `npm install -g convex`
2.  Run `npx convex dev` to start the backend.

# BoltNewClone

![Project Banner](./public/banner.png)

BoltNewClone is a modern, TypeScript-based Next.js application inspired by Bolt. It combines AI-powered chat & code tools, user authentication, and workspace management with a Convex backend for real-time data.

## Quick overview

- AI-first chat and code helpers (API routes under `app/api/`)
- User sessions and auth routes
- Workspace-centric UI and components in `components/workspace`
- Convex-powered backend and schema in `convex/`

## Requirements

- Node.js 18+ (or the version compatible with your Next.js setup)
- Bun (optional) or npm/yarn/pnpm for installs
- Convex account (for production/back-end development)

## Quickstart (local)

1. Copy env file and add keys

```zsh
cp .env.example .env
# Open .env and fill required keys (API keys, Convex url, etc.)
```

2. Install dependencies

```zsh
# using bun (recommended if installed)
bun install

# or with npm
npm install
```

3. Start Convex (if you use Convex locally)

```zsh
npx convex dev
```

4. Run the dev server

```zsh
bun dev
# or
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment

Use the `.env.example` file as the authoritative list of variables. Copy it to `.env` and fill values used by your AI integrations and Convex. If you want, add the banner image at `public/banner.png` (or update the path in this README).

## Project structure

```
app/              # Next.js app dir (routes, API handlers, pages)
  api/            # API routes including OpenAPI and workflow endpoints
  openapi-builder/ # OpenAPI workflow builder page
components/       # UI components (Header, Hero, workspace views)
  openapi/        # OpenAPI-specific components (uploader, viewer, builder)
configs/          # AI model config (e.g. `configs/AIModel.ts`)
context/          # React context providers
convex/           # Convex schema, functions and generated code
data/             # Static data like prompts, lookups, colors
docs/             # Documentation including Magoc integration guide
lib/              # Utilities and helpers
  services/       # Backend service clients (e.g., backendService.ts)
  types/          # TypeScript type definitions (e.g., openapi.ts)
providers/        # App-wide providers (Convex client, Theme, Message)
public/           # Static assets (put banner image here)
```

## OpenAPI Workflow Integration

This project integrates with the Magoc Python backend to process OpenAPI specifications and create conversational workflows.

> **Important**: The Magoc backend is a powerful Python-based MCP (Model Context Protocol) toolkit designed specifically for API spec evaluation. It features the automagik-genie orchestrator that transforms any API into an intelligent agent. All AI-powered workflow generation is handled by this specialized backend rather than being implemented in the Next.js layer.

### Architecture

**Proper Separation of Concerns**:
- **Magoc Python Backend**: OpenAPI spec processing, AI-powered workflow generation, MCP tool orchestration
- **Next.js Frontend**: User interface, routing, data persistence, thin API proxy layer

See [docs/BACKEND_DELEGATION_ARCHITECTURE.md](docs/BACKEND_DELEGATION_ARCHITECTURE.md) for complete architectural details.

### Backend Setup

This repository includes a complete Python backend implementation in `magoc-backend/` that can be:
1. Run locally for development
2. Dropped into the [Magoc repository](https://github.com/rkendel1/Magoc) for production integration

#### Running the Python Backend Locally

```bash
# Navigate to the backend directory
cd magoc-backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
uvicorn magoc_workflow_extensions.api:app --reload --port 8000

# Or using Python directly
python -m magoc_workflow_extensions.api
```

#### Using Docker

```bash
cd magoc-backend
docker build -t magoc-workflow-backend .
docker run -p 8000:8000 -e OPENAI_API_KEY=your-key magoc-workflow-backend
```

#### Integration with Magoc Repository

To integrate with the official Magoc repository:

```bash
# Copy the backend directory to Magoc
cp -r magoc-backend/* /path/to/Magoc/

# Follow the setup instructions in magoc-backend/README.md
```

### Frontend Setup

1. Configure the backend URL in `.env`:
   ```
   NEXT_PUBLIC_MAGOC_BACKEND_URL=http://localhost:8000
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```

3. Access the API Builder at `/openapi-builder` after signing in

### Natural Language Flow Builder

The Natural Language Flow Builder allows you to describe your desired workflow in plain English:

1. Upload your OpenAPI specification
2. Click the "Natural Language" button
3. Describe what you want to achieve (e.g., "Create a user, send welcome email, and add to default group")
4. AI will automatically determine which endpoints to use and in what order
5. Review and use the generated workflow

For detailed documentation, see:
- [Backend Delegation Architecture](docs/BACKEND_DELEGATION_ARCHITECTURE.md) - Understanding the proper architecture
- [Refactoring Guide](docs/REFACTORING_GUIDE.md) - How to delegate operations to Magoc
- [Natural Language Flow](docs/NATURAL_LANGUAGE_FLOW.md) - Feature documentation
- [Magoc Integration](docs/MAGOC_INTEGRATION.md) - Integration instructions
- [Python Backend README](magoc-backend/README.md) - Backend API documentation

## Notes on Convex

This app uses Convex for real-time storage and server functions. If you don't need Convex during local development you can skip `npx convex dev`, but some features (workspaces, live updates) will be unavailable.

If you plan to deploy, set up a Convex project and point your `.env` to the production Convex URL / keys.

## Development tips

- Replace `public/banner.png` with your project image. The README references that file so GitHub will render it.
- Edit pages in `app/` and components in `components/` — Next 13+ app dir supports fast refresh.
- AI model selection lives in `configs/AIModel.ts`.

## Tests and lints

This template doesn't include a test runner by default. Add your preferred tooling (Jest/Playwright/Testing Library, ESLint) as needed.

## Deployment

- Deploy on Vercel for a frictionless Next.js deployment. Connect your repository and set the environment variables in the Vercel dashboard. If you use Convex, make sure the Convex URL/keys are set in production envs.

## Contributing

Contributions are welcome. Open issues or PRs, describe the change, and include a short test or screenshot where helpful.

---

_Built with Next.js, Convex, and minimal ❤️ by Avik-creator._
