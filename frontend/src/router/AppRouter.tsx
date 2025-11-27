import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import WelcomePage from "../pages/auth/WelcomePage";

import DashboardPage from "../pages/dashboard/DashboardPage";
import AccountsPage from "../pages/accounts/AccountsPage";
import TransactionsPage from "../pages/transactions/TransactionsPage";
import BudgetsPage from "../pages/budgets/BudgetsPage";
import CreateBudgetPage from "../pages/budgets/CreateBudgetPage";
import CsvUploadPage from "../pages/csv/CsvUploadPage";

import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

export default function AppRouter() {
  return (
    <Routes>
      {/* PUBLIC PAGES */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* PROTECTED ROUTES */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="budgets/new" element={<CreateBudgetPage />} />
        <Route path="/csv-upload" element={<CsvUploadPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
