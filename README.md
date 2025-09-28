# Order Processing Integration System

A comprehensive microservices-based order processing system built with Node.js, TypeScript, and modern architectural patterns. The system includes secure authentication, idempotency guarantees, event-driven communication, and comprehensive API documentation.

## System Architecture

### Services
- **Sales Service** (Port 3000) - Order management, authentication, and business logic
- **Delivery Service** (Port 3001) - Shipment tracking and delivery status management (mocked)

### Infrastructure
- **MySQL 8** - Primary database for persistent data storage
- **Apache ActiveMQ Artemis** - Message broker for event-driven communication
- **Docker Compose** - Container orchestration and service management

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Running the System
```bash
# Clone the repository
git clone https://github.com/roeygol/cp-assignment.git
cd cp-assignment

# Start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### Service Endpoints
- **Sales Service**: http://localhost:3000
  - Health: http://localhost:3000/health
  - API Docs: http://localhost:3000/docs
  - Auth: http://localhost:3000/api/v1/auth
  - Orders: http://localhost:3000/api/v1/orders

- **Delivery Service**: http://localhost:3001
  - Health: http://localhost:3001/health
  - API Docs: http://localhost:3001/docs
  - Deliveries: http://localhost:3001/api/v1/deliveries

## Authentication & Security

### Authentication Methods
1. **JWT Authentication** - Required for order creation (POST endpoints)
2. **API Key Authentication** - Required for read operations (GET endpoints)

### Default Credentials
**Users:**
- Admin: `admin@example.com` / `admin123`
- Customer: `customer@example.com` / `customer123`


### Security Features
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Validation** - Zod schema validation
- **Password Hashing** - bcrypt with salt rounds
- **SQL Injection Protection** - Sequelize ORM

## API Usage Examples

### 1. Authentication Flow

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "customer@example.com",
    "password": "customer123"
  }'
```

#### Register New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

### 2. Order Management

#### Create Order (with JWT + Idempotency)
```bash
# Get JWT token first
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "customer@example.com", "password": "customer123"}' | jq -r '.data.token')

# Create order with idempotency
curl -X POST http://localhost:3000/api/v1/orders \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Idempotency-Key: 11111111-1111-1111-1111-111111111111' \
  -d '{
    "customerId": "customer-123",
    "items": [
      {"productId": "product-1", "quantity": 2, "price": 19.99},
      {"productId": "product-2", "quantity": 1, "price": 9.99}
    ],
    "totalAmount": 49.97
  }'
```

#### Get Order by ID (with API Key)
```bash
curl -X GET http://localhost:3000/api/v1/orders/<order_id> \
  -H 'X-API-Key: api-key-1'
```

#### Get Orders by Customer
```bash
curl -X GET http://localhost:3000/api/v1/orders/customer/customer-123 \
  -H 'X-API-Key: api-key-1'
```

#### Get Orders by Status
```bash
curl -X GET http://localhost:3000/api/v1/orders/status/PendingShipment \
  -H 'X-API-Key: api-key-1'
```

### 3. Delivery Service (Mocked)

#### List All Deliveries
```bash
curl -s http://localhost:3001/api/v1/deliveries | jq
```

#### Get Delivery by ID
```bash
curl -s http://localhost:3001/api/v1/deliveries/<shipment_id> | jq
```

## Idempotency Implementation

### How It Works
1. **Idempotency Key Required**: All POST requests must include an `Idempotency-Key` header
2. **Response Caching**: Successful responses are cached for 24 hours
3. **Duplicate Prevention**: Subsequent requests with the same key return the cached response
4. **Error Handling**: Failed requests are also cached to prevent retry loops

### Usage Example
```bash
# First request - creates order
curl -X POST http://localhost:3000/api/v1/orders \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Idempotency-Key: duplicate-test-123' \
  -d '{"customerId": "test", "items": [], "totalAmount": 10.00}'

# Second request with same key - returns cached response
curl -X POST http://localhost:3000/api/v1/orders \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Idempotency-Key: duplicate-test-123' \
  -d '{"customerId": "test", "items": [], "totalAmount": 10.00}'
```

## Rate Limiting

### Limits Applied
- **Order Creation**: 10 requests per 1 minute
- **Authentication**: 5 attempts per 1 minute
- **General API**: 100 requests per 1 minute

### Rate Limit Headers
All responses include rate limiting information:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Configuration

### Environment Variables

#### Sales Service
```bash
PORT=3000
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DB=salesdb
MYSQL_USER=appuser
MYSQL_PASSWORD=apppassword
ACTIVEMQ_HOST=activemq
ACTIVEMQ_PORT=61613
ACTIVEMQ_USER=admin
ACTIVEMQ_PASSWORD=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
VALID_API_KEYS=api-key-1,api-key-2,api-key-3
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Delivery Service
```bash
PORT=3001
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DB=salesdb
MYSQL_USER=appuser
MYSQL_PASSWORD=apppassword
ACTIVEMQ_HOST=activemq
ACTIVEMQ_PORT=61613
ACTIVEMQ_USER=admin
ACTIVEMQ_PASSWORD=admin
```

## Monitoring & Health Checks

### API Swagger Documentation
- Sales Service: `http://localhost:3000/docs`
- Delivery Service: `http://localhost:3001/docs`

## Event-Driven Communication

The system uses Apache ActiveMQ Artemis for event-driven communication:

1. **Order Created Event** - Published when a new order is created
2. **Delivery Status Event** - Published when delivery status changes
3. **Event Deduplication** - Prevents processing duplicate events
