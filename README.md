# Local Connect (Brand: LocalServices)

A full-stack, responsive local services marketplace built with React, TypeScript, Express, and Tailwind CSS. Directly recreates the high-contrast black-and-white visual identity, two-column authentication screens, and specialized dark-sidebar dashboards from the design specifications.

---

## Features

- **Public Website**:
  - **Homepage (`/`)**: Hero section with search & location inputs, trust badges ("Trusted Professionals", "Easy Booking", "Secure & Reliable"), doorstep service card, and popular category grids (Plumbing, Electrical, Cleaning, Carpentry, Appliance Repair, Beauty Services).
  - **Services Catalog (`/services`)**: Live multi-facet search, category tabs, location filtering, price range filters, rating filters, sorting by rating/price, pagination, and direct booking triggers.
  - **Service Details (`/services/:id`)**: Rich photography, verified provider credentials, duration, price snapshot, included service checklist, and genuine verified customer reviews.
  - **About Page (`/about`)**: Dark hero header with custom photographic masking, plus 3 core cards: *Our Vision*, *Our Mission*, and *Why Choose Us?*.
  - **Contact Page (`/contact`)**: Contact details, hub location map box, and interactive message inquiry form dispatching to platform administrators.

- **Authentication System**:
  - **Two-Column Split Screens**:
    - **Login (`/login`)**: Left dark architectural house illustration panel with service badge nodes, right login form with password visibility toggle, quick 1-click demo logins, and social auth mockups.
    - **Register (`/register`)**: Left dark panel, right role selection tabs (`Customer`, `Service Provider`, `Admin`), validation, and automatic profile creation.
    - **Password Reset (`/forgot-password`)**: Single-use demo token verification and password update flow.

- **Role-Based Dashboards**:
  - **Customer Dashboard (`/customer/dashboard`)**:
    - Top stats: Total Bookings (5), Ongoing Bookings (2), Completed Bookings (3), Pending Requests (1).
    - Recommended services grid with instant booking modal.
    - Recent bookings list with status badges (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
    - 5-Star review submission for completed bookings.
  - **Service Provider Dashboard (`/provider/dashboard`)**:
    - Top stats: Total Bookings (12), Pending Requests (4), Completed (8), Earnings (₹12,500).
    - Upcoming bookings management table (`Accept`, `Reject`, `Mark Completed`).
    - Service Performance weekly activity chart & monthly earnings widget.
    - Manage Services: Publish new services, toggle active/disabled states, delete listings.
    - Working hours & availability configuration.
  - **Admin Dashboard (`/admin/dashboard`)**:
    - Top stats: Total Users (120), Service Providers (45), Total Services (28), Total Bookings (186).
    - Recent users management with instant `Activate` / `Suspend` toggles and audit logging.
    - Service provider verification approval and rejection pipeline.
    - Permitted regulatory CSV report exports (`Bookings Activity Report`, `User Directory Export`).

---

## Seed Demo Credentials

| Role | Email | Password | Included Seed Data |
| :--- | :--- | :--- | :--- |
| **Customer** | `john@example.com` | `password123` | Active bookings (AC Repair, Home Cleaning), completed plumbing job |
| **Provider** | `rahul@provider.com` | `password123` | Singh Rapid Repairs & Electricals, ₹12,500 earnings, 4 customer appointments |
| **Admin** | `admin@localservices.com` | `admin123` | Platform oversight, user suspension controls, CSV export tools |

*Note: You can also switch roles on the fly using the "Demo Role" dropdown in the top navigation bar or inside any dashboard profile menu.*

---

## Code Architecture

```
├── data/
│   └── db.json               # Persistent JSON database with realistic initial seed
├── server/
│   ├── db.ts                 # Typed database schema and atomic CRUD engine
│   ├── middleware/
│   │   └── auth.ts           # Bearer token parsing & Role-Based Access Control (RBAC)
│   └── routes/
│       ├── auth.ts           # Login, registration, token generation, role switching
│       ├── services.ts       # Services search, filter, pagination & CRUD
│       ├── categories.ts     # Category listing and management
│       ├── bookings.ts       # Booking engine, double-booking prevention, status lifecycle
│       ├── providers.ts      # Provider profiles, availability, bio & rates
│       ├── reviews.ts        # Verified review posting & dynamic rating recalculation
│       ├── contact.ts        # Contact inquiry dispatch
│       ├── admin.ts          # Admin metrics, user moderation & CSV exports
│       └── notifications.ts  # In-app notifications
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── BrandLogo.tsx          # LocalServices wordmark & icon
│   │       ├── Navbar.tsx             # 3-Zone Top Bar Contract with quick role switcher
│   │       ├── Footer.tsx             # Neutral footer with links and support info
│   │       ├── DashboardLayout.tsx    # Dark left sidebar shell
│   │       ├── HouseIllustration.tsx  # Architectural line art with floating service badges
│   │       ├── StatusBadge.tsx        # Confirmed, Pending, Completed, Cancelled badges
│   │       ├── BookingModal.tsx       # Date & slot reservation modal
│   │       └── ReviewModal.tsx        # 5-Star rating & review feedback modal
│   ├── context/
│   │   └── AuthContext.tsx   # React auth context & notification sync
│   ├── pages/
│   │   ├── HomePage.tsx               # Public homepage matching reference design
│   │   ├── ServicesPage.tsx           # Service catalog & filters
│   │   ├── ServiceDetailsPage.tsx     # Provider details, reviews, book now
│   │   ├── AboutPage.tsx              # About Us with 3 feature cards
│   │   ├── ContactPage.tsx            # Contact details, map hub, message form
│   │   ├── LoginPage.tsx              # 2-Column login screen
│   │   ├── RegisterPage.tsx           # 2-Column register screen with role tabs
│   │   ├── ForgotPasswordPage.tsx     # Password reset flow
│   │   ├── CustomerDashboard.tsx      # Customer bookings & recommendations
│   │   ├── ProviderDashboard.tsx      # Provider bookings, earnings & services
│   │   └── AdminDashboard.tsx         # Admin metrics, user status & CSV reports
│   ├── services/
│   │   └── api.ts            # Typed client API service
│   ├── types/
│   │   └── index.ts          # Shared TypeScript interfaces
│   ├── App.tsx               # Route definitions & protected route guards
│   ├── index.css             # Tailwind CSS & custom scrollbar
│   └── main.tsx              # React DOM entry point
├── server.ts                 # Full-stack Node.js Express server + Vite middlewares
├── metadata.json             # AI Studio applet metadata
├── package.json
└── tsconfig.json
```

---

## Local Development & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run local full-stack server**:
   ```bash
   npm run dev
   ```
   The development server starts on `http://localhost:3000` with Express backend API routes at `/api/v1/*` and Vite frontend mounting concurrently.

3. **Verify type checks**:
   ```bash
   npm run lint
   ```

4. **Production build**:
   ```bash
   npm run build
   npm run start
   ```

---

## Deployment Instructions

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: complete Local Connect full-stack services marketplace"
git branch -M main
git remote add origin https://github.com/<your-username>/local-connect.git
git push -u origin main
```

### 2. Deploy Backend to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.ts`
4. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `JWT_SECRET=<your_production_secret>`

### 3. Deploy Frontend to Vercel (or Render Full-Stack)
- When deploying as a unified full-stack application on Render or Cloud Run, the Express server in `server.ts` automatically serves `/dist` static assets and API routes on the single origin.
- If deploying frontend separately on Vercel:
  - Framework Preset: **Vite**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable: `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api/v1`

---

## Security & Concurrency Checklist

- [x] **No Client-Price Tampering**: Agreed price is snapshotted directly from database service price on the server, not from client request payloads.
- [x] **Double-Booking Prevention**: Backend verifies that the provider does not already have a confirmed or pending booking on the same date and time slot.
- [x] **Ownership Enforcement**: Customers can only view/cancel their own bookings; Providers can only accept/reject/complete bookings assigned to their provider account.
- [x] **Verified Reviews Only**: Reviews can only be submitted by the customer who completed that specific booking, with a strict 1-review-per-booking guard.
- [x] **Role Authorization (RBAC)**: Admin endpoints enforce administrative permissions on the server before mutating users or exporting audit logs.
