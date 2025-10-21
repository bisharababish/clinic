# Environment Configuration Template

## Frontend Environment (.env in frontend/)
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Backend Environment (.env in backend/)
```bash
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

## Instructions
1. Copy the respective environment variables to `.env` files in frontend/ and backend/ folders
2. Replace the placeholder values with your actual Supabase credentials
3. Never commit `.env` files to version control






