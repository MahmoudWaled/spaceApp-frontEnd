import { UserContext } from "@/context/UserContext";
import React, { useContext} from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
 const context = useContext(UserContext);
  if (!context)
    throw new Error("UserContext must be used within a UserContextProvider");
  const { userToken , isLoading } = context;
  if (isLoading) {
    return <p>Loading...</p>; 
  }
  return userToken ? children : <Navigate to="/login" /> ;
}
