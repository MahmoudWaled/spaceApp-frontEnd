import  {  useState} from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@/api/authApi";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

export default function Register() {

  const [error, setError] = useState<string[] | null>(null);

  type registerValues = {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    name: string;
    profileImage?: File| null;
  }

  const navigate = useNavigate();
  async function handelRegister(values: registerValues) {
    register(values)
      .then(() => {
        setError(null);
        console.log("registered !");
        navigate("/login");
      })
      .catch((apiResponse) => {
        apiResponse.response?.data?.errors
          ? setError(apiResponse.response?.data?.errors)
          : setError(apiResponse.response?.data?.message);
      });
  }
    

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, "minimum length for username is 3 letters")
      .max(15, "maximum length for username is 15 letters")
      .required("username is required"),
    name: Yup.string()
      .min(3, "minimum length for name is 3 letters")
      .max(30, "maximum length for name is 30 letters")
      .required("name is required"),
    email: Yup.string()
      .email("please enter valid email")
      .required("email is required"),
    password: Yup.string()
      .matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
        "password must be with minimum 8 characters, at least one upper case English letter, one lower case English letter, one number and one special character"
      )
      .required("password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "passwords must match")
      .required("password is required"),
    profileImage: Yup.mixed().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword:"",
      profileImage: null
    },
    validationSchema,
    onSubmit: handelRegister,
  });

  return (
    <>
      <div className={cn("flex flex-col gap-6")}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl mb-5">
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
                    Sign Up with Google
                  </Button>
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <label htmlFor="username">Username</label>
                    <Input
                      id="username"
                      type="text"
                      name="username"
                      placeholder="username"
                      value={formik.values.username}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "border rounded px-3 py-2",
                        formik.touched.username &&
                          formik.errors.username &&
                          "border-red-500 "
                      )}
                    />

                    {formik.touched.username && formik.errors.username && (
                      <span className="text-red-500 text-sm">
                        {formik.errors.username}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <label htmlFor="name">Name</label>
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Joe Schmoe "
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "border rounded px-3 py-2",
                        formik.touched.name &&
                          formik.errors.name &&
                          "border-red-500 "
                      )}
                    />

                    {formik.touched.name && formik.errors.name && (
                      <span className="text-red-500 text-sm">
                        {formik.errors.name}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <label htmlFor="email">Email</label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="m@example.com"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "",
                        formik.touched.email &&
                          formik.errors.email &&
                          "border-red-500 "
                      )}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <span className="text-red-500">
                        {formik.errors.email}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <label htmlFor="password">Password</label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      value={formik.values.password}
                      required
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "",
                        formik.touched.password &&
                          formik.errors.password &&
                          "border-red-500 focus:ring-red-500"
                      )}
                    />

                    {formik.touched.password && formik.errors.password && (
                      <span className="text-red-500">
                        {formik.errors.password}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formik.values.confirmPassword}
                      required
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "",
                        formik.touched.confirmPassword &&
                          formik.errors.confirmPassword &&
                          "border-red-500 focus:ring-red-500"
                      )}
                    />

                    {formik.touched.confirmPassword &&
                      formik.errors.confirmPassword && (
                        <span className="text-red-500">
                          {formik.errors.confirmPassword}
                        </span>
                      )}
                  </div>

                  <div className="peer invalid:border-red-500 invalid:text-red-600 focus:invalid:ring-2  grid w-full max-w-sm items-center gap-3">
                    <label htmlFor="profileImage">Profile image</label>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      name="profileImage"
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file) {
                          formik.setFieldValue("profileImage", file);
                        }
                      }}
                    />
                  </div>
                  {formik.touched.profileImage &&
                    formik.errors.profileImage && (
                      <span className="text-red-500 text-sm">
                        {formik.errors.profileImage}
                      </span>
                    )}
                  {error && (
                    <div className="text-red-500 text-sm space-y-1">
                      {typeof(error)== 'string' ? error :   error.map((e, i) => (
                        <p key={i}>{e}</p>
                      )) }
                    </div>
                  )}
                  <Button type="submit" className="w-full mt-5">
                    Sign Up
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to={"/login"} className="underline underline-offset-4">
                    login
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </>
  );
}
