# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Development: `npm run dev` (port 3006)
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npx vitest run`
- Single test: `npx vitest run path/to/test.spec.ts`

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