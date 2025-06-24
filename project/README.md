# HealthBridge - AI-Powered Health Records Management

HealthBridge is a comprehensive, secure web application for managing personal health records with AI-powered insights and analytics.

## Features

### 🔐 Security & Authentication
- OAuth 2.0 authentication with Google
- JWT-based session management
- Bank-level encryption for sensitive health data
- Rate limiting and security headers
- HIPAA-compliant data handling practices

### 📊 Health Data Management
- **Vital Signs Tracking**: Blood pressure, heart rate, temperature, weight, blood sugar
- **Medication Management**: Track current and past medications with dosages and schedules
- **Medical Conditions**: Record chronic conditions and diagnoses
- **Allergy Management**: Track allergens and reaction severity
- **Interactive Charts**: Visualize health trends over time

### 🤖 AI-Powered Insights
- OpenAI GPT-4 integration for health summaries
- Personalized health insights and recommendations
- Natural language processing of medical data
- Queue system for efficient AI request processing

### 📱 Modern User Experience
- Responsive design for desktop and mobile
- Real-time data updates
- Intuitive dashboard with health metrics
- Professional medical-grade UI design

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form management
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Passport.js** for authentication
- **OpenAI API** for AI features
- **Bull** queue system with Redis
- **Express Rate Limit** for API protection

### Infrastructure
- **Docker** containerization
- **Nginx** reverse proxy
- **Redis** for caching and queues
- **MongoDB** for data persistence

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Redis
- Docker (optional)

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd healthbridge
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/healthbridge

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Session Secret
SESSION_SECRET=your-super-secret-session-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Redis
REDIS_URL=redis://localhost:6379
```

### Development

1. Start the development servers:
```bash
npm run dev
```

This will start both the frontend (port 5173) and backend (port 5000) servers.

2. Open your browser to `http://localhost:5173`

### Production Deployment

#### Using Docker Compose

1. Build and start services:
```bash
docker-compose up -d
```

2. The application will be available at `http://localhost`

#### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Documentation

### Authentication Endpoints
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Health Data Endpoints
- `GET /api/health/profile` - Get user health profile
- `PUT /api/health/profile` - Update user profile
- `POST /api/health/vitals` - Add vital signs
- `GET /api/health/vitals` - Get vitals history
- `POST /api/health/medications` - Add medication
- `POST /api/health/conditions` - Add medical condition
- `POST /api/health/allergies` - Add allergy

### AI Endpoints
- `POST /api/ai/summary` - Generate AI health summary
- `GET /api/ai/summaries` - Get AI summary history

### User Endpoints
- `GET /api/user/dashboard` - Get dashboard statistics

## Security Features

### Data Protection
- AES-256 encryption for sensitive medical data
- Secure password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### API Security
- Rate limiting (100 requests/15 minutes)
- CORS configuration
- Security headers (Helmet.js)
- JWT token expiration
- Request size limits

### Infrastructure Security
- Docker container isolation
- Nginx reverse proxy
- SSL/TLS encryption
- Health checks and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Disclaimer

HealthBridge is designed for personal health record management and should not replace professional medical advice. Always consult with healthcare providers for medical decisions and treatment plans.