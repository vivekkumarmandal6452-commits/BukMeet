# API Documentation

Complete REST API documentation for the Child Safety & Post-Adoption Monitoring System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "admin",
  "department": "Child Welfare"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "department": "Child Welfare"
  }
}
```

### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@childsafety.gov",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@childsafety.gov",
    "role": "admin",
    "department": "Child Welfare"
  }
}
```

### Get Current User

```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@childsafety.gov",
    "role": "admin"
  }
}
```

---

## Children Endpoints

### Get All Children

```http
GET /children
```

**Query Parameters:**
- `status` (optional): available, in_process, adopted, foster_care
- `gender` (optional): male, female, other
- `minAge` (optional): number
- `maxAge` (optional): number

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Emma",
      "lastName": "Smith",
      "dateOfBirth": "2015-06-15",
      "gender": "female",
      "currentStatus": "available",
      "currentLocation": {
        "facilityName": "Sunshine Children's Home",
        "city": "New York",
        "state": "NY"
      }
    }
  ]
}
```

### Get Single Child

```http
GET /children/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Emma",
    "lastName": "Smith",
    "dateOfBirth": "2015-06-15",
    "gender": "female",
    "currentStatus": "available",
    "medicalHistory": {
      "bloodGroup": "O+",
      "allergies": ["Peanuts"],
      "vaccinations": []
    },
    "currentLocation": {
      "facilityName": "Sunshine Children's Home",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "contactPerson": "Jane Doe",
      "contactNumber": "+1-555-0123"
    }
  }
}
```

### Create Child

```http
POST /children
```

**Request Body:**
```json
{
  "firstName": "Emma",
  "lastName": "Smith",
  "dateOfBirth": "2015-06-15",
  "gender": "female",
  "currentStatus": "available",
  "currentLocation": {
    "facilityName": "Sunshine Children's Home",
    "city": "New York",
    "state": "NY",
    "contactPerson": "Jane Doe",
    "contactNumber": "+1-555-0123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "Emma",
    "lastName": "Smith",
    ...
  }
}
```

### Update Child

```http
PUT /children/:id
```

**Request Body:** Same as create, partial updates allowed

### Delete Child

```http
DELETE /children/:id
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

### Get Child Statistics

```http
GET /children/stats
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "_id": "available", "count": 25 },
    { "_id": "in_process", "count": 10 },
    { "_id": "adopted", "count": 45 }
  ]
}
```

---

## Parents Endpoints

### Get All Parents

```http
GET /parents
```

**Query Parameters:**
- `status` (optional): pending, under_review, approved, rejected
- `kycStatus` (optional): true, false

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "applicationType": "couple",
      "primaryApplicant": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1-555-0123"
      },
      "applicationStatus": "approved",
      "kycStatus": {
        "isVerified": true
      }
    }
  ]
}
```

### Create Parent

```http
POST /parents
```

**Request Body:**
```json
{
  "applicationType": "couple",
  "primaryApplicant": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "dateOfBirth": "1985-03-15",
    "occupation": "Engineer"
  },
  "address": {
    "street": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "residenceType": "owned"
  }
}
```

### Update KYC Status

```http
PUT /parents/:id/kyc
```

**Request Body:**
```json
{
  "isVerified": true,
  "documentsSubmitted": [
    {
      "documentType": "ID Proof",
      "documentNumber": "ABC123456",
      "verificationStatus": "verified"
    }
  ]
}
```

### Update Application Status

```http
PUT /parents/:id/status
```

**Request Body:**
```json
{
  "status": "approved"
}
```

---

## Adoptions Endpoints

### Get All Adoptions

```http
GET /adoptions
```

**Query Parameters:**
- `status` (optional): initiated, under_review, trial_period, finalized

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "child": {
        "_id": "...",
        "firstName": "Emma",
        "lastName": "Smith"
      },
      "parent": {
        "_id": "...",
        "primaryApplicant": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "status": "trial_period",
      "applicationDate": "2024-01-15"
    }
  ]
}
```

### Create Adoption

```http
POST /adoptions
```

**Request Body:**
```json
{
  "child": "507f1f77bcf86cd799439011",
  "parent": "507f1f77bcf86cd799439012"
}
```

### Update Adoption Status

```http
PUT /adoptions/:id/status
```

**Request Body:**
```json
{
  "status": "finalized",
  "notes": "All requirements met. Finalization approved."
}
```

### Add Visit Record

```http
POST /adoptions/:id/visits
```

**Request Body:**
```json
{
  "visitDate": "2024-02-15",
  "visitType": "scheduled",
  "socialWorker": "Jane Smith",
  "observations": "Family is adjusting well.",
  "rating": 4.5,
  "concerns": []
}
```

### Add Monitoring Report

```http
POST /adoptions/:id/monitoring
```

**Request Body:**
```json
{
  "reportDate": "2024-03-01",
  "visitType": "scheduled",
  "socialWorker": "Jane Smith",
  "childWellbeing": {
    "physical": 5,
    "emotional": 4,
    "educational": 5,
    "social": 4
  },
  "parentingAssessment": 4.5,
  "concerns": [],
  "recommendations": ["Continue current approach"],
  "overallRating": 4.5
}
```

---

## Risk Assessment Endpoints

### Create Risk Assessment

```http
POST /risk-assessment
```

**Request Body:**
```json
{
  "adoption": "507f1f77bcf86cd799439011",
  "assessmentType": "pre-adoption",
  "riskFactors": {
    "parentFactors": {
      "financialStability": { "score": 20, "notes": "Stable income" },
      "criminalBackground": { "score": 5, "notes": "Clean record" }
    },
    "environmentFactors": {
      "homeEnvironment": { "score": 15, "notes": "Suitable" }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "adoption": "...",
    "assessmentType": "pre-adoption",
    "aiAnalysis": {
      "overallRiskScore": 25.5,
      "riskLevel": "medium",
      "predictionConfidence": 85,
      "keyRiskIndicators": ["Financial concerns"],
      "recommendations": ["Monthly follow-up visits"]
    }
  }
}
```

### Get Risk Assessments

```http
GET /risk-assessment
```

**Query Parameters:**
- `adoption` (optional): adoption ID
- `riskLevel` (optional): low, medium, high, critical

### Get Risk Assessment by Adoption

```http
GET /risk-assessment/adoption/:adoptionId
```

### Update Action Item

```http
PUT /risk-assessment/:id/action/:actionId
```

**Request Body:**
```json
{
  "status": "completed"
}
```

---

## Alerts Endpoints

### Get All Alerts

```http
GET /alerts
```

**Query Parameters:**
- `status` (optional): active, acknowledged, in_progress, resolved
- `severity` (optional): info, warning, critical, emergency
- `category` (optional): risk_assessment, missed_visit, etc.
- `adoption` (optional): adoption ID

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "High Risk Detected",
      "description": "Risk assessment shows high risk level",
      "severity": "critical",
      "category": "risk_assessment",
      "status": "active",
      "priority": 5,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Create Alert

```http
POST /alerts
```

**Request Body:**
```json
{
  "title": "Missed Visit",
  "description": "Scheduled visit was missed",
  "severity": "warning",
  "category": "missed_visit",
  "adoption": "507f1f77bcf86cd799439011",
  "priority": 3
}
```

### Update Alert Status

```http
PUT /alerts/:id/status
```

**Request Body:**
```json
{
  "status": "resolved",
  "resolutionNotes": "Issue resolved after follow-up"
}
```

### Add Action to Alert

```http
POST /alerts/:id/action
```

**Request Body:**
```json
{
  "action": "Contacted parent",
  "notes": "Confirmed rescheduled visit"
}
```

### Get Critical Alerts

```http
GET /alerts/critical
```

---

## Dashboard Endpoints

### Get Government Dashboard

```http
GET /dashboard/government
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "children": {
        "total": 100,
        "available": 25,
        "adopted": 50,
        "inProcess": 15
      },
      "parents": {
        "total": 75,
        "approved": 50,
        "pending": 15,
        "underReview": 10
      },
      "adoptions": {
        "total": 60,
        "finalized": 45,
        "ongoing": 15
      },
      "alerts": {
        "active": 5,
        "critical": 2
      }
    },
    "recentActivities": {
      "adoptions": [...],
      "alerts": [...]
    },
    "trends": {
      "monthlyAdoptions": [...]
    }
  }
}
```

### Get Adoption Trends

```http
GET /dashboard/trends
```

**Query Parameters:**
- `period` (optional): 3months, 6months, 1year (default: 6months)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": { "year": 2024, "month": 1 },
      "total": 10,
      "finalized": 8
    },
    {
      "_id": { "year": 2024, "month": 2 },
      "total": 12,
      "finalized": 10
    }
  ]
}
```

---

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "error": "Please provide email and password"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Forbidden (403)

```json
{
  "success": false,
  "message": "User role admin is not authorized to access this route"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Server Error"
}
```

---

## Rate Limiting

- **Limit**: 100 requests per 10 minutes per IP
- **Response on limit exceeded**: 429 Too Many Requests

---

## Best Practices

1. **Always include Authorization header** for protected routes
2. **Check response status codes** for error handling
3. **Validate input** before sending requests
4. **Handle errors gracefully** in your application
5. **Use appropriate HTTP methods** (GET, POST, PUT, DELETE)
6. **Implement retry logic** for failed requests
7. **Cache responses** where appropriate
8. **Use pagination** for large datasets

---

## Testing with cURL

### Login Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@childsafety.gov","password":"Admin@123"}'
```

### Get Children Example

```bash
curl -X GET http://localhost:5000/api/children \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Child Example

```bash
curl -X POST http://localhost:5000/api/children \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "Emma",
    "lastName": "Smith",
    "dateOfBirth": "2015-06-15",
    "gender": "female",
    "currentStatus": "available"
  }'
```

---

## Postman Collection

Import this collection for easier API testing:

```json
{
  "info": {
    "name": "Child Safety API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@childsafety.gov\",\"password\":\"Admin@123\"}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

---

**API Version**: 1.0.0  
**Last Updated**: 2024  
**Contact**: For support, refer to README.md
