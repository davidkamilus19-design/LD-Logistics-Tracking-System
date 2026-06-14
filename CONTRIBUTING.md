# Contributing to LD Logistics Tracking System

Thank you for your interest in contributing! This document outlines our contribution guidelines.

## Code of Conduct

- Be respectful and professional
- Focus on constructive feedback
- Respect all contributors' time and effort

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/LD-Logistics-Tracking-System.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes: `npm test`
6. Commit with clear messages: `git commit -m "Add feature: description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Branch Naming Convention

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

## Commit Message Guidelines

Follow conventional commits:

```
type(scope): subject

- type: feat, fix, docs, style, refactor, test, chore
- scope: feature area (e.g., auth, shipments, tracking)
- subject: clear, concise description
```

Example:
```
feat(shipments): add bulk shipment creation API

- Implement batch upload endpoint
- Add validation for CSV format
- Include error handling and reporting
```

## Code Style

### Backend (Node.js)
- Use ES6+ syntax
- 2-space indentation
- Follow ESLint configuration
- Run `npm run lint` before committing

### Frontend (React)
- Use functional components
- Follow React hooks best practices
- Use meaningful variable names
- Component names in PascalCase

## Testing

- Write unit tests for new functions
- Maintain test coverage above 80%
- Run tests: `npm test`
- Integration tests for new endpoints

## Pull Request Process

1. **Update** relevant documentation
2. **Add/update** tests for your changes
3. **Ensure** all tests pass: `npm test`
4. **Run linter**: `npm run lint`
5. **Fill out** PR template completely
6. **Link** related issues
7. **Request** reviews from team members

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Feature
- [ ] Bug Fix
- [ ] Documentation
- [ ] Breaking Change

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Related Issues
Closes #123

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Documentation

- Update README.md for new features
- Add/update API documentation
- Include code comments for complex logic
- Update CHANGELOG.md

## Performance Considerations

- Optimize database queries
- Use indexes appropriately
- Cache when suitable
- Monitor API response times

## Security

- Never commit secrets/credentials
- Use environment variables
- Follow OWASP guidelines
- Validate all user input
- Report security issues privately

## Questions?

- Open an issue for discussion
- Check existing documentation
- Contact the development team

## License

By contributing, you agree that your contributions will be licensed under the project's license.
