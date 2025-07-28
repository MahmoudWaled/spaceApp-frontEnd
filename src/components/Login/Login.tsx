import { login } from "@/api/authApi";
import { UserContext } from "@/context/UserContext";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { forgotPassword } from "@/api/authApi";
import { getProfile } from "@/api/userApi";
import { jwtDecode } from "jwt-decode";

function ForgotPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await forgotPassword(email);
      setSuccess("If this email exists, a reset link has been sent.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot your password?</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <label htmlFor="forgot-email">Enter your email address</label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="m@example.com"
          />
          {success && <span className="text-green-600 text-sm">{success}</span>}
          {error && <span className="text-red-500 text-sm">{error}</span>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const context = useContext(UserContext);

  if (!context) {
    throw new Error("UserContext must be used within a UserContextProvider");
  }

  const { setUserToken, setUserData } = context;

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("please enter valid email")
      .required("email is required"),
    password: Yup.string().required("password is required"),
  });

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: handelLogin,
  });

  async function handelLogin(values: { email: string; password: string }) {
    await login(values)
      .then(async (apiResponse) => {
        setError(null);
        console.log("Logged in ✅");
        console.log(apiResponse);
        localStorage.setItem("token", apiResponse.token);
        setUserToken(apiResponse.token);
        // Fetch and set userData immediately after login
        try {
          const decoded = jwtDecode<{ id: string }>(apiResponse.token);
          const profile = await getProfile(decoded.id);
          setUserData({
            name: profile.name,
            username: profile.username,
            email: profile.email,
            id: decoded.id,
            avatar: profile.profileImage || "",
          });
        } catch (e) {
          setUserData(null);
        }
        navigate("/home");
      })
      .catch((apiResponse) => {
        setError(apiResponse.response?.data?.message || "Login failed");
        console.log(error);
      });
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl mb-3">
            Welcome to <span className="font-bold text-3xl">Space </span>{" "}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </div>
            </div>

            <div className="after:border-border my-3 relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-card text-muted-foreground relative z-10 px-2">
                Or continue with
              </span>
            </div>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={cn(
                    "",
                    formik.touched.email &&
                      formik.errors.email &&
                      "border-red-500"
                  )}
                />
                {formik.touched.email && formik.errors.email && (
                  <span className="text-red-500">{formik.errors.email}</span>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="ml-auto text-sm underline-offset-4 hover:underline text-blue-600"
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={cn(
                    "",
                    formik.touched.password &&
                      formik.errors.password &&
                      "border-red-500"
                  )}
                />
                {formik.touched.email && formik.errors.password && (
                  <span className="text-red-500">{formik.errors.password}</span>
                )}

                {error ? <span className="text-red-500">{error}</span> : null}
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to={"/register"} className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
