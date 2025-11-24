import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const loggedIn = localStorage.getItem("username");
  if (!loggedIn) return <Navigate to="/login" replace />;
  return children;
}
