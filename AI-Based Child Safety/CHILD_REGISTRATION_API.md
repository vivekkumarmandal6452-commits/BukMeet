# Child Registration Module - API Documentation

## Overview
Complete Child Registration Module with photo upload, medical history, adoption tracking, and auto-generated unique Child IDs.

## Database Schema

### Child Model
```javascript
{
  childId: String (Auto-generated, unique, format: CH2026000001),
  firstName: String (required),
  lastName: String (required),
  dateOfBirth: Date (required),
  gender: String (enum: ['male', 'female', 'other']),
  photo: String (base64 or URL),
  adoptionDate: Date (optional),
  medicalHistory: {
    bloodGroup: String,
    allergies: [String],
    chronicConditions: [String],
    disabilities: [String]
  },
  currentStatus: String (enum: ['available', 'in_process', 'adopted', 'foster_care']),
  currentLocation: {
    facilityName: String,
    address: String,
    city: String,
    state: String,
    contactPerson: String,
    contactNumber: String
  },
  registeredBy: ObjectId (ref: 'User'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## API Endpoints

### 1. Register New Child
**POST** `/api/children`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2018-05-15",
  "gender": "male",
  "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...", 
  "adoptionDate": null,
  "medicalHistory": {
    "bloodGroup": "O+",
    "allergies": ["Peanuts", "Dust"],
    "chronicConditions": ["Asthma"],
    "disabilities": []
  },
  "currentStatus": "available",
  "currentLocation": {
    "facilityName": "City Children's Home",
    "city": "New York",
    "state": "NY",
    "contactPerson": "Jane Smith",
    "contactNumber": "+1-555-0123"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Child registered successfully",
  "data": {
    "_id": "65f8a9b7c8d9e1f2a3b4c5d6",
    "childId": "CH2026000001",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "2018-05-15T00:00:00.000Z",
    "gender": "male",
    "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "adoptionDate": null,
    "medicalHistory": {
      "bloodGroup": "O+",
      "allergies": ["Peanuts", "Dust"],
      "chronicConditions": ["Asthma"],
      "disabilities": []
    },
    "currentStatus": "available",
    "currentLocation": {
      "facilityName": "City Children's Home",
      "city": "New York",
      "state": "NY",
      "contactPerson": "Jane Smith",
      "contactNumber": "+1-555-0123"
    },
    "registeredBy": "65f8a9b7c8d9e1f2a3b4c5d5",
    "createdAt": "2026-06-24T10:30:00.000Z",
    "updatedAt": "2026-06-24T10:30:00.000Z"
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "First name is required"
}
```

---

### 2. Get All Children
**GET** `/api/children`

**Query Parameters:**
- `status` - Filter by status (available, in_process, adopted, foster_care)
- `gender` - Filter by gender (male, female, other)

**Example:**
```
GET /api/children?status=available&gender=male
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "65f8a9b7c8d9e1f2a3b4c5d6",
      "childId": "CH2026000001",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "2018-05-15T00:00:00.000Z",
      "gender": "male",
      "currentStatus": "available",
      "registeredBy": {
        "_id": "65f8a9b7c8d9e1f2a3b4c5d5",
        "name": "Admin User",
        "email": "admin@childsafety.gov"
      },
      "createdAt": "2026-06-24T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Child
**GET** `/api/children/:id`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f8a9b7c8d9e1f2a3b4c5d6",
    "childId": "CH2026000001",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "2018-05-15T00:00:00.000Z",
    "gender": "male",
    "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "adoptionDate": null,
    "medicalHistory": {
      "bloodGroup": "O+",
      "allergies": ["Peanuts", "Dust"],
      "chronicConditions": ["Asthma"],
      "disabilities": []
    },
    "currentStatus": "available",
    "currentLocation": {
      "facilityName": "City Children's Home",
      "city": "New York",
      "state": "NY",
      "contactPerson": "Jane Smith",
      "contactNumber": "+1-555-0123"
    },
    "registeredBy": {
      "_id": "65f8a9b7c8d9e1f2a3b4c5d5",
      "name": "Admin User",
      "email": "admin@childsafety.gov"
    },
    "createdAt": "2026-06-24T10:30:00.000Z",
    "updatedAt": "2026-06-24T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Child not found"
}
```

---

### 4. Update Child
**PUT** `/api/children/:id`

**Request Body:**
```json
{
  "firstName": "John Updated",
  "adoptionDate": "2026-06-20",
  "currentStatus": "adopted",
  "medicalHistory": {
    "bloodGroup": "O+",
    "allergies": ["Peanuts", "Dust", "Pollen"],
    "chronicConditions": ["Asthma"],
    "disabilities": []
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    // Updated child object
  }
}
```

---

### 5. Upload/Update Child Photo
**POST** `/api/children/:id/photo`

**Request Body:**
```json
{
  "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    // Child object with updated photo
  }
}
```

---

### 6. Delete Child
**DELETE** `/api/children/:id`

**Success Response (200):**
```json
{
  "success": true,
  "data": {}
}
```

---

### 7. Get Child Statistics
**GET** `/api/children/stats`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "available",
      "count": 45
    },
    {
      "_id": "in_process",
      "count": 23
    },
    {
      "_id": "adopted",
      "count": 156
    }
  ]
}
```

---

## Frontend Implementation

### React Form Features
1. ✅ **Basic Information**
   - First Name, Last Name
   - Date of Birth (with max date validation)
   - Gender selection
   - Adoption Date (optional)

2. ✅ **Photo Upload**
   - Drag & drop interface
   - Image preview
   - File size validation (max 5MB)
   - File type validation (images only)
   - Base64 encoding for storage
   - Remove photo option

3. ✅ **Medical History**
   - Blood group dropdown (A+, A-, B+, B-, AB+, AB-, O+, O-)
   - Allergies (comma-separated input)
   - Chronic conditions (comma-separated input)
   - Disabilities (comma-separated input)
   - Additional notes (textarea)

4. ✅ **Current Location**
   - Facility name
   - City and State
   - Contact person
   - Contact number

### Auto-Generated Child ID
- Format: `CH{YEAR}{SEQUENCE}`
- Example: `CH2026000001`, `CH2026000002`, etc.
- Generated automatically on save
- Displayed to user after successful registration

### Form Validation
- Required fields marked with *
- Date of birth cannot be in future
- Photo size limited to 5MB
- Only image files accepted
- Comma-separated values auto-converted to arrays

---

## Testing the Module

### 1. Using cURL

**Register a Child:**
```bash
curl -X POST http://localhost:5000/api/children \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "dateOfBirth": "2019-03-20",
    "gender": "female",
    "medicalHistory": {
      "bloodGroup": "A+",
      "allergies": ["Lactose"],
      "chronicConditions": [],
      "disabilities": []
    },
    "currentStatus": "available",
    "currentLocation": {
      "facilityName": "Hope Children Center",
      "city": "Boston",
      "state": "MA",
      "contactPerson": "Mary Johnson",
      "contactNumber": "+1-555-0199"
    }
  }'
```

**Get All Children:**
```bash
curl -X GET http://localhost:5000/api/children \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Child by ID:**
```bash
curl -X GET http://localhost:5000/api/children/CHILD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Using Postman
1. Import the endpoints
2. Set Authorization header with JWT token
3. Test each endpoint with sample data

### 3. Using React Frontend
1. Navigate to `/children/add`
2. Fill in the registration form
3. Upload a photo (optional)
4. Click "Register Child"
5. View success message with Child ID
6. Child appears in `/children` list

---

## File Structure

```
project/
├── backend/
│   ├── models/
│   │   └── Child.js (Enhanced with childId & adoptionDate)
│   ├── controllers/
│   │   └── childController.js (Added uploadPhoto method)
│   └── routes/
│       └── children.js (Added photo upload route)
└── frontend/
    └── src/
        └── pages/
            └── AddChild.js (Complete registration form)
```

---

## Security & Authorization

### Required Permissions
- **Create Child:** Admin, Social Worker
- **Read Children:** All authenticated users
- **Update Child:** Admin, Social Worker
- **Delete Child:** Admin only

### Data Protection
- All requests require JWT authentication
- Photos stored as base64 (can be migrated to cloud storage)
- Sensitive data encrypted in transit (HTTPS recommended for production)
- Input validation on both frontend and backend

---

## Future Enhancements

1. **File Storage**
   - Migrate from base64 to cloud storage (AWS S3, Cloudinary)
   - Generate thumbnails for better performance
   - Support multiple photos per child

2. **Advanced Search**
   - Search by name, age range, medical conditions
   - Full-text search
   - Geolocation-based search

3. **Batch Operations**
   - Bulk import from CSV/Excel
   - Bulk export with photos
   - Batch status updates

4. **Notifications**
   - Email confirmation on registration
   - SMS to contact person
   - Birthday reminders

---

## Troubleshooting

### Common Issues

**1. "Child not found" error**
- Verify the child ID is correct
- Ensure you're authenticated
- Check if child was deleted

**2. Photo upload fails**
- Check file size (must be < 5MB)
- Verify file is an image format
- Ensure base64 encoding is correct

**3. "Validation error" on submit**
- Check all required fields are filled
- Verify date format (YYYY-MM-DD)
- Ensure gender is selected

**4. Child ID not generated**
- Pre-save hook should run automatically
- Check database connection
- Verify model has pre-save middleware

---

## Support

For issues or questions:
- Check API responses for detailed error messages
- Review browser console for frontend errors
- Check backend logs for server errors
- Verify MongoDB connection and schema

**Module Version:** 2.0
**Last Updated:** June 24, 2026
**Status:** ✅ Production Ready
