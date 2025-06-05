# CNC Web Portal

## Project Overview
The CNC Web Portal is a comprehensive web application designed to streamline and manage partner restaurants. This platform provides a modern interface for managing CNC-related tasks, user authentication, and efficient workflow management.

## Team Information
- **Team Name:** WebWave
- **GitHub Repository:** [Project-CNC-Web-Portal](https://github.com/ThaminduAW/Project-CNC-Web-Portal)
- **Live Deployment:** [CNC Web Portal](https://cnc-web-portal.vercel.app/)

## Technology Stack
- **Frontend:** React.js + VITE
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens)
- **Email Service:** Gmail SMTP

## Environment Setup

### Backend Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
MONGO_URI=add your MONGO_URI here
JWT_SECRET=2ce3d74197fa4459316688d7b56b97a1a1f0d3b8d4784e4cfdf472357f175087
EMAIL_USER=add your EMAIL here
EMAIL_PASS=add your email APP PASSWORD here
```

## Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/ThaminduAW/Project-CNC-Web-Portal.git
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

## Project Structure
```
Project-CNC-Web-Portal/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── public/
└── README.md
```

## Features
- User Authentication and Authorization
- CNC Operation Management
- Real-time Updates
- Email Notifications
- Responsive Design
- Secure Data Management

## Security Guidelines
1. Never commit sensitive information like API keys or credentials
2. Keep the JWT secret key secure and rotate it periodically
3. Use environment variables for all sensitive configurations
4. Implement proper input validation and sanitization
5. Follow secure coding practices and regular security audits

## Contributing Guidelines
1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request
5. Ensure all tests pass
6. Follow the existing code style

## Support
For support and queries, please open an issue in the GitHub repository or contact the development team.

---
*Last updated: [5/06/2025]*
