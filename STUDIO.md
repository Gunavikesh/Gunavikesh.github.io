# Portfolio Studio

Open https://gunavikesh.github.io/admin/ after GitHub Pages deploys.

1. Create a fine-grained personal access token at https://github.com/settings/personal-access-tokens/new. Select only Gunavikesh.github.io, grant repository Contents read/write, and choose a short expiration. Do not grant other permissions.
2. Enter the token directly in the Studio, never in chat, source code, or a public file. It is held in React memory only, not persisted in browser storage. The dashboard loads React from esm.sh; as with any third-party script, this introduces supply-chain trust. Use only a narrowly scoped token and clear/revoke it after use.
3. Edit the profile, experience, projects, skills, and links. Preview changes locally and publish when ready. GitHub validates the token and repository permission; the admin page itself is publicly reachable, not a private login page.
4. Publishing updates data/portfolio.json with optimistic concurrency via GitHub's Contents API. GitHub Pages deploys the changes; the public website checks for fresh data every 60 seconds. Deployment is not instantaneous.

The Python FastAPI backend remains separate and is not hosted by GitHub Pages. The public site reads JSON, so no backend service or database subscription is required. Do not enter confidential information into portfolio fields: all published content is public. The Studio has not been browser-tested yet.
