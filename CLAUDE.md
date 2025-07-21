# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Development: `npm run dev` (port 3006)
- Build: `npm run build`
- Start production: `npm run start`
- Lint: `npm run lint`
- Test: `npx vitest run`
- Single test: `npx vitest run path/to/test.spec.ts`
- Node.js subdirectory: `cd nodejs && node index.js` (Shopify API testing)

## Project Architecture
This is a Next.js 14 playground project with mixed App Router and Pages Router architecture. The project contains multiple interactive games and AWS Amplify integration.

### Technology Stack
- **Framework**: Next.js 14.2.3 with React 18.3.1
- **Language**: TypeScript 5.1.3 with strict type checking
- **Styling**: Tailwind CSS 3.4.7
- **Testing**: Vitest 2.0.4 with Happy DOM environment
- **State Management**: SWR 2.0.4 for data fetching
- **AWS**: Amplify integration for backend services
- **API**: gRPC with Protocol Buffers

### Directory Structure
- `/app/` - Next.js App Router pages (mahjong-trainer, osho-shutsujin, othello-claude3, performance)
- `/pages/` - Legacy Pages Router (mixed architecture)
- `/components/` - Feature-organized React components (mahjongTrainer/, shogiPuzzle/, etc.)
- `/hooks/` - Custom React hooks with tests
- `/data/` - Static data and configurations
- `/public/` - Static assets including game piece SVG images
- `/protobuf/` - gRPC protocol buffer definitions
- `/nodejs/` - Separate Node.js project for Shopify API experimentation

### Game Applications
The project includes several interactive games:
1. **Mahjong Trainer** (`/app/mahjong-trainer/`) - Tile efficiency training with SVG assets
2. **Osho Shutsujin** (`/app/osho-shutsujin/`) - Shogi puzzle game
3. **Othello** (`/app/othello-claude3/`) - Multiple AI implementations
4. **Performance Demos** (`/app/performance/`) - React optimization examples

### AWS Amplify Integration
- Backend configured via Amplify Studio
- CloudFormation templates present
- DataStore, UI React, and Geo services integrated
- CLI tools available via `@aws-amplify/cli`

## Code Style Guidelines
- TypeScript with strict type checking
- Use React functional components with hooks
- Memoize components and callbacks when appropriate
- Follow ESLint rules (extends Next.js core web vitals)
- Import order: React/Next.js, external libraries, internal modules
- Use proper TypeScript types for all variables, parameters, and return values
- Name React components with PascalCase, variables/functions with camelCase
- Leverage React.memo and useCallback for performance optimization
- Organize components in feature folders under /components
- Custom hooks should be in /hooks directory and named with "use" prefix
- Use client directive for client components in Next.js app router