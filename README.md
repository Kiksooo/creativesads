# Creo App - Frontend (Next.js)

Modern Next.js application for creative analytics.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS**
- **React 19**

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file (copy from `.env.example`):

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
API_INTERNAL_BASE_URL=http://localhost:3001/api/v1
```

4. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Development

Create `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
API_INTERNAL_BASE_URL=http://localhost:3001/api/v1
```

### Production

Set these in your hosting provider (Vercel, etc.):

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
API_INTERNAL_BASE_URL=https://api.yourdomain.com/api/v1
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run clean` - Remove `.next` directory
- `npm run lint` - Run ESLint

## Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Localized routes (ru, en, es)
│   ├── api/               # API proxy routes
│   └── ...
├── src/
│   ├── components/        # React components
│   ├── lib/              # Utilities and helpers
│   └── ...
└── public/               # Static files
```

## API Integration

All API requests go through the proxy route at `/api/v1/[...path]`, which forwards to the backend API service.

The proxy ensures:
- All responses are JSON (converts HTML errors to JSON)
- Authentication tokens are passed through
- CORS is handled

## Deployment

### Vercel (Recommended for Web)

1. Connect your GitHub repository to Vercel
2. **Important**: Set root directory to `web`
3. Add environment variables:
   - `NEXT_PUBLIC_SITE_URL` = `https://app.YOURDOMAIN.com`
   - `API_INTERNAL_BASE_URL` = `https://api.YOURDOMAIN.com/api/v1`
4. Configure custom domain: `app.YOURDOMAIN.com`
5. Deploy

**Vercel Configuration:**

- Framework Preset: Next.js
- Root Directory: `web` ⚠️ **CRITICAL**
- Build Command: `npm run build`
- Output Directory: `.next`

### Render (For API)

1. Create Web Service in Render Dashboard
2. Connect GitHub repository
3. Set Root Directory: `services/api`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `(generate strong secret)`
   - `JWT_EXPIRES_IN` = `7d`
   - `DATABASE_URL` = `(PostgreSQL connection string)`
   - `FRONTEND_URL` = `https://app.YOURDOMAIN.com`
7. Configure custom domain: `api.YOURDOMAIN.com`

See [DEPLOY.md](../DEPLOY.md) for detailed step-by-step instructions.

### Other Platforms

Build the project:

```bash
npm run clean
npm run build
npm run start
```

## Local Development with API

1. Start the API service (see `../services/api/README.md`)
2. Start this Next.js app: `npm run dev`
3. Both should run:
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

## Features

- Multi-language support (ru, en, es)
- Authentication (register/login)
- Creative library and upload
- Responsive design
- SEO optimized (robots.txt, sitemap.xml)

## Troubleshooting

### Build Errors

```bash
npm run clean
npm run build
```

### API Connection Issues

- Check `API_INTERNAL_BASE_URL` in `.env.local`
- Ensure API service is running
- Check network tab for CORS errors

### Hydration Errors

- Ensure all IDs use `React.useId()` in client components
- Check for server/client mismatches in logs
