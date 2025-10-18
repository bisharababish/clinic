# Contributing to Bethlehem Medical Center

Thank you for your interest in contributing to the Bethlehem Medical Center application! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Supabase account (for development)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/bethlehem-medical-center.git
   cd bethlehem-medical-center
   ```

2. **Install Dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd src/backend
   npm install
   cd ../..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Add your Supabase credentials
   # VITE_SUPABASE_URL=your_supabase_url
   # VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   cd src/backend
   npm run dev
   ```

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical fixes
- `refactor/component-name` - Code refactoring

### Commit Messages
Follow conventional commits:
```
feat: add user authentication
fix: resolve login validation issue
docs: update API documentation
refactor: improve error handling
test: add unit tests for auth
```

## Testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Writing Tests
- Write tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test both success and error cases

## Pull Request Process

### Before Submitting
1. **Run Tests**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

2. **Update Documentation**
   - Update README if needed
   - Add/update API documentation
   - Update component documentation

3. **Test Manually**
   - Test the feature thoroughly
   - Verify no regressions
   - Check responsive design

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## Code Review Process

### Review Criteria
- Code quality and style
- Test coverage
- Performance impact
- Security considerations
- Documentation completeness

### Review Timeline
- Initial review within 48 hours
- Follow-up reviews within 24 hours
- Merge after approval from maintainers

## Architecture Guidelines

### Frontend Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── types/         # TypeScript type definitions
└── test/          # Test files
```

### Backend Structure
```
src/backend/
├── middleware/    # Express middleware
├── routes/        # API routes
├── utils/         # Utility functions
└── types/         # TypeScript types
```

### Component Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines
- Use TypeScript interfaces for props

### API Guidelines
- Use RESTful conventions
- Implement proper error handling
- Add input validation
- Include rate limiting
- Document all endpoints

## Security Guidelines

### Data Handling
- Never log sensitive data
- Use environment variables for secrets
- Implement proper input validation
- Follow OWASP guidelines

### Authentication
- Use Supabase Auth
- Implement proper session management
- Add role-based access control
- Validate permissions server-side

## Performance Guidelines

### Frontend Optimization
- Use React.memo for expensive components
- Implement code splitting
- Optimize images
- Use lazy loading

### Backend Optimization
- Implement caching strategies
- Use database indexes
- Optimize queries
- Monitor performance metrics

## Internationalization

### Adding Translations
1. Add keys to translation files
2. Use `useTranslation` hook
3. Support RTL languages
4. Test with different languages

### Translation Files
- `src/locales/en.json` - English
- `src/locales/ar.json` - Arabic

## Deployment

### Staging Environment
- All PRs deployed to staging
- Manual testing on staging
- Performance testing

### Production Deployment
- Merge to main branch
- Automated deployment
- Monitor for issues
- Rollback plan ready

## Reporting Issues

### Bug Reports
Use the bug report template:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs

### Feature Requests
Use the feature request template:
- Clear description
- Use case explanation
- Proposed solution
- Alternatives considered

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn
- Follow professional standards

### Getting Help
- Check existing issues first
- Use GitHub discussions
- Join community chat
- Ask specific questions

## Release Process

### Version Numbering
Follow semantic versioning:
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Tagged release
- [ ] Deployed to production

## License

This project is licensed under the MIT License. By contributing, you agree that your contributions will be licensed under the same license.

## Contact

- Project Maintainer: [Your Name]
- Email: [your-email@example.com]
- GitHub: [@yourusername]

Thank you for contributing to Bethlehem Medical Center! 🏥
