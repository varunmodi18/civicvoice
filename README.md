
# CivicVoice

This bundle contains a small MERN stack project for **CivicVoice**, with a focus on a
clean, animated UI and a simple department workflow for complaints.

## Stack

- **Frontend**: React + Vite, Redux Toolkit, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Auth**: JWT in httpOnly cookies
- **Roles**: citizen, admin, department

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env   # adjust if needed
npm install
npm run seed           # seed admin, citizens, departments
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173.

### Seed logins

- Admin: `admin@civicvoice.local` / `Admin@123`
- Citizens: `citizen1@civicvoice.local` / `Citizen@123` (also 2 and 3)
- Departments: `roads@civicvoice.local`, `water@civicvoice.local`, `power@civicvoice.local` / `Dept@123`

The UI is tuned for:

- **Citizens**: Chat + quick issue form + "My complaints" tracking card.
- **Admins**: Dashboard with status chips, animated cards, and department account management.
- **Departments**: Workflow dashboard with status summaries and timeline-style updates.
