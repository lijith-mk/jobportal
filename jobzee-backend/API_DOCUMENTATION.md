# Jobzee Backend API Documentation

## Server Info
- **Base URL**: http://localhost:5000
- **Status**: ✅ Running
- **MongoDB**: ✅ Connected
- **Cloudinary**: ✅ Connected

## Admin Portal Access

### Admin Login
**Endpoint**: `POST /api/admin/login`

**Default Credentials**:
- User ID: `admin123`
- Password: `admin@123`

**Request Body**:
```json
{
  "userId": "admin123",
  "password": "admin@123"
}
```

**Response**:
```json
{
  "token": "jwt_token_here",
  "admin": {
    "id": "admin_id",
    "userId": "admin123",
    "name": "System Administrator",
    "email": "admin@jobzee.com",
    "role": "super_admin",
    "permissions": {
      "userManagement": true,
      "employerManagement": true,
      "jobManagement": true,
      "analytics": true,
      "systemSettings": true
    }
  }
}
```

### Admin Dashboard
**Endpoint**: `GET /api/admin/dashboard`
**Headers**: `Authorization: Bearer <token>`

### User Management
**Endpoint**: `GET /api/admin/users`
**Headers**: `Authorization: Bearer <token>`

### Employer Management
**Endpoint**: `GET /api/admin/employers`
**Headers**: `Authorization: Bearer <token>`

### Job Management
**Endpoint**: `GET /api/admin/jobs`
**Headers**: `Authorization: Bearer <token>`

## File Upload Endpoints

### Upload User Profile Photo
**Endpoint**: `POST /api/upload/user/profile-photo`
**Headers**: 
- `Authorization: Bearer <user_token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `photo`: Image file (JPEG, JPG, PNG, GIF, WEBP)
- Max size: 5MB

**Response**:
```json
{
  "message": "Profile photo uploaded successfully",
  "photoUrl": "https://res.cloudinary.com/..."
}
```

### Upload User Resume
**Endpoint**: `POST /api/upload/user/resume`
**Headers**: 
- `Authorization: Bearer <user_token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `resume`: Document file (PDF, DOC, DOCX)
- Max size: 10MB

**Response**:
```json
{
  "message": "Resume uploaded successfully",
  "resumeUrl": "https://res.cloudinary.com/..."
}
```

### Upload Employer Profile Photo
**Endpoint**: `POST /api/upload/employer/profile-photo`
**Headers**: 
- `Authorization: Bearer <employer_token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `photo`: Image file (JPEG, JPG, PNG, GIF, WEBP)
- Max size: 5MB

### Upload Company Logo
**Endpoint**: `POST /api/upload/employer/company-logo`
**Headers**: 
- `Authorization: Bearer <employer_token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `photo`: Image file (JPEG, JPG, PNG, GIF, WEBP)
- Max size: 5MB

## Common Issues & Solutions

### 1. Upload Issues
- **No file uploaded**: Make sure the form field name matches (`photo` for images, `resume` for documents)
- **File too large**: Reduce file size (5MB for images, 10MB for documents)
- **Invalid file type**: Use supported formats only
- **No token**: Include Authorization header with valid JWT token

### 2. Admin Access Issues
- **Invalid credentials**: Use `admin123` / `admin@123`
- **Token expired**: Login again to get new token
- **Permission denied**: Make sure you're using admin token, not user token

### 3. CORS Issues
- **Blocked by CORS**: Frontend must be running on http://localhost:3000 or add your URL to CORS config

## Testing Commands

```bash
# Initialize admin (if not already done)
npm run init-admin

# Test Cloudinary connection
npm run test-upload

# Start server
npm start

# Start server in development mode
npm run dev
```

## Environment Variables

Make sure your `.env` file contains:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=dxspcarx8
CLOUDINARY_API_KEY=762594944533685
CLOUDINARY_API_SECRET=W6Rsq5GsRLDo5nvC3neHywkODdQ
JWT_SECRET=jobzee_super_secret_key_2024_secure
NODE_ENV=development
```

## Status Check

✅ **Server**: Running on port 5000
✅ **Database**: Connected to MongoDB
✅ **Cloudinary**: Connected and working
✅ **Admin**: Initialized (admin123/admin@123)
✅ **JWT**: Configured
✅ **CORS**: Configured for localhost:3000

## Next Steps

1. **For Admin Access**: Use the credentials above to login via POST to `/api/admin/login`
2. **For File Uploads**: Make sure you have valid user/employer tokens first
3. **Frontend Integration**: Update your frontend to use the correct endpoints and headers
