# 🚀 New Components Usage Guide

This document explains how to use all the new enterprise-grade components added to your Bethlehem Medical Center project.

## 📋 Table of Contents

1. [Testing Infrastructure](#testing-infrastructure)
2. [Performance Optimizations](#performance-optimizations)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [API Documentation](#api-documentation)

---

## 🧪 Testing Infrastructure

### Unit Testing with Vitest

**Location:** `src/test/`

#### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

#### Writing Tests
```typescript
// src/test/components/YourComponent.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils/test-utils';
import YourComponent from '../../components/YourComponent';

// Mock external dependencies
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', role: 'admin' },
    isLoading: false,
  }),
}));

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<YourComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

#### Test Utilities
```typescript
// Use custom render with all providers
import { render, screen } from '../utils/test-utils';

// Automatically includes:
// - React Query Provider
// - Router Provider  
// - Auth Provider
// - Admin State Provider
```

### E2E Testing with Cypress

**Location:** `cypress/`

#### Running E2E Tests
```bash
# Run E2E tests headlessly
npm run test:e2e

# Open Cypress UI
npm run test:e2e:open
```

#### Writing E2E Tests
```typescript
// cypress/e2e/appointment-booking.cy.ts
describe('Appointment Booking Flow', () => {
  beforeEach(() => {
    cy.loginAs('patient');
  });

  it('should book an appointment successfully', () => {
    cy.visit('/clinics');
    cy.get('[data-testid="clinic-card"]').first().click();
    cy.get('[data-testid="time-slot"]').first().click();
    cy.get('[data-testid="book-button"]').click();
    cy.url().should('include', '/payment');
  });
});
```

#### Custom Commands
```typescript
// Available custom commands:
cy.loginAs('admin');     // Login as specific role
cy.loginAs('patient');   
cy.loginAs('doctor');
cy.logout();             // Logout user
```

---

## ⚡ Performance Optimizations

### Image Optimization

**Location:** `src/lib/imageOptimization.ts`

#### Using Image Optimization
```typescript
import { optimizeImage, getOptimizedImageUrl } from '../lib/imageOptimization';

// Optimize image URL
const optimizedUrl = optimizeImage('/path/to/image.jpg', {
  width: 300,
  height: 200,
  quality: 80,
  format: 'webp'
});

// Simple optimization
const url = getOptimizedImageUrl('/path/to/image.jpg', 300, 200);
```

#### In Components
```typescript
// For local images
const imageUrl = getOptimizedImageUrl('/images/doctor.jpg', 200, 200);

<img 
  src={imageUrl} 
  alt="Doctor" 
  width={200} 
  height={200}
/>
```

### Caching

**Location:** `src/lib/cache.ts`

#### In-Memory Cache
```typescript
import { cache } from '../lib/cache';

// Store data
cache.set('patients', patientData, 5 * 60 * 1000); // 5 minutes

// Retrieve data
const cachedPatients = cache.get('patients');
if (cachedPatients) {
  return cachedPatients; // Use cached data
}

// Fetch fresh data
const freshData = await fetchPatients();
cache.set('patients', freshData);
return freshData;
```

#### Local Storage Cache
```typescript
import { localStorageCache } from '../lib/cache';

// Store user preferences
localStorageCache.set('user-preferences', {
  theme: 'dark',
  language: 'ar'
});

// Retrieve preferences
const preferences = localStorageCache.get('user-preferences');
```

#### React Query Configuration
```typescript
import { queryClientConfig } from '../lib/cache';

// Use in your QueryClient setup
const queryClient = new QueryClient(queryClientConfig);
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions

**Location:** `.github/workflows/ci.yml`

#### What It Does
- ✅ Runs tests on Node 18.x and 20.x
- ✅ Linting and type checking
- ✅ Unit test coverage
- ✅ E2E tests
- ✅ Security scanning
- ✅ Automated deployment (when ready)

#### Manual Triggers
```bash
# Trigger workflow manually
git push origin main

# Or create a pull request
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub
```

#### Environment Variables for CI
Add these in GitHub repository settings:
```bash
# Required for deployment
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
FRONTEND_URL=https://yourdomain.com
```

---

## 📚 API Documentation

### Using the API

**Location:** `API_DOCUMENTATION.md`

#### Available Endpoints
```bash
# Health check
GET /health

# Delete user (Admin only)
POST /api/admin/delete-user
Headers: Authorization: Bearer <token>
Body: { "authUserId": "string" }
```

#### Error Responses
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

#### Rate Limits
- Basic CORS protection enabled
- Standard Express.js error handling

---

## 🛠️ Development Commands

### Available Scripts
```bash
# Development
npm run dev              # Start frontend dev server
cd src/backend && npm run dev  # Start backend dev server

# Testing
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run test:e2e        # Run E2E tests
npm run test:e2e:open   # Open Cypress UI

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks

# Building
npm run build           # Build for production
npm run preview         # Preview production build
```

### Backend Scripts
```bash
cd src/backend

npm run dev             # Start development server
npm run build           # Build TypeScript
npm run start           # Start production server
npm run prod            # Build and start production
```

---

## 🔧 Configuration Files

### Environment Variables
```bash
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
FRONTEND_URL=https://yourdomain.com
PORT=5000
NODE_ENV=production
```

### Test Configuration
- `vitest.config.ts` - Vitest configuration
- `cypress.config.ts` - Cypress configuration
- `src/test/setup.ts` - Test setup and mocks

---

## 🚨 Troubleshooting

### Common Issues

#### Tests Not Running
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Cypress Issues
```bash
# Clear Cypress cache
npx cypress cache clear
```

#### Backend Not Starting
```bash
# Check if port is available
netstat -an | grep :5000

# Install backend dependencies
cd src/backend
npm install
```

#### Linting Errors
```bash
# Fix auto-fixable issues
npm run lint -- --fix

# Check specific file
npx eslint src/components/YourComponent.tsx
```

---

## 📞 Support

### Getting Help
1. Check the logs in browser console
2. Check backend logs in terminal
3. Review test failures for debugging

### Useful Resources
- [Vitest Documentation](https://vitest.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Express.js Documentation](https://expressjs.com/)

---

## 🎯 Next Steps

1. **Install Dependencies**: `npm install && cd src/backend && npm install`
2. **Run Tests**: `npm run test`
3. **Start Development**: `npm run dev`
4. **Deploy**: Follow deployment guide when ready

Your healthcare application is now enterprise-ready! 🏥✨
