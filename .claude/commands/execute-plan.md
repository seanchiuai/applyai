---
description: Test the entire user-flow and all functionalities for bugs and issues.
argument-hint: [plan(s) you want to execute.md]
---

# Command: Execute Plan

Execute the mentioned plan. If no plans are mentioned, STOP and ask the user for a plan to execute

Context:
- Read PRD.json for full product requirements
- Read relevant docs/ files referenced in CLAUDE.md
- This is a Next.js 15 + Convex + Clerk project (template already set up)

Instructions:
1. Read the plan thoroughly before starting
2. Create a todo list to track all implementation steps
3. Build UI components first, then backend functions
4. Follow patterns in docs/component-patterns.md and docs/convex-patterns.md
5. Test each feature before moving to next
6. Update plan status to "In Progress" then "Completed" when done
7. Update docs/CHANGELOG.md with what was implemented
8. Commit after completing each major section
