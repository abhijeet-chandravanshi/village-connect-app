# UNIC Club Balha - Backend API

Java Spring Boot backend for the UNIC Club Balha Village Panchayat App.

## 📋 Features

- **Authentication**: OTP-based login with JWT tokens
- **User Management**: Profile management with role-based access
- **Festival Management**: CRUD operations for festivals
- **Contribution System**: Track and verify contributions
- **Expense Tracking**: Record festival expenses
- **Gallery**: Manage festival photos
- **Notifications**: Send notifications to users
- **Admin Dashboard**: Statistics and management tools

## 🛠️ Tech Stack

- **Java 17**
- **Spring Boot 3.2**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA**
- **H2 Database** (Development)
- **PostgreSQL** (Production)
- **Lombok**
- **SpringDoc OpenAPI** (Swagger Documentation)

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+

### Running Locally

```bash
# Clone the repository (if separate)
cd unic-club-backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The server will start at `http://localhost:8080`

### API Documentation

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api-docs

### H2 Console (Development)

- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:unicclub`
- Username: `sa`
- Password: (empty)

## 📚 API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/HEAD/POST | `/actuator/health` | Health check endpoint (accepts any HTTP method) |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP & get token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update profile |
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/search?query=` | Search users |

### Festivals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/festivals` | Get all festivals |
| GET | `/api/festivals/active` | Get active festivals |
| GET | `/api/festivals/{id}` | Get festival by ID |
| GET | `/api/festivals/year/{year}` | Get by year |
| POST | `/api/festivals` | Create festival (Admin) |
| PUT | `/api/festivals/{id}` | Update festival (Admin) |
| DELETE | `/api/festivals/{id}` | Delete festival (Super Admin) |

### Contributions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contributions` | Create contribution |
| GET | `/api/contributions/my` | Get my contributions |
| GET | `/api/contributions/festival/{id}` | Get festival contributions |
| GET | `/api/contributions/pending` | Get pending (Admin) |
| POST | `/api/contributions/{id}/verify` | Verify (Admin) |
| POST | `/api/contributions/{id}/reject` | Reject (Admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get dashboard stats |
| GET | `/api/admin/members` | Get all members |
| PUT | `/api/admin/members/{id}/role` | Update role (Super Admin) |

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Demo Credentials

For testing, use any 10-digit phone number with OTP: **123456**

```json
// Send OTP
POST /api/auth/send-otp
{ "phone": "9876543210" }

// Verify OTP
POST /api/auth/verify-otp
{ "phone": "9876543210", "otp": "123456" }
```

## 🗄️ Database Schema

### Tables
- `users` - User profiles and authentication
- `festivals` - Festival/event information
- `contributions` - User contributions
- `expenses` - Festival expenses
- `gallery_images` - Festival photos
- `notifications` - System notifications
- `notification_reads` - Track read status

## 🌐 Deployment

### Environment Variables (Production)

```env
DATABASE_URL=jdbc:postgresql://host:5432/unicclub
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
JWT_SECRET=your-256-bit-secret-key
```

### Docker (Optional)

```dockerfile
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

UNIC Club Balha Team


