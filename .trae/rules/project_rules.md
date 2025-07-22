Analyze the current project structure and database requirements.
Generate the corresponding SQL statements (CREATE TABLE, ALTER TABLE, INSERT, UPDATE, etc.) needed to implement the requested change.
Write all these SQL statements into a new file named with a timestamp and description, for example: `migrations/2025-07-22_add_tasks_table.sql`.
Make sure the SQL is compatible with PostgreSQL (Supabase).
Do not execute anything automatically; just generate the .sql file and explain how to run it on Supabase (using the SQL editor or Supabase CLI).
Always create new code files inside organized folders (e.g., `/components`, `/lib`, `/pages/api`) and explain where each file was placed.
Always add JSDoc comments or update a `README.md` whenever you create or modify any function or endpoint, explaining how to use it.
Always generate a basic test (using Jest or Vitest) in the `/tests` folder whenever you create a new endpoint or critical function to ensure it works correctly.
Always use environment variables (in `.env.local`) for sensitive keys or URLs instead of hardcoding them in the code, and explain where to configure them in Vercel or another production environment.
Always create or update a `lib/supabaseClient.js` file whenever you create a function that interacts with Supabase, to centralize the connection logic and avoid repetition.
Always add clear debug logs and perform basic security checks (authentication and input sanitization) whenever you create endpoints or functions.