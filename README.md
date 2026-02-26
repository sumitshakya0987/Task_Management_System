# 🚀 TaskMaster - Premium Task Management System

A full-stack, high-performance Task Management System built with a focus on premium UI/UX, security, and seamless deployment.

![Deployment URL](https://task-management-system-chi-five.vercel.app/) *(Note: Add your own screenshot path here)*

## ✨ Features

- **Premium Dark UI**: Built with a sleek, glassmorphic aesthetic using Tailwind CSS.
- **Secure Authentication**: JWT-based login and registration with Bcrypt password hashing.
- **Real-time Task Management**: Full CRUD operations with instant UI updates.
- **Smart Filtering & Search**: Filter tasks by status (Todo, In Progress, Completed) and search by title.
- **Advanced UX**: Custom confirmation modals, toast notifications, and smooth micro-animations.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop views.
- **Auto-DB Initialization**: Zero-config database setup on deployment via Prisma.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Client**: [Axios](https://axios-http.com/)
- **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [SQLite](https://www.sqlite.org/) (Production-ready on Render)
- **Validation**: [Zod](https://zod.dev/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sumitshakya0987/Task_Management_System.git
   cd Task_Management_System
   ```

2. **Backend Configuration**
   ```bash
   cd backend
   npm install
   # Create a .env file
   echo "DATABASE_URL=\"file:./dev.db\"" > .env
   echo "JWT_SECRET=\"your_super_secret_key\"" >> .env
   echo "REFRESH_TOKEN_SECRET=\"your_other_secret_key\"" >> .env
   # Initialize Database
   npx prisma db push
   # Start Server
   npm run dev
   ```

3. **Frontend Configuration**
   ```bash
   cd ../frontend
   npm install
   # Create a .env.local file
   echo "NEXT_PUBLIC_API_URL=\"http://localhost:5000\"" > .env.local
   # Start App
   npm run dev
   ```

## 🌐 Deployment

### Backend (Render)
1. Link your GitHub repository to [Render](https://render.com/).
2. Set Build Command: `npm install && cd backend && npm run build`
3. Set Start Command: `npm start`
4. Add Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`.

### Frontend (Vercel)
1. Link your GitHub repository to [Vercel](https://vercel.com/).
2. Add Environment Variable: `NEXT_PUBLIC_API_URL` (your Render URL).
3. Deploy!

## 📄 License
This project is licensed under the ISC License.

---
Built with ❤️ by [Sumit Shakya](https://github.com/sumitshakya0987)
