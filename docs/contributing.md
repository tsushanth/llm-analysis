# Contributing to LLM Output Analysis

Thank you for your interest in contributing to the LLM Output Analysis project! This document provides guidelines for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- API keys for LLM providers (optional for development)

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys (optional)
# The service works with mock responses without API keys
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testPathPattern=unit

# Run with coverage
npm run test:coverage
```

### Code Style
- Use ESLint configuration provided
- Follow existing code patterns
- Add JSDoc comments for public methods
- Use meaningful variable names

## Types of Contributions

### Bug Reports
- Use the issue template
- Include steps to reproduce
- Provide expected vs actual behavior
- Include environment details

### Feature Requests
- Describe the use case
- Explain the expected behavior
- Consider backward compatibility
- Provide examples if possible

### Code Contributions
- Follow the existing code style
- Add tests for new features
- Update documentation
- Keep commits focused and atomic

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add entry to CHANGELOG.md
4. Request review from maintainers
5. Address review feedback

## Code Review Guidelines

### For Contributors
- Write clear commit messages
- Keep PRs focused and small
- Respond to feedback promptly
- Update PRs based on reviews

### For Reviewers
- Be constructive and helpful
- Focus on code quality and maintainability
- Consider performance implications
- Check for proper error handling

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new functions
- Update examples if APIs change
- Keep documentation current

## Testing

- Add unit tests for new functions
- Add integration tests for workflows
- Ensure tests are deterministic
- Mock external dependencies

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Tag the release
4. Update documentation
5. Announce the release

## Questions?

- Open an issue for questions
- Join discussions in existing issues
- Email maintainers for sensitive issues

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow project guidelines

Thank you for contributing!