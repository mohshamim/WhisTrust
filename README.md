# WhisTrust - Secure Anonymous Reporting Platform

A modern, secure whistleblowing and ethics reporting platform built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

## 🌟 Features

### Public Portal (Anonymous Reporters)

- **Submit Anonymous Reports**: Secure, encrypted report submission
- **Multi-category Support**: Fraud, harassment, safety violations, and more
- **Optional Identity Disclosure**: Reporters can choose to provide contact info
- **File Attachments**: Upload supporting documents securely
- **Tracking System**: Unique tracking codes for monitoring case status
- **Message Thread**: Anonymous communication with compliance team

### Admin Dashboard (Compliance Managers)

- **Real-time Dashboard**: View statistics and recent cases
- **Case Management**: View, assign, and update report statuses
- **Secure Authentication**: Role-based access control
- **Message Management**: Respond to reporter inquiries
- **Analytics**: Track pending, in-progress, and resolved cases

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
   - Or run the quick setup below:

4. **Configure environment variables**

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

5. **Run database migrations**

   - Open Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/schema.sql`
   - Paste and execute in the SQL Editor

6. **Start development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
whistle-blwoing/
├── app/                      # Next.js 16 App Router
│   ├── page.tsx             # Landing page
│   ├── report/              # Report submission
│   ├── success/             # Submission confirmation
│   ├── track/               # Case tracking
│   ├── admin/               # Admin portal
│   │   ├── login/          # Admin authentication
│   │   ├── dashboard/      # Admin dashboard
│   │   └── settings/       # Admin settings
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── admin-sidebar.tsx   # Admin navigation
│   └── ...
├── lib/                     # Utilities & services
│   ├── supabase/           # Supabase clients
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client
│   ├── services/           # Data access layer
│   │   ├── reports.ts      # Report operations
│   │   ├── messages.ts     # Message operations
│   │   └── auth.ts         # Authentication
│   └── types/              # TypeScript types
│       └── database.ts     # Database schema types
├── supabase/
│   └── schema.sql          # Database schema & RLS policies
└── public/                  # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Hooks
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)

## 🔒 Security Features

- **Row-Level Security (RLS)**: Database-level access control
- **Anonymous Access**: Reporters protected by tracking codes
- **Secure File Storage**: Private Supabase storage buckets
- **Role-Based Access**: Admin authentication with role management
- **Data Encryption**: End-to-end encrypted reports
- **Audit Trail**: Automatic timestamp tracking

## 🗄️ Database Schema

### Tables

- **reports**: Stores submitted reports with tracking codes
- **messages**: Messages between reporters and admins
- **admin_profiles**: Admin user profiles and roles
- **report_attachments**: Metadata for uploaded files

### Key Features

- Unique tracking code generation
- Automatic timestamp management
- Foreign key constraints
- Indexed for performance
- Cascade deletes for data integrity

## 🔄 Data Flow

### Anonymous Report Submission

1. User fills form on `/report`
2. Data sent to Supabase via `submitReport()` service
3. Tracking code generated and stored
4. User redirected to `/success` with tracking code

### Case Tracking

1. User enters tracking code on `/track`
2. Query Supabase for report and messages
3. Display case status and message thread
4. Support anonymous messaging

### Admin Operations

1. Admin logs in at `/admin/login`
2. Session managed by Supabase Auth
3. Access protected admin routes
4. View/manage all reports from dashboard

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
- [Database Schema](./supabase/schema.sql) - SQL schema with RLS policies
- [Environment Variables](./.env.local.example) - Configuration reference

## 🎨 Customization

### Theming

Colors and typography are defined in `app/globals.css`:

- Primary/secondary colors
- Font families
- Border radius
- Spacing system

### Components

All UI components in `components/ui/` are customizable:

- Based on shadcn/ui
- Fully typed with TypeScript
- Accessible by default
- Theme-aware (dark mode ready)

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Set these in your hosting provider:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 👥 Support

For issues or questions:

- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for setup help
- Review Supabase logs in the dashboard
- Check browser console for client-side errors

## 🎯 Roadmap

### Phase 2 (Future)

- [ ] Email notifications
- [ ] Advanced filtering and search
- [ ] Report analytics and insights
- [ ] Mobile app
- [ ] Multi-tenant support
- [ ] Advanced attachment security
- [ ] Automated case routing
- [ ] Export reports functionality

### Phase 3 (Future)

- [ ] Self-hosted deployment option
- [ ] Regional database mirroring
- [ ] Enhanced security features
- [ ] Compliance certifications (SOC 2, GDPR)
- [ ] Advanced reporting
- [ ] Integration APIs

---

**Built with ❤️ for secure and ethical reporting**
