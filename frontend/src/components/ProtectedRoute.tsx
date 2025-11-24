import { Navigate } from "react-router-dom";
import Layout from "./Layout";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const user = localStorage.getItem("user");

  if (!user) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
}
