# Duri Frontend Working Agreement

## Project overview

This repository is a mobile-first frontend prototype for "두리",
a collaborative travel-planning service.

The core user flow is:

1. Create or enter a trip room
2. Explore travel places
3. Save places or add them to a trip candidate board
4. Arrange candidates into an itinerary
5. Review and apply Duri's coordination suggestions

## Current stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS
- Lucide React
- npm

## Working rules

- Preserve the existing UI, copy, spacing, colors, and mobile visual style
  unless the task explicitly requests a redesign.
- Reuse existing components before creating replacements.
- Do not rewrite working screens from scratch.
- Do not upgrade React, Vite, TypeScript, or Tailwind without explicit approval.
- Do not add backend integration, authentication, Zustand, or API calls
  unless the task explicitly includes them.
- Avoid broad file renames and unrelated refactoring.
- Keep TypeScript strict and do not introduce `any` without a clear reason.
- Run `npm run build` after every implementation task.
- Report all added, modified, and deleted files after completing a task.
- Clearly identify temporary routes, placeholder pages, and mock behavior.

## Definition of done

A task is complete only when:

- Existing screens still render correctly
- The requested interaction works
- Browser console errors are not introduced
- TypeScript compilation succeeds
- `npm run build` succeeds
- The final response explains what changed and how to test it