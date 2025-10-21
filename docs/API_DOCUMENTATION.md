# API Documentation

## Base URL
- Production: `https://bethlehemmedcenter.com/api`
- Development: `http://localhost:5000/api`

## Authentication
All API endpoints require Bearer token authentication:
```bash
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- **General endpoints**: 100 requests per 15 minutes
- **Admin endpoints**: 200 requests per 5 minutes
- **Authentication endpoints**: 10 requests per minute

## Endpoints

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "memory": "ok",
    "disk": "ok"
  }
}
```

### Delete User (Admin Only)
```http
POST /api/admin/delete-user
```
**Headers:**
```bash
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "authUserId": "uuid-string"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Auth user deleted successfully",
  "authUserId": "uuid-string"
}
```

**Response (Error):**
```json
{
  "error": "Failed to delete auth user",
  "detail": "User not found",
  "success": false
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Invalid token |
| 403  | Forbidden - Insufficient permissions |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |

## Security Headers

The API includes the following security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## Testing

### Using curl
```bash
# Health check
curl -X GET https://bethlehemmedcenter.com/health

# Delete user (with authentication)
curl -X POST https://bethlehemmedcenter.com/api/admin/delete-user \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"authUserId": "uuid-string"}'
```

### Using Postman
1. Import the API collection
2. Set environment variables
3. Add authentication token
4. Run test suite

## Monitoring

### Health Check Monitoring
Set up monitoring to check:
- `/health` endpoint every 5 minutes
- Response time < 2 seconds
- Status code 200

### Error Monitoring
Monitor for:
- 4xx errors (client issues)
- 5xx errors (server issues)
- High error rates (> 5%)

## API Versioning

Current version: v1
- Version in URL: `/api/v1/`
- Version in headers: `API-Version: 1.0`

## Rate Limiting Headers

Response headers include rate limiting information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```
