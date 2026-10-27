# Local Admin Portal

The admin portal runs at [http://localhost:3002/admin](http://localhost:3002/admin).
Use the local test account **local_admin** with password **password**. These credentials are for the local fixture database.

Start the backend first in `../adamsoncr` using its README, then start this frontend:

```bash
npm start
```

The ignored `.env.development.local` should contain:

```dotenv
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3000
PORT=3002
HOST=127.0.0.1
BROWSER=none
```

Copy `.env.development.example` to `.env.development.local` to reproduce these settings. `npm start` uses development configuration and the local API by default. `npm run build` validates production configuration; it does not load `.env.development.local`. Production builds reject development/staging targets, HTTP API URLs, and loopback API addresses. `REACT_APP_API_URL` overrides the API URL for the selected environment.

Run the backend with `npm run start:development` in `../adamsoncr` for automatic reloads. Both local services listen on the loopback interface. Restart the frontend after changing environment values. The local backend uses the persistent Docker database `adamsoncr_local`; admin edits survive page reloads and service restarts. This configuration does not change hosted data.

Administration includes live totals, user creation and existing-role assignment, colleges, departments, application inspection, website content, and CSV reports. Create a college before its departments, then assign user affiliations. Edit a record and turn **Active** off to deactivate it. Colleges with active departments cannot be deactivated. Historical submissions retain their original affiliation text. Application approval decisions remain with assigned reviewers and directors. Audit records remain stored by the backend.

Content types include homepage, About CRD, FAQs, and announcements. Save with **Published on website** off for a draft; turn it on to publish. Content is plain text. Announcements appear on the dashboard. FAQs and About CRD navigation currently shows an under-development toast, controlled by `src/config/features.js`.

Run frontend checks with:

```bash
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

The backend README documents migration and local integration tests.

## Project monitoring

Researchers, CRD staff, and directors have a **Project monitoring** dashboard card at `/project-monitoring`. Completed approvals appear once, with the F-CRD-003 checklist and a shared progress bar. Researchers submit PDF, PNG, or JPEG files up to 20 MB; CRD staff and directors update dates, remarks, status, and conditional applicability. Submissions await review before contributing to completion. Earlier file versions and monitoring changes remain available.

Once every applicable requirement is complete, **Download monitoring PDF** exports the saved checklist and **Fill out clearance form** opens F-CRD-006. The researcher saves completion date, college/department, and faculty/student names, then downloads the populated PDF or prints the form. CRD staff and directors can view and print saved clearance details. A blank clearance form can also be printed before saving details, for completion on paper. Office checks, signatures, and dates remain blank for the responsible offices. New requirement submissions can reopen monitoring and lock document exports until review is complete again. Apply both backend monitoring migrations, including `20261029000000-monitoring-clearance.js`.

For local testing, use `.env.development.example` settings and the backend's `adamsoncr_local` database. Fixture usernames are `local_researcher`, `local_crd_staff`, and `local_crd_director`, with password `password`. Apply the backend monitoring migration first. The backend's `docs/project-monitoring.md` describes the APIs, progress calculation, and private file storage.

## Production release

Copy `.env.production.example` to the ignored `.env.production.local`, then set the deployed HTTPS API URL. These values are embedded in the browser bundle at build time. Never put passwords, database settings, JWT secrets, or other credentials in frontend environment files.

The committed lockfile fixes dependency versions. The repository's `.npmrc` retains legacy peer resolution because the existing `react-table-v6` package declares older React peers; use the same configuration for installation and CI.

```bash
npm ci
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

Deploy the resulting `build/` directory to your HTTPS static host. Source maps are disabled for production releases. Configure the host to serve `index.html` for application routes such as `/admin/users` and `/dashboard`, so direct navigation and reloads work. Missing files under `/static/` should return 404. Serve `index.html` with `Cache-Control: no-cache`; hashed files under `/static/` may use `Cache-Control: public, max-age=31536000, immutable`. Revalidate other public files. Do not use `npm start` as the production web server.

Set the backend's production `FRONTEND_URL` to the exact frontend HTTPS origin for CORS. Follow `../adamsoncr/docs/production-environment.md` for backend secrets, database TLS, reviewed migrations, persistent upload storage, and process management. Keep local fixture accounts and the `adamsoncr_local` database in development only. Frontend changes do not apply backend migrations or deploy either service.

Before release, verify login, admin authorization, application submissions, attachment access, CSV exports, and direct-route reloads against the deployed environment. FAQs and About CRD remain under development until their feature flag is deliberately changed. Production configuration and build checks do not replace a full security review of the backend and hosting environment.
