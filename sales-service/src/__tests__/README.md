# Sales Service Tests

This directory contains comprehensive test files for the sales-service application.

## Test Structure

```
src/__tests__/
├── setup.ts                    # Test configuration and setup
├── helpers/
│   └── testHelpers.ts          # Reusable test utilities
├── services/
│   ├── OrderService.test.ts    # Unit tests for OrderService
│   ├── AuthService.test.ts     # Unit tests for AuthService
│   └── HealthService.test.ts   # Unit tests for HealthService
├── controllers/
│   ├── OrderController.test.ts  # Integration tests for OrderController
│   └── HealthController.test.ts # Integration tests for HealthController
└── middleware/
    ├── idempotency.test.ts     # Tests for idempotency middleware
    └── rateLimiting.test.ts    # Tests for rate limiting middleware
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test Files
```bash
# Run only service tests
npm test -- services/

# Run only controller tests
npm test -- controllers/

# Run only middleware tests
npm test -- middleware/
```

## Test Categories

### Unit Tests
- **OrderService**: Tests core business logic for order operations
- **AuthService**: Tests authentication and user management
- **HealthService**: Tests health check functionality

### Integration Tests
- **OrderController**: Tests HTTP endpoints and request/response handling
- **HealthController**: Tests health endpoint integration

### Middleware Tests
- **Idempotency**: Tests request deduplication logic
- **Rate Limiting**: Tests request throttling functionality

## Test Coverage

The tests cover:
- Service layer business logic
- Controller request/response handling
- Middleware functionality
- Error handling and edge cases
- Input validation
- Authentication flows
- Health check endpoints

## Mocking Strategy

- **External Dependencies**: Database connections, external APIs
- **Repositories**: Data access layer
- **Services**: Cross-cutting concerns
- **Express Objects**: Request, Response, NextFunction

## Test Data

Test data is generated using helper functions in `testHelpers.ts`:
- `createMockRequest()`: Mock Express request objects
- `createMockResponse()`: Mock Express response objects
- `createMockOrder()`: Mock order data
- `createMockUser()`: Mock user data
- `createMockRepository()`: Mock repository methods

## Running Tests in CI/CD

The test suite is designed to run in CI/CD environments with:
- Isolated test environment
- Mocked external dependencies
- Deterministic test data
- Proper cleanup between tests

## Best Practices

1. **Test Isolation**: Each test is independent and doesn't affect others
2. **Mocking**: External dependencies are properly mocked
3. **Assertions**: Clear and specific assertions for expected behavior
4. **Error Cases**: Both success and failure scenarios are tested
5. **Edge Cases**: Boundary conditions and invalid inputs are covered
