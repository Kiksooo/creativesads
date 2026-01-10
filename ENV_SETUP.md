# Environment Variables Setup

This document describes the required and optional environment variables for the Creo App.

## Required Variables

### JWT_SECRET
- **Required**: Yes (for production)
- **Description**: Secret key for JWT token signing
- **Example**: `JWT_SECRET=your-very-secure-random-string-here`
- **Development**: Defaults to `dev-secret-change-in-production`
- **Production**: Use a strong random string (at least 32 characters)

### JWT_EXPIRES_IN
- **Required**: No
- **Description**: JWT token expiration time
- **Default**: `7d` (7 days)
- **Example**: `JWT_EXPIRES_IN=7d` or `JWT_EXPIRES_IN=24h`

## Optional Variables

### Supabase Configuration

If you want to use Supabase for database and storage:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note**: If these are not set, the app will use an in-memory database (data is lost on restart).

**How to get Supabase credentials:**
1. Create a project at https://supabase.com
2. Go to Project Settings → API
3. Copy the Project URL as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `service_role` key as `SUPABASE_SERVICE_ROLE_KEY`

**Database Schema:**
Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Creatives table
CREATE TABLE IF NOT EXISTS creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('image', 'video')),
  filename VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  platform VARCHAR(50),
  vertical VARCHAR(50),
  country VARCHAR(10),
  language VARCHAR(10),
  goal VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'done', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creatives_user_id ON creatives(user_id);
CREATE INDEX IF NOT EXISTS idx_creatives_status ON creatives(status);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  hook_score INTEGER NOT NULL CHECK (hook_score >= 0 AND hook_score <= 100),
  clarity_score INTEGER NOT NULL CHECK (clarity_score >= 0 AND clarity_score <= 100),
  compliance_risk INTEGER NOT NULL CHECK (compliance_risk >= 0 AND compliance_risk <= 100),
  strengths TEXT[] DEFAULT '{}',
  issues TEXT[] DEFAULT '{}',
  fixes TEXT[] DEFAULT '{}',
  hooks TEXT[] DEFAULT '{}',
  ctas TEXT[] DEFAULT '{}',
  script_15s TEXT,
  summary TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analysis_creative_id ON analysis_results(creative_id);

-- User usage tracking (for daily limits)
CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  analysis_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_user_usage_user_date ON user_usage(user_id, date);

-- Storage bucket for creatives
-- Run this in Supabase dashboard → Storage → Create bucket
-- Bucket name: 'creatives'
-- Public: No (we'll use signed URLs or service role)
```

### AI Analysis Configuration

For real AI analysis (OpenAI Vision API):

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

**Note**: If not set, the app will use fallback analysis based on metadata and filename.

**How to get OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it as `OPENAI_API_KEY`

Alternatively, you can use Anthropic:

```env
ANTHROPIC_API_KEY=your-anthropic-api-key
```

**Note**: Anthropic support is not fully implemented in MVP.

### Legacy API Configuration

If you have a separate backend API service:

```env
API_INTERNAL_BASE_URL=http://localhost:3001
```

**Note**: This is only used for legacy proxy routes. New routes should use direct Next.js route handlers.

## Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your values

3. For development without external services, you can leave most variables empty:
   - The app will use in-memory database
   - The app will use fallback AI analysis

## Production Setup (Vercel)

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add all required variables
4. Set `NODE_ENV=production`
5. Deploy

**Important**: Never commit `.env.local` or `.env` files to git. They are in `.gitignore`.

## Verification

After setting up environment variables, verify:
1. Check `/api/health` endpoint - should return `{"status":"ok"}`
2. Try registering a new user - should work even without Supabase (uses in-memory)
3. Try uploading a creative - should work with in-memory storage
4. Try analyzing a creative - should work with fallback analysis if no AI keys

