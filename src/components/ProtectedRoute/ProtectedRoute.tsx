import { UserContext } from "@/context/UserContext";
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("UserContext must be used within a UserContextProvider");
  const { userToken, isLoading } = context;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return userToken ? children : <Navigate to="/login" />;
}
