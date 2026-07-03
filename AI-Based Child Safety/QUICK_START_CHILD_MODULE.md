# 🚀 Quick Start - Child Registration Module

## ⚡ 3-Minute Setup

### 1️⃣ Start the Application

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm start
```

### 2️⃣ Login
- URL: `http://localhost:3000`
- Email: `admin@childsafety.gov`
- Password: `Admin@123`

### 3️⃣ Register Your First Child
1. Click **"Children"** in sidebar
2. Click **"+ Add Child"** button
3. Fill the form and click **"Register Child"**
4. 🎉 See auto-generated Child ID: **CH2026000001**

---

## 📋 Quick Form Guide

### Required Fields (marked with *)
- First Name
- Last Name  
- Date of Birth
- Gender

### Optional Fields
- **Photograph** - Drag & drop image (max 5MB)
- **Adoption Date** - If already adopted
- **Blood Group** - Dropdown selection
- **Allergies** - Comma-separated (e.g., "Peanuts, Dust")
- **Chronic Conditions** - Comma-separated
- **Disabilities** - Comma-separated
- **Location Details** - Facility, City, State, Contact

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| **Unique Child ID** | Auto-generated (CH2026000001) |
| **Photo Upload** | Drag & drop with preview |
| **Medical History** | Blood group, allergies, conditions |
| **Adoption Date** | Track adoption timeline |
| **Real-time Validation** | Form validation before submit |
| **Success Message** | Shows generated Child ID |

---

## 🔌 API Quick Reference

```bash
# Base URL
http://localhost:5000/api

# Create Child
POST /children
Header: Authorization: Bearer {token}
Body: JSON with child details

# Get All Children  
GET /children?status=available

# Get Single Child
GET /children/{id}

# Update Child
PUT /children/{id}

# Upload Photo
POST /children/{id}/photo
```

---

## 💾 Example Child Data

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2018-05-15",
  "gender": "male",
  "medicalHistory": {
    "bloodGroup": "O+",
    "allergies": ["Peanuts", "Dust"],
    "chronicConditions": ["Asthma"],
    "disabilities": []
  },
  "currentLocation": {
    "facilityName": "Hope Children Center",
    "city": "New York",
    "state": "NY",
    "contactPerson": "Jane Smith",
    "contactNumber": "+1-555-0123"
  }
}
```

**Response includes:** `"childId": "CH2026000001"` ✨

---

## ✅ Success Indicators

After registration, you should see:

1. ✅ Success toast: *"Child registered successfully! Child ID: CH2026000001"*
2. ✅ Redirect to children list
3. ✅ New child appears in table with Child ID
4. ✅ All data saved in MongoDB

---

## 🎯 Testing Checklist

- [ ] Can register a child with all required fields
- [ ] Can upload a photo and see preview
- [ ] Medical history saves correctly
- [ ] Child ID is auto-generated (CHYYYYnnnnnn format)
- [ ] Success message shows the Child ID
- [ ] Child appears in listing with ID
- [ ] Can view child details
- [ ] Can update child information

---

## 📱 Where to Find Things

| What | Where |
|------|-------|
| Register Form | Click "Children" → "+ Add Child" |
| Children List | Sidebar → "Children" |
| Child Details | Click "View Details" in list |
| Child ID | Displayed in list and details |
| Medical History | In registration form & details page |
| Photo Upload | Registration form, top section |

---

## 🐛 Quick Troubleshooting

**Problem:** Child ID not showing
- **Fix:** Refresh the page or check MongoDB connection

**Problem:** Photo won't upload  
- **Fix:** Ensure image is < 5MB and JPG/PNG format

**Problem:** Form won't submit
- **Fix:** Check all required fields (marked with *) are filled

**Problem:** "Unauthorized" error
- **Fix:** Re-login to get fresh JWT token

---

## 📚 Full Documentation

- **API Details:** See `CHILD_REGISTRATION_API.md`
- **Complete Guide:** See `CHILD_REGISTRATION_COMPLETE.md`
- **Project Overview:** See `PROJECT_SUMMARY.md`

---

## 🎉 You're Ready!

The Child Registration Module is **fully functional** with:
- ✅ Unique auto-generated IDs
- ✅ Photo upload capabilities  
- ✅ Medical history tracking
- ✅ Adoption date recording
- ✅ Complete CRUD operations
- ✅ Beautiful UI/UX

**Happy Child Registration! 🎈**

---

**Need Help?** Check the troubleshooting section or review the full documentation files.
