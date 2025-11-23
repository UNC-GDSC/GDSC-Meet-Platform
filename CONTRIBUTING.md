# Contributing to GDSC Meet Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## How to Contribute

### Reporting Bugs

1. Check if the bug is already reported
2. Use the issue template
3. Provide detailed reproduction steps
4. Include screenshots if applicable
5. Specify your environment (OS, browser, etc.)

### Suggesting Features

1. Check existing feature requests
2. Clearly describe the feature
3. Explain the use case
4. Consider implementation complexity

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/GDSC-Meet-Platform.git
   cd GDSC-Meet-Platform
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes**
   - Follow code style guidelines
   - Write clear commit messages
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   npm run dev
   # Test manually in browser
   ```

5. **Commit changes**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Development Setup

1. **Prerequisites**
   - Node.js 18+
   - npm or yarn
   - Git

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   - Copy `.env.example` files
   - Configure variables

4. **Start development**
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type
- Use meaningful variable names

### React

- Use functional components
- Use hooks appropriately
- Keep components small and focused
- Extract reusable logic to hooks

### Naming Conventions

- **Components**: PascalCase (`VideoTile.tsx`)
- **Files**: camelCase (`useRoom.ts`)
- **Variables**: camelCase (`roomId`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PARTICIPANTS`)

### File Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── services/       # API/service layers
├── store/          # State management
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## Testing Guidelines

### Manual Testing Checklist

- [ ] Create room works
- [ ] Join room works
- [ ] Video/audio streaming works
- [ ] Screen sharing works
- [ ] Chat works
- [ ] Controls work (mute, camera, etc.)
- [ ] Responsive design works
- [ ] Error handling works

### Browser Testing

Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Commit Message Format

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

### Examples

```
feat(chat): add message timestamps

Add timestamps to chat messages for better context.

Closes #123
```

```
fix(webrtc): resolve connection timeout issue

Fixed peer connection timeout by increasing timeout duration
and adding retry logic.

Fixes #456
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested manually

### PR Description

Include:
- What changes were made
- Why changes were needed
- How to test the changes
- Screenshots (if UI changes)
- Related issues

### Review Process

1. Maintainer reviews code
2. Feedback provided
3. Changes requested (if needed)
4. Approval and merge

## Feature Requests

### Good Feature Requests Include

- Clear description
- Use case/problem solved
- Potential implementation
- Mockups/examples (if UI)

### What We Look For

- Aligns with project goals
- Benefits multiple users
- Feasible to implement
- Maintains simplicity

## Questions?

- Open a discussion on GitHub
- Check existing documentation
- Review closed issues/PRs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
