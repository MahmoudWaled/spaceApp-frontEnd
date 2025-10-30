import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "@/api/authApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

// Helper to extract token from /reset-password/:token route
function useResetToken() {
  // Try to get token from params (if using react-router v6 dynamic route)
  const params = useParams<{ token?: string }>();
  // Or fallback to parsing window.location.pathname
  if (params.token) return params.token;
  const match = window.location.pathname.match(/reset-password\/(.+)$/);
  return match ? match[1] : "";
}

export default function ResetPasswordPage() {
  const token = useResetToken();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await resetPassword(token, password);
      setSuccess("Password reset successfully! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center  bg-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-3">
              <label htmlFor="password">New Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter your new password"
              />
            </div>
            {success && (
              <span className="text-green-600 text-sm">{success}</span>
            )}
            {error && <span className="text-red-500 text-sm">{error}</span>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
