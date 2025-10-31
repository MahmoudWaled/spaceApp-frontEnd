import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

export function Profile() {
  const navigate = useNavigate();
  const context = useContext(UserContext);
  const { userData, isLoading, userToken } = context || {};

  useEffect(() => {
    // Wait for loading to finish
    if (isLoading) {
      return;
    }

    // If no token, redirect to login
    if (!userToken) {
      navigate("/login", { replace: true });
      return;
    }

    // If userData is available, redirect to user's profile page
    if (userData?.id) {
      navigate(`/profile/${userData.id}`, { replace: true });
      return;
    }

    // If we have token but no userData yet, it might still be loading
    // This shouldn't happen normally, but just in case
    if (userToken && !userData) {
      // Give it a moment, the UserContext might still be fetching
      const timeout = setTimeout(() => {
        // If still no userData after timeout, go to login
        if (!userData) {
          navigate("/login", { replace: true });
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [userData, isLoading, userToken, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
        </div>
      </div>
    );
  }

  return null; // Don't show anything while redirecting
}
