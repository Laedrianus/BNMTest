# Blocksense Network Info Tracker

A comprehensive tracker for Blocksense network updates, X (Twitter) announcements, and GitHub commits.

## Features

- Track Blocksense website updates
- Monitor X (Twitter) announcements from @blocksense_
- View recent GitHub commits from blocksense-network/blocksense repository
- Real-time data fetching with fallback to mock data
- Responsive design for all devices

## Project Structure
blocksense-tracker/
├── frontend/ # Frontend files (HTML, CSS, JS)
├── backend/ # Backend proxy server (Node.js)
└── README.md # This file


## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd blocksense-tracker

   # Serve frontend files (you can use any static server)
# For example, using Python's built-in server:
cd frontend
python -m http.server 8080

Configure environment variables:
Copy .env.example to .env
Update the values with your X API credentials

npm start
# or for development with auto-restart:
npm run dev

Open the application:
Frontend: http://localhost:8080
Backend API: http://localhost:3000
API Endpoints
X (Twitter) Integration
GET /api/x/tweets/:username - Fetch tweets for a specific user
Example: GET http://localhost:3000/api/x/tweets/blocksense_
Security
The backend server securely stores X API credentials in environment variables, preventing exposure to the frontend.

Development
Frontend Development
The frontend is built with vanilla JavaScript and communicates with the backend proxy for X API calls.

Backend Development
The backend is a Node.js Express server that:

Stores X API credentials securely
Handles CORS
Proxies requests to X API
Returns formatted data to frontend
Contributing
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
License
This project is licensed under the MIT License.

Acknowledgments
Blocksense Network for providing the valuable information
X (Twitter) for their API
GitHub for commit history API

