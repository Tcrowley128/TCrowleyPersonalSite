# Testing Guide

This project uses **Vitest** and **React Testing Library** for unit and integration testing.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Test File Naming
- Component tests: `ComponentName.test.tsx`
- API route tests: `route.test.ts`
- Utility tests: `utilityName.test.ts`

### Example Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Example API Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/example', () => {
  it('should return 200', async () => {
    const request = new NextRequest('http://localhost:3000/api/example');
    const response = await GET(request);

    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Test user behavior, not implementation** - Focus on what users see and do
2. **Use descriptive test names** - `it('should show error when email is invalid')`
3. **Arrange, Act, Assert** - Set up → Execute → Verify
4. **Mock external dependencies** - APIs, database calls, etc.
5. **Test edge cases** - Empty states, errors, loading states
6. **Keep tests independent** - Each test should work in isolation

## Testing Utilities

### React Testing Library
- `render()` - Render a component
- `screen` - Query rendered elements
- `fireEvent` - Trigger events
- `userEvent` - Simulate user interactions (preferred)
- `waitFor()` - Wait for async operations

### Vitest
- `describe()` - Group related tests
- `it()` / `test()` - Define a test
- `expect()` - Make assertions
- `beforeEach()` / `afterEach()` - Setup/teardown
- `vi.mock()` - Mock modules
- `vi.fn()` - Create mock functions

## Coverage Goals

Aim for:
- **80%+ overall coverage**
- **100% critical paths** (auth, payment, data mutations)
- **90%+ API routes**
- **70%+ components**

## CI/CD Integration

Tests run automatically on:
- Every git push
- Pull request creation
- Before deployment to production

Failed tests block deployment.

## Mocking

### Mock Next.js Router
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));
```

### Mock Supabase
```typescript
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
  }),
}));
```

### Mock API Calls
```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mocked' }),
  })
);
```

## Troubleshooting

### Tests fail with "Cannot find module"
- Check import paths use `@/` alias
- Verify `vitest.config.ts` has correct path resolution

### Tests hang or timeout
- Check for unresolved promises
- Increase timeout with `it('test', () => {}, 10000)`

### Mock not working
- Ensure mock is before imports: `vi.mock()` must be at top
- Use `vi.clearAllMocks()` in `beforeEach()`

## Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
