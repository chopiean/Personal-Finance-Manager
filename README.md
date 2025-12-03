##  📘 Personal-Finance-Manager 

A modern full-stack budgeting and personal finance tool built with Spring Boot, React (Vite + TypeScript), JWT Authentication, CSV Import/Export, and a clean Apple-inspired UI.

## 🚀 Features 

## 🔐 User Authentication 

- Register / Login
- JWT-based authentication
- Secure API access with token

## 💰 Accounts 

- Create multiple accounts (Cash, Bank, Savings, etc.)
- Each transaction belongs to an account
- Real-time balances per account

## 💸 Transactions 

- Add incomes & expenses
- Categorized spending
- View recent transactions
- Sorted by newest first

## 📊 Dashboard Overview 

- Displays:
  - Total Balance
  - Income (this month)
  - Expense (this month)
  - Savings Rate 
- Automatically update after adding transactions.

## 🧾 CSV Import & Export 

- Import transactions from CSV file
- Export all transactions to CSV
- Supports multipart/form-data upload
- Automatic backend validation

## 🌐 Deployment Ready 

- Backend deployed to Railway
- Frontend deployed to Vercel
- Fully configured CORS + security
- Environment-based API switching

## 🏗️ Tech Stack 

**Backend (Java + Spring Boot)**
- Spring Boot 3
- Spring Security (JWT)
- Spring Data JPA
- H2 / PostgreSQL
- Lombok
- Maven
- Railway deployment

**Frontend (Typescript + React)**
- Vite
- React
- Typescript
- Modern UI components
- Fetch wrapper with JWT
- Vercel deployment

## ⚙️ Backend Setup 
**Install dependencies**

cd backend
mvn clean install

**Run the backend**
mvn spring-boot:run

Default profiles: 
- local -> uses H2 in-memory DB
- prod -> Railway PostgreSQL

## 🌐 Frontend Setup 
**Install dependencies**

cd frontend
npm install

**Start development server**

npm run dev

## 🛡️ Security Configuration Highlights 

- JWT filter
- CORS with allowed origin patterns
- Multipart upload support
- /api/csv/** secured
- /api/auth/** open

## 📸 Dashboard View

 <img width="1911" height="940" alt="image" src="https://github.com/user-attachments/assets/d6e0a69b-235b-468c-be38-01cad5273ace" />

## 👨‍💻 Author

- An Le
- 🎓 Haaga-Helia University of Applied Sciences
- 📧 an.le@myy.haaga-helia.fi
- 💻 Course: Backend Development — Personal Finance Manager Project
