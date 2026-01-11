# 🎉 UNIC Club Balha - Village Festival Management App

A full-stack application for managing village festivals, contributions, and expenses with Hindi/English language support.

![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=springboot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwindcss)

## ✨ Features

- 📱 **Mobile-first** responsive design
- 🌐 **Bilingual** - Hindi & English support
- 🔐 **OTP Authentication** with JWT tokens
- 👥 **Role-based access** (User, Admin, Super Admin)
- 🎪 **Festival Management** - Create, edit, track festivals
- 💰 **Contribution Tracking** - Record and verify donations
- 📊 **Expense Management** - Track festival expenses
- 🖼️ **Photo Gallery** - Upload festival memories
- 🔔 **Notifications** - Keep members informed
- 📈 **Transparency Dashboard** - Public expense tracking

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite + Tailwind CSS 4 |
| **Backend** | Java 17 + Spring Boot 3.2 |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | OTP + JWT |
| **i18n** | react-i18next |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |

## 📂 Project Structure

```
├── unic-club-balha/          # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context (Auth, Theme)
│   │   ├── services/         # API services
│   │   └── locales/          # i18n translations
│   └── ...
│
├── unic-club-backend/        # Spring Boot API
    ├── src/main/java/
    │   └── com/unicclub/backend/
    │       ├── controller/   # REST Controllers
    │       ├── service/      # Business Logic
    │       ├── entity/       # JPA Entities
    │       └── repository/   # Data Access
    └── ...

```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.8+

### Frontend

```bash
cd unic-club-balha

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Backend

```bash
cd unic-club-backend

# Run with H2 (development)
mvn spring-boot:run

# Run with Supabase (production)
mvn spring-boot:run -Dspring.profiles.active=supabase
```

Backend API runs at: `http://localhost:8080`

API Docs: `http://localhost:8080/swagger-ui.html`

## ⚙️ Configuration

### Frontend Environment

Create `unic-club-balha/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

### Backend Environment

Create `unic-club-backend/.env`:

```env
SPRING_PROFILES_ACTIVE=supabase
DATABASE_URL=jdbc:postgresql://db.xxx.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
JWT_SECRET=your-256-bit-secret
```

## 📱 Screenshots

| Home | Festivals | Admin |
|------|-----------|-------|
| Festival list | Contribution form | Dashboard |

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **User** | View festivals, contribute, view own contributions |
| **Admin** | + Manage festivals, verify contributions, add expenses |
| **Super Admin** | + Manage users, delete festivals, change roles |

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP & get token |
| GET | `/api/festivals` | List all festivals |
| POST | `/api/festivals` | Create festival (Admin) |
| GET | `/api/contributions` | User's contributions |
| POST | `/api/contributions` | Add contribution |

Full API docs available at `/swagger-ui.html`


---

**Made with ❤️ for UNIC Club Balha Village**
