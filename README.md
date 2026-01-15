# Pre-Med Election System - Backend

A robust, scalable backend API for managing pre-medical student elections with real-time features, document verification, and comprehensive validation.

## 🚀 Features

### Core Functionality
- **Student Registration** - Simple and document-verified registration
- **Real-time Voting** - Live vote casting with instant updates
- **Admin Dashboard** - Complete election management interface
- **Document Verification** - OCR-powered student ID verification
- **Access Code System** - VIP/special user authentication

### Technical Features
- **Real-time Updates** - WebSocket integration via Socket.IO
- **Document Processing** - Tesseract.js OCR for ID verification
- **Comprehensive Validation** - Input validation at all layers
- **Rate Limiting** - Built-in request throttling
- **Centralized Logging** - Structured logging with configurable levels
- **API Documentation** - Interactive Swagger/OpenAPI docs
- **Transaction Safety** - MongoDB transactions for data integrity

## 🏗️ Architecture

### Clean Architecture Pattern
```
src/
├── config/          # Configuration management
├── controllers/     # Request handlers
├── middlewares/     # Express middlewares
├── models/          # MongoDB schemas
├── routes/          # API route definitions
├── services/        # Business logic layer
├── validators/      # Input validation
├── utils/           # Shared utilities
└── seed/           # Database seeding
```

### Key Components
- **Validation Layer** - Comprehensive input validation with descriptive errors
- **Service Layer** - Business logic separation from controllers
- **Middleware Stack** - Authentication, validation, rate limiting
- **Real-time Engine** - Socket.IO for live updates
- **OCR Processing** - Document verification pipeline

## 📋 Prerequisites

- **Node.js** 18+ 
- **MongoDB** 4.4+
- **TypeScript** 5.2+

## ⚡ Quick Start

### 1. Installation
```bash
cd premed-backend
npm install
```

### 2. Environment Setup
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/premed_election
PORT=5000
CLIENT_URL=http://localhost:3000
OCR_MAX_CONCURRENCY=2
LOG_LEVEL=info
```

### 3. Build & Start
```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

### 4. Access API Documentation
Visit `http://localhost:5000/api-docs` for interactive Swagger UI

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/premed_election` | ✅ |
| `PORT` | HTTP server port | `5000` | ❌ |
| `CLIENT_URL` | Frontend origin for CORS | - | ❌ |
| `OCR_MAX_CONCURRENCY` | Concurrent OCR workers | `2` | ❌ |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` | ❌ |
| `GEMINI_API_KEY` | Google Gemini API key for OCR fallback | - | ❌ |
| `OCR_CONFIDENCE_THRESHOLD` | Minimum confidence to skip Gemini fallback | `0.7` | ❌ |
| `ENABLE_GEMINI_FALLBACK` | Enable Gemini AI as OCR fallback | `true` | ❌ |

### Auto-Seeding
On first startup, the system automatically seeds:
- **Demo Candidates** - Sample election candidates
- **Super Admin** - Username: `superadmin`, Password: `password123`
- **Access Codes** - Test VIP access codes

## 📚 API Endpoints

### Authentication & Registration
```http
POST /api/register                    # Simple student registration
POST /api/register-with-verification  # Registration with document upload
POST /api/login-with-code            # VIP access code login
POST /api/verify                     # Submit verification document
```

### Voting System
```http
POST /api/vote                       # Cast vote for candidate
GET  /api/candidates                 # List all candidates
POST /api/candidates                 # Create new candidate (admin)
DELETE /api/candidates/:id           # Remove candidate (admin)
```

### Admin Management
```http
POST /api/admin/login                # Admin authentication
GET  /api/admin/pending              # Users pending review
POST /api/admin/approve              # Approve user verification
POST /api/admin/reject               # Reject user verification
POST /api/admin/create               # Create admin account
GET  /api/admin/election-status      # Get election status
POST /api/admin/toggle-election      # Control election state
```

### Category Management
```http
GET  /api/categories                 # List all categories (for dropdowns)
GET  /api/categories/:id             # Get single category
POST /api/categories                 # Create new category
PUT  /api/categories/:id             # Update category
DELETE /api/categories/:id           # Delete category
```

### System Health
```http
GET /api/health                      # System health check
```

## 🗄️ Data Models

### User Schema
```typescript
{
  matricNumber: string,
  fullName: string,
  email: string,
  department: string,
  verificationStatus: enum,
  hasVoted: boolean,
  ocrConfidenceScore: number,
  rejectionReason?: string,
  createdAt: Date
}
```

### Candidate Schema
```typescript
{
  name: string,
  position: string,
  department: string,
  photoUrl: string,
  manifesto: string,
  voteCount: number,
  isActive: boolean,
  color: string
}
```

## 🔒 Security Features

- **Input Validation** - Comprehensive validation at all entry points
- **Rate Limiting** - Request throttling to prevent abuse
- **IP Tracking** - Duplicate vote prevention via IP blacklisting
- **Transaction Locks** - Distributed locking for vote integrity
- **Document Verification** - OCR-based identity validation
- **CORS Protection** - Configurable cross-origin policies

## 🚦 Real-time Features

### WebSocket Events
- `new_vote` - Live vote count updates
- `election_started` - Election commencement notification
- `election_paused` - Election pause notification
- `election_resumed` - Election resumption notification
- `election_ended` - Election conclusion notification
- `user_status_update` - User verification status changes

## 🧪 Development

### Scripts
```bash
npm run dev
npm run build
npm start
npm run seed
```

### Project Structure
- **Controllers** - Handle HTTP requests and responses
- **Services** - Contain business logic and data operations
- **Validators** - Input validation with descriptive error messages
- **Middlewares** - Request processing pipeline
- **Models** - MongoDB schema definitions
- **Utils** - Shared utilities (logging, OCR, locks)

## 📊 Monitoring & Logging

### Centralized Logging
- **Structured Logs** - JSON formatted with timestamps
- **Log Levels** - Debug, Info, Warn, Error
- **Configurable** - Environment-based log level control
- **Performance** - Non-blocking async logging

### Health Monitoring
- **Health Endpoint** - `/api/health` for system status
- **Database Connectivity** - MongoDB connection monitoring
- **Service Dependencies** - External service health checks

## 🔧 Advanced Features

### Document Processing
- **Dual OCR Engine** - Tesseract.js (primary) + Gemini AI (fallback)
- **Smart Fallback** - Automatically uses Gemini when Tesseract confidence < 70%
- **Validation Pipeline** - Multi-stage document verification
- **Confidence Scoring** - OCR accuracy assessment from both engines
- **Format Support** - JPG, PNG, GIF image formats

### Election Management
- **Timed Elections** - Automatic start/stop scheduling
- **Real-time Control** - Live election state management
- **Vote Integrity** - Transaction-based vote recording
- **Audit Trail** - Complete election activity logging

## 🤝 Contributing

1. Follow TypeScript best practices
2. Maintain comprehensive validation
3. Add appropriate logging
4. Update API documentation
5. Ensure backward compatibility

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for Pre-Medical Student Elections**
