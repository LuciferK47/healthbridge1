# HealthBridge: AI-Powered Personal Health Record Assistant

## Project Overview

HealthBridge is a secure web application that aggregates and summarizes personal health records using AI, providing users with actionable health insights. The application allows users to track their medical conditions, medications, vitals, and other health data in one place, and uses AI to generate summaries and recommendations.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **AI Integration**: OpenAI API
- **Authentication**: OAuth 2.0 (Google)
- **Deployment**: Dockerized application on AWS

## Project Structure

### Frontend (React)

The frontend is built with React, TypeScript, and Tailwind CSS. It uses React Router for navigation and React Query for data fetching.

#### Key Components

- **App.tsx**: Main application component with routing setup
- **AuthContext.tsx**: Context provider for authentication state
- **Layout.tsx**: Main layout component with sidebar navigation

#### Pages

- **Login.tsx**: Login page with Google OAuth
- **Dashboard.tsx**: Main dashboard with health statistics and recent activity
- **Profile.tsx**: User profile management
- **Vitals.tsx**: Track and view vital signs
- **Medications.tsx**: Manage medications
- **Conditions.tsx**: Track medical conditions
- **AISummary.tsx**: View AI-generated health summaries

### Backend (Node.js/Express)

The backend is built with Node.js and Express. It uses MongoDB for data storage and Passport.js for authentication.

#### Key Files

- **server/index.js**: Main server setup with middleware and routes
- **server/config/passport.js**: Passport configuration for authentication
- **server/models/User.js**: MongoDB user model with health data schema

#### Routes

- **auth.js**: Authentication routes (Google OAuth, JWT)
- **health.js**: Health data management (vitals, medications, conditions)
- **ai.js**: AI integration for health summaries
- **user.js**: User profile and dashboard data

## Data Models

### User Model

The User model includes:

- Basic user information (name, email, avatar)
- Authentication details (provider, OAuth IDs)
- Health profile (date of birth, gender, blood type)
- Medical conditions
- Allergies
- Medications
- Vital signs
- Appointments
- Lab results
- AI-generated summaries

## Authentication Flow

1. User clicks "Continue with Google" on the Login page
2. User is redirected to Google OAuth
3. After successful authentication, Google redirects back with user data
4. Backend creates a JWT token and redirects to frontend with token
5. Frontend stores token in localStorage and sets up axios with the token
6. User is now authenticated and can access protected routes

## AI Integration

The application uses OpenAI's API to generate health summaries:

1. User health data is collected from the database
2. Data is formatted and sent to OpenAI API
3. AI generates a summary, insights, and recommendations
4. Results are saved to the user's profile and displayed in the UI

## API Endpoints

### Authentication

- `GET /api/auth/google`: Initiate Google OAuth
- `GET /api/auth/google/callback`: Google OAuth callback
- `GET /api/auth/me`: Get current user
- `POST /api/auth/logout`: Logout

### Health Data

- `GET /api/health/profile`: Get user's health profile
- `PUT /api/health/profile`: Update user profile
- `POST /api/health/vitals`: Add vital signs
- `GET /api/health/vitals`: Get vitals history
- `POST /api/health/medications`: Add medication
- `POST /api/health/conditions`: Add medical condition
- `POST /api/health/allergies`: Add allergy

### AI

- `POST /api/ai/summary`: Generate health summary
- `GET /api/ai/summaries`: Get AI summary history

### User

- `GET /api/user/dashboard`: Get dashboard stats and recent activity

## Security Features

- JWT authentication
- CORS configuration
- Helmet for HTTP headers security
- Rate limiting
- Express validator for input validation

## Deployment

The application is containerized using Docker and can be deployed on AWS. The docker-compose.yml file defines the services needed to run the application.

## Current Status and Next Steps

The project has a solid foundation with:
- Authentication system implemented
- Basic UI components and pages created
- Backend API routes defined
- Data models established
- AI integration set up

Next steps could include:
1. Implementing the remaining frontend pages (Vitals, Medications, Conditions)
2. Adding data visualization for health trends
3. Enhancing the AI summary with more detailed insights
4. Adding appointment scheduling functionality
5. Implementing file upload for medical documents
6. Adding mobile responsiveness improvements
7. Setting up comprehensive testing