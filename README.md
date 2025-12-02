
# CivicVoice

A comprehensive civic complaint management platform that enables citizens to report issues, track resolutions, and interact with government departments efficiently.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI library for building interactive user interfaces |
| **Vite** | 5.1.0 | Next-generation frontend build tool |
| **Redux Toolkit** | 2.2.1 | State management |
| **React Router DOM** | 6.22.3 | Client-side routing |
| **Axios** | 1.6.7 | HTTP client for API requests |
| **Leaflet** | 1.9.4 | Interactive maps |
| **React-Leaflet** | 4.2.1 | React components for Leaflet maps |
| **Lucide React** | 0.263.1 | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ LTS | JavaScript runtime |
| **Express** | 4.19.2 | Web application framework |
| **MongoDB** | 6.0+ | NoSQL database |
| **Mongoose** | 8.5.1 | MongoDB object modeling |
| **OpenAI API** | 6.9.1 | AI-powered text processing |
| **JWT** | 9.0.2 | Authentication tokens |
| **Bcrypt.js** | 2.4.3 | Password hashing |
| **Multer** | 1.4.5 | File upload handling |

### Development Tools
| Tool | Purpose |
|------|---------|
| **Nodemon** | Auto-restart server during development |
| **Vite Plugin React SWC** | Fast React compilation |

---

## 💻 Hardware Requirements

### Minimum Requirements
| Component | Specification |
|-----------|---------------|
| **Processor** | Dual-core 2.0 GHz or equivalent |
| **RAM** | 4 GB |
| **Storage** | 2 GB free disk space |
| **OS** | Windows 10, macOS 10.15+, or Ubuntu 20.04+ |
| **Network** | Internet connection for API calls |

### Recommended Requirements
| Component | Specification |
|-----------|---------------|
| **Processor** | Quad-core 2.5 GHz or better |
| **RAM** | 8 GB or more |
| **Storage** | 5 GB SSD |
| **OS** | Latest stable version of Windows, macOS, or Linux |
| **Network** | Broadband internet connection |

---

## 🚀 Step-by-Step Local Hosting Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

#### 1. Node.js (v18 or higher)
```bash
# Check if Node.js is installed
node --version

# If not installed, download from https://nodejs.org/
# Or use nvm (Node Version Manager):
nvm install 18
nvm use 18
```

#### 2. MongoDB (v6.0 or higher)
```bash
# Option A: Install MongoDB locally
# Download from https://www.mongodb.com/try/download/community

# Option B: Use MongoDB Atlas (cloud)
# Create free account at https://www.mongodb.com/atlas

# Verify MongoDB is running
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

#### 3. Git
```bash
# Check if Git is installed
git --version

# If not installed, download from https://git-scm.com/
```

---

### Installation Steps

#### Step 1: Clone the Repository
```bash
git clone https://github.com/varunmodi18/civicvoice.git
cd civicvoice
```

#### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Step 3: Configure Environment Variables

Edit the `.env` file with your settings:

```env
# MongoDB Connection String
# Local MongoDB:
MONGO_URI=mongodb://127.0.0.1:27017/civicvoice
# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/civicvoice

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server Port
PORT=4000

# Allowed Frontend Origins (comma-separated)
CLIENT_ORIGINS=http://localhost:5173,http://localhost:5174

# OpenAI API Key (required for AI text processing)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

> **Note**: Get your OpenAI API key from https://platform.openai.com/api-keys

#### Step 4: Seed the Database

```bash
# Still in backend directory
npm run seed
```

This creates:
- Admin account
- Sample citizen accounts
- Department accounts
- Initial departments

#### Step 5: Start the Backend Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

The backend server will start at `http://localhost:4000`

#### Step 6: Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

#### Step 7: Start the Frontend Development Server

```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

---

### 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@civicvoice.local | Admin@123 |
| **Citizen 1** | citizen1@civicvoice.local | Citizen@123 |
| **Citizen 2** | citizen2@civicvoice.local | Citizen@123 |
| **Citizen 3** | citizen3@civicvoice.local | Citizen@123 |
| **Roads Dept** | roads@civicvoice.local | Dept@123 |
| **Water Dept** | water@civicvoice.local | Dept@123 |
| **Power Dept** | power@civicvoice.local | Dept@123 |

---

### 📁 Project Structure

```
civicvoice/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, CORS, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── seed/            # Database seeding
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── uploads/             # File uploads storage
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature modules (auth, admin, etc.)
│   │   ├── lib/             # API client, utilities
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS files
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── store.js         # Redux store
│   ├── index.html
│   ├── vite.config.mts
│   └── package.json
│
└── README.md
```

---

### 🔧 Troubleshooting

#### MongoDB Connection Issues
```bash
# Ensure MongoDB service is running
# On Linux/macOS:
sudo systemctl start mongod

# On Windows (as Administrator):
net start MongoDB
```

#### Port Already in Use
```bash
# Kill process on port 4000 (backend)
npx kill-port 4000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

#### OpenAI API Errors
- Verify your API key is valid
- Check you have sufficient credits
- Ensure the key has proper permissions

#### CORS Errors
- Verify `CLIENT_ORIGINS` in `.env` matches your frontend URL
- Clear browser cache and cookies

---

### 🌐 Production Deployment

For production deployment:

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Set production environment variables**:
   - Use strong `JWT_SECRET`
   - Configure `MONGO_URI` for production database
   - Update `CLIENT_ORIGINS` for production domain

3. **Serve the backend**:
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

4. **Recommended hosting platforms**:
   - **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
   - **Backend**: Railway, Render, AWS EC2, DigitalOcean
   - **Database**: MongoDB Atlas

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 🏗️ Solution Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND                                       │
│                              (React + Vite)                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Citizen    │  │    Admin     │  │  Department  │  │  Dashboard   │         │
│  │   Portal     │  │   Portal     │  │   Portal     │  │   (Public)   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                 │                  │
│         └─────────────────┴─────────────────┴─────────────────┘                  │
│                                     │                                            │
│                          ┌──────────┴──────────┐                                 │
│                          │    Redux Store      │                                 │
│                          │  (State Management) │                                 │
│                          └──────────┬──────────┘                                 │
│                                     │                                            │
│                          ┌──────────┴──────────┐                                 │
│                          │    Axios Client     │                                 │
│                          │   (HTTP Requests)   │                                 │
│                          └──────────┬──────────┘                                 │
└─────────────────────────────────────┼───────────────────────────────────────────┘
                                      │
                            HTTPS (REST API)
                                      │
┌─────────────────────────────────────┼───────────────────────────────────────────┐
│                                 BACKEND                                          │
│                          (Node.js + Express)                                     │
│                                     │                                            │
│                          ┌──────────┴──────────┐                                 │
│                          │   Express Router    │                                 │
│                          └──────────┬──────────┘                                 │
│                                     │                                            │
│         ┌───────────────────────────┼───────────────────────────┐               │
│         │                           │                           │               │
│  ┌──────┴──────┐           ┌────────┴────────┐         ┌────────┴────────┐      │
│  │    Auth     │           │     Issues      │         │     Alerts      │      │
│  │  Middleware │           │   Controller    │         │   Controller    │      │
│  │   (JWT)     │           └────────┬────────┘         └────────┬────────┘      │
│  └──────┬──────┘                    │                           │               │
│         │                           │                           │               │
│         │              ┌────────────┴────────────┐               │               │
│         │              │                         │               │               │
│         │       ┌──────┴──────┐          ┌───────┴───────┐       │               │
│         │       │   Multer    │          │   OpenAI API  │       │               │
│         │       │(File Upload)│          │ (AI Processing│       │               │
│         │       └──────┬──────┘          └───────┬───────┘       │               │
│         │              │                         │               │               │
│         └──────────────┼─────────────────────────┼───────────────┘               │
│                        │                         │                               │
│              ┌─────────┴─────────┐               │                               │
│              │  Local Storage    │               │                               │
│              │   (/uploads)      │               │                               │
│              └───────────────────┘               │                               │
│                                                  │                               │
│                          ┌───────────────────────┘                               │
│                          │                                                       │
│                 ┌────────┴────────┐                                              │
│                 │    Mongoose     │                                              │
│                 │      ODM        │                                              │
│                 └────────┬────────┘                                              │
└──────────────────────────┼──────────────────────────────────────────────────────┘
                           │
                    MongoDB Protocol
                           │
┌──────────────────────────┼──────────────────────────────────────────────────────┐
│                       DATABASE                                                   │
│                       (MongoDB)                                                  │
│                          │                                                       │
│    ┌─────────────────────┼─────────────────────┐                                │
│    │                     │                     │                                │
│ ┌──┴───┐  ┌──────┐  ┌────┴────┐  ┌─────────┐  ┌┴──────┐                         │
│ │Users │  │Issues│  │Departments│ │ Alerts │  │Sessions│                        │
│ └──────┘  └──────┘  └──────────┘  └─────────┘  └───────┘                         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Component Connections Summary

| From | To | Connection Type | Purpose |
|------|----|-----------------|---------|
| Frontend Portals | Redux Store | Internal State | Centralized state management |
| Redux Store | Axios Client | Function Calls | Trigger API requests |
| Axios Client | Express Router | HTTPS REST API | Client-server communication |
| Express Router | Auth Middleware | Internal | JWT token validation |
| Express Router | Controllers | Internal | Route handling |
| Issues Controller | OpenAI API | HTTPS | AI-powered text extraction |
| Issues Controller | Multer | Internal | Evidence file uploads |
| Multer | Local Storage | File I/O | Store uploaded files |
| Controllers | Mongoose ODM | Internal | Database operations |
| Mongoose ODM | MongoDB | MongoDB Protocol | Data persistence |

### Data Flow

1. **User Interaction** → Frontend captures user input
2. **State Update** → Redux manages application state
3. **API Request** → Axios sends authenticated requests to backend
4. **Authentication** → JWT middleware validates user tokens
5. **Business Logic** → Controllers process requests
6. **AI Processing** → OpenAI extracts structured data from text (General Input)
7. **Data Storage** → Mongoose persists data to MongoDB
8. **Response** → Backend returns JSON response to frontend

---

## 👥 Contributors

- Varun Modi (@varunmodi18)
