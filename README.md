# WhisTrust - Enterprise Multi-Tenant Whistleblowing Platform

A modern, secure, multi-tenant whistleblowing and ethics reporting platform built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

## 🌟 Features

### Multi-Tenant Architecture

- **Organization Isolation**: Complete data separation per organization
- **Custom Subdomains**: Each organization gets unique subdomain (e.g., `/org/codesquare`)
- **Super Admin Portal**: Platform-wide management and oversight
- **Scalable Infrastructure**: Supports unlimited organizations

### Public Portal (Anonymous Reporters)

- **Anonymous Reporting**: Secure, encrypted report submission with no IP logging
- **Multi-Category Support**: Ethics violations, fraud, harassment, safety concerns, and more
- **Optional Identity Disclosure**: Reporters can choose to remain anonymous or provide contact info
- **Secure File Uploads**: Upload documents, images, and evidence
- **Real-Time Tracking**: Unique tracking codes for monitoring case status
- **Two-Way Messaging**: Anonymous communication with compliance team
- **Status Updates**: Track progress from submission to resolution

### Organization Admin Dashboard

- **Role-Based Access Control**: Admin, Manager, and Investigator roles
- **Real-Time Dashboard**: Live metrics, pending cases, and performance indicators
- **Case Management**: Assign, prioritize, and track all reports
- **User Management**: Invite team members with granular permissions
- **Analytics & Reporting**: Visualize trends, response times, and resolution rates
- **Audit Logs**: Complete activity tracking for compliance
- **Profile Customization**: 12 professional avatar styles
- **Documentation Center**: Built-in help center and user guides
- **Settings Management**: Organization preferences and notifications

### Super Admin Portal

- **Organization Management**: Create, edit, and manage client organizations
- **Platform Overview**: System-wide metrics and health monitoring
- **User Oversight**: View all users across all organizations
- **Subscription Management**: Track usage limits and billing

### Security & Compliance

- **End-to-End Encryption**: All data encrypted in transit and at rest
- **Row-Level Security (RLS)**: Database-level access controls
- **Anonymous Protection**: No IP logging or tracking
- **Audit Trail**: Complete activity logs for compliance
- **Role-Based Permissions**: Granular access control
- **Session Management**: Automatic timeouts and secure authentication
- **GDPR & SOX Ready**: Compliance-focused architecture

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account ([sign up here](https://supabase.com))

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd whistle-blwoing
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

   - Follow the comprehensive guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Run database migrations from `supabase/migrations/`

4. **Configure environment variables**

```bash
cp ENV_TEMPLATE.txt .env.local
# Edit .env.local with your Supabase credentials:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
```

5. **Run database migrations**

   - Open Supabase Dashboard → SQL Editor
   - Run migrations in order from `supabase/migrations/`
   - Or use Supabase CLI: `supabase db push`

6. **Start development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Access Points

- **Super Admin**: `http://localhost:3000/superadmin/login`
- **Organization Portal**: `http://localhost:3000/org/[subdomain]/login`
- **Anonymous Report**: `http://localhost:3000/org/[subdomain]/report`
- **Track Report**: `http://localhost:3000/org/[subdomain]/track`

## 📁 Project Structure

```
whistrust/
├── app/
│   ├── org/[subdomain]/           # Multi-tenant organization portals
│   │   ├── report/                # Anonymous report submission
│   │   ├── track/                 # Case tracking with messaging
│   │   ├── login/                 # Organization admin login
│   │   ├── dashboard/             # Admin dashboard with metrics
│   │   ├── reports/               # Case management & assignment
│   │   ├── analytics/             # Analytics & insights
│   │   ├── users/                 # Team management
│   │   ├── settings/              # Organization settings & avatars
│   │   ├── audit-logs/            # Activity audit trail
│   │   └── documentation/         # Help center
│   ├── superadmin/                # Platform admin portal
│   │   ├── login/                 # Super admin login
│   │   ├── dashboard/             # Platform dashboard
│   │   └── organizations/         # Organization management
│   └── page.tsx                   # Landing page
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── client-sidebar.tsx         # Organization navigation
│   └── ...
├── lib/
│   ├── supabase/                  # Supabase clients
│   │   ├── client.ts              # Browser client
│   │   └── server.ts              # Server client
│   ├── services/                  # Data access layer
│   │   ├── reports.ts             # Report operations
│   │   ├── messages.ts            # Message operations
│   │   ├── client-auth.ts         # Multi-tenant auth
│   │   ├── avatar.ts              # Avatar management
│   │   └── audit-logs.ts          # Audit logging
│   └── types/
│       └── database.ts            # Database schema types
├── supabase/
│   └── migrations/                # Database migrations
├── public/
│   └── avatar/                    # Professional avatar images
└── hooks/                         # Custom React hooks
    └── use-realtime-messages.ts   # Real-time subscriptions
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management**: React Hooks
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner (Toast notifications)
- **Date Handling**: date-fns

## 🔒 Security Features

- **Row-Level Security (RLS)**: Database-level access control with organization isolation
- **Anonymous Access**: Reporters protected by tracking codes, no IP logging
- **Secure File Storage**: Private Supabase storage buckets with access controls
- **Role-Based Access**: Multi-level permissions (Super Admin, Admin, Manager, Investigator)
- **Data Encryption**: End-to-end encrypted reports and messages
- **Audit Trail**: Complete activity logging with user tracking
- **Session Security**: Automatic timeouts and secure cookie handling
- **SQL Injection Protection**: Parameterized queries throughout

## 🗄️ Database Schema

### Core Tables

- **organizations**: Multi-tenant organization data
- **admin_profiles**: User profiles with roles and avatar preferences
- **reports**: Submitted reports with tracking codes
- **messages**: Two-way communication threads
- **report_attachments**: Secure file metadata
- **audit_logs**: Complete activity audit trail

### Key Features

- Multi-tenant data isolation with organization_id
- Unique tracking code generation per report
- Automatic timestamp management
- Foreign key constraints with cascade deletes
- Indexed for performance
- Row-Level Security (RLS) policies on all tables

## 🔄 Data Flow

### Anonymous Report Submission

1. User visits `/org/[subdomain]/report`
2. Submits report via `submitReport()` service
3. Tracking code generated and stored
4. File uploads handled securely
5. User receives tracking code for future reference

### Case Tracking

1. User enters tracking code at `/org/[subdomain]/track`
2. Fetch report status and message history
3. Real-time updates via Supabase subscriptions
4. Two-way anonymous messaging supported

### Admin Operations

1. Admin logs in at `/org/[subdomain]/login`
2. Session managed by Supabase Auth with RLS
3. Access organization-specific dashboard
4. Manage cases, assign to team members
5. Track analytics and audit logs

### Super Admin Operations

1. Platform admin logs in at `/superadmin/login`
2. Global access to all organizations
3. Create and manage client organizations
4. Monitor platform-wide metrics

## 📦 Migration-Friendly Architecture

This project is designed for easy backend migration:

### To Migrate to Different Backend:

1. **Keep Service Layer** (`/lib/services/`)
   - Update internal database calls
   - Maintain same function signatures
   - Preserve TypeScript interfaces

2. **Update Client** (`/lib/supabase/client.ts`)
   - Replace Supabase client
   - Implement same interface
   - Handle authentication similarly

3. **Keep Types** (`/lib/types/database.ts`)
   - Database schema remains consistent
   - UI components unaffected
   - Business logic preserved

### Current Architecture Benefits:

- ✅ Centralized data access
- ✅ Clear separation of concerns
- ✅ Type-safe throughout
- ✅ Easy to test and mock
- ✅ Self-documenting code

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## 📚 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Complete setup instructions
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Admin Guide](./ADMIN_GUIDE.md) - Administrator documentation
- [Database Migrations](./supabase/migrations/) - SQL schema migrations
- [Environment Variables](./ENV_TEMPLATE.txt) - Configuration reference

## 🎨 Customization

### Theming

Colors and typography are defined in `app/globals.css`:

- Primary/secondary colors
- Font families
- Border radius
- Spacing system
- Dark mode support

### Components

All UI components in `components/ui/` are customizable:

- Based on shadcn/ui
- Fully typed with TypeScript
- Accessible by default (WCAG 2.1 compliant)
- Theme-aware with dark mode

### Avatar System

12 professional avatar styles available:
- Located in `public/avatar/`
- Easily customizable per user
- Managed via Settings page

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect Repository**
   - Import project to Vercel
   - Connect to GitHub repository

2. **Set Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Deploy**
   - Vercel will auto-deploy on push to main
   - Build time: ~2-3 minutes

4. **Configure Domain**
   - Add custom domain in Vercel settings
   - Update DNS records as instructed

### Other Platforms

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides for:
- AWS Amplify
- Netlify
- Self-hosted options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Support

For issues or questions:

- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for setup help
- Review [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for feature documentation
- Check Supabase logs in the dashboard
- Review browser console for client-side errors
- Check Vercel deployment logs for production issues

## 🎯 Roadmap

### ✅ Phase 1 - Complete

- [x] Multi-tenant architecture
- [x] Super Admin portal
- [x] Role-based access control (Admin, Manager, Investigator)
- [x] Analytics dashboard with charts
- [x] Audit logging system
- [x] Avatar customization (12 professional styles)
- [x] Documentation center with smooth navigation
- [x] Real-time messaging
- [x] Fixed header navigation across all pages

### 🚀 Phase 2 - In Progress

- [ ] Email notifications system
- [ ] Advanced search and filtering
- [ ] Custom report categories per organization
- [ ] White-label branding options
- [ ] Mobile responsive optimizations
- [ ] Bulk operations for case management

### 🔮 Phase 3 - Future

- [ ] Mobile native apps (iOS/Android)
- [ ] Advanced analytics with ML-powered insights
- [ ] Integration APIs (Slack, Teams, JIRA)
- [ ] Multi-language support (i18n)
- [ ] Advanced file scanning and virus detection
- [ ] Automated case routing with AI
- [ ] Compliance certifications (SOC 2, ISO 27001)
- [ ] Self-hosted deployment option
- [ ] Regional database mirroring

---

**Built with ❤️ for secure and ethical reporting**

**Production URL**: [https://www.whistrust.com](https://www.whistrust.com)
