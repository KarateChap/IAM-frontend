import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnhancedButton as Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLogin } from "@/hooks/useAuth";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Wifi,
  Server,
  Shield,
  Clock,
  Lock,
  Mail,
  Building2,
} from "lucide-react";
import type { LoginRequest } from "@/types";

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Helper function to render the appropriate error icon
const renderErrorIcon = (
  errorType: "auth" | "validation" | "server" | "network" | "rate-limit"
) => {
  const iconClass = "h-4 w-4 text-red-600 dark:text-red-400 animate-pulse";

  switch (errorType) {
    case "network":
      return <Wifi className={iconClass} />;
    case "server":
      return <Server className={iconClass} />;
    case "rate-limit":
      return <Clock className={iconClass} />;
    case "auth":
      return <Shield className={iconClass} />;
    case "validation":
    default:
      return <AlertCircle className={iconClass} />;
  }
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string>("Login Failed");
  const [errorType, setErrorType] = useState<
    "auth" | "validation" | "server" | "network" | "rate-limit"
  >("auth");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      // Prevent multiple submissions
      if (loginMutation.isPending) return;

      setError(null);
      setErrorTitle("Login Failed");
      setErrorType("auth");

      try {
        await loginMutation.mutateAsync(data as LoginRequest);
        // Navigate to dashboard (Redux state is handled by the hook)
        navigate("/dashboard", { replace: true });
      } catch (err: unknown) {
        console.error("Login error:", err);
        console.error("Error type:", typeof err);
        console.error("Error instanceof Error:", err instanceof Error);
        if (err && typeof err === "object") {
          console.error("Error keys:", Object.keys(err));
          const errorObj = err as {
            response?: {
              data?: { message?: string; errors?: Record<string, string> };
              status?: number;
            };
            message?: string;
            code?: string;
          };
          console.error("Error response:", errorObj.response);
          console.error("Error message:", errorObj.message);
          console.error("Error status:", errorObj.response?.status);
          console.error("Error data:", errorObj.response?.data);
        }

        let errorMessage = "Something went wrong. Please try again.";
        let errorTitle = "Login Failed";
        let newErrorType:
          | "auth"
          | "validation"
          | "server"
          | "network"
          | "rate-limit" = "auth";

        if (err instanceof Error) {
          // Check if it's an Axios error with response data
          const axiosError = err as {
            message?: string;
            response?: {
              data?: { message?: string; errors?: Record<string, string> };
              status?: number;
            };
          };
          if (axiosError.response?.data?.message) {
            // Extract backend message and handle it appropriately
            const backendMessage = axiosError.response.data.message;
            const statusCode = axiosError.response.status;

            if (
              statusCode === 401 &&
              backendMessage.toLowerCase().includes("invalid email or password")
            ) {
              errorTitle = "Incorrect Credentials";
              errorMessage =
                "The email address or password you entered is incorrect. Please double-check your credentials and try again.";
              newErrorType = "auth";
            } else if (
              statusCode === 401 &&
              backendMessage.toLowerCase().includes("account is deactivated")
            ) {
              errorTitle = "Account Deactivated";
              errorMessage =
                "Your account has been deactivated. Please contact your administrator or support team for assistance.";
              newErrorType = "auth";
            } else {
              errorMessage = backendMessage;
            }
          } else if (
            axiosError.message?.includes("Network Error") ||
            axiosError.message?.includes("ERR_NETWORK")
          ) {
            // Handle network connectivity issues
            errorTitle = "Connection Error";
            errorMessage =
              "Unable to connect to our servers. Please check your internet connection and try again. If you're behind a firewall, contact your IT administrator.";
            newErrorType = "network";
          } else if (axiosError.message?.includes("status code")) {
            // Handle Axios error messages like "Request failed with status code 401"
            const statusCode = axiosError.response?.status;
            if (statusCode === 401) {
              errorTitle = "Incorrect Credentials";
              errorMessage =
                "The email address or password you entered is incorrect. Please double-check your credentials and try again. Make sure Caps Lock is off.";
              newErrorType = "auth";
            } else if (statusCode === 422) {
              errorTitle = "Invalid Input";
              errorMessage =
                "Please check your email format and password requirements, then try again.";
              newErrorType = "validation";
            } else if (statusCode === 429) {
              errorTitle = "Too Many Attempts";
              errorMessage =
                "You've made too many login attempts. Please wait a few minutes before trying again for security reasons.";
              newErrorType = "rate-limit";
            } else if (statusCode && statusCode >= 500) {
              errorTitle = "Server Error";
              errorMessage =
                "Our servers are temporarily unavailable. Please try again in a few minutes. If the problem persists, contact support.";
              newErrorType = "server";
            } else {
              errorMessage = "Something went wrong. Please try again.";
            }
          } else {
            errorMessage = err.message;
          }
        } else if (typeof err === "object" && err !== null) {
          const errorObj = err as {
            response?: {
              data?: { message?: string; errors?: Record<string, string> };
              status?: number;
            };
          };

          const backendMessage = errorObj.response?.data?.message;
          const statusCode = errorObj.response?.status;

          // Handle specific error cases with user-friendly messages
          if (statusCode === 401) {
            if (
              backendMessage
                ?.toLowerCase()
                .includes("invalid email or password")
            ) {
              errorTitle = "Incorrect Credentials";
              errorMessage =
                "The email address or password you entered is incorrect. Please double-check your credentials and try again. Make sure Caps Lock is off.";
              newErrorType = "auth";
            } else if (
              backendMessage?.toLowerCase().includes("account is deactivated")
            ) {
              errorTitle = "Account Deactivated";
              errorMessage =
                "Your account has been deactivated. Please contact your administrator or support team for assistance.";
              newErrorType = "auth";
            } else {
              errorTitle = "Authentication Failed";
              errorMessage =
                "We couldn't verify your credentials. Please check your email and password, then try again.";
              newErrorType = "auth";
            }
          } else if (statusCode === 422) {
            // Validation errors
            errorTitle = "Invalid Input";
            newErrorType = "validation";
            if (errorObj.response?.data?.errors) {
              const errors = Object.values(errorObj.response.data.errors);
              errorMessage =
                errors.length > 0
                  ? `${errors[0]} Please correct this and try again.`
                  : "Please check your input and try again.";
            } else {
              errorMessage =
                backendMessage ||
                "Please check your email format and password requirements, then try again.";
            }
          } else if (statusCode === 429) {
            errorTitle = "Too Many Attempts";
            newErrorType = "rate-limit";
            errorMessage =
              "You've made too many login attempts. Please wait a few minutes before trying again for security reasons.";
          } else if (statusCode && statusCode >= 500) {
            errorTitle = "Server Error";
            newErrorType = "server";
            errorMessage =
              "Our servers are temporarily unavailable. Please try again in a few minutes. If the problem persists, contact support.";
          } else if (statusCode === 0 || !statusCode) {
            errorTitle = "Connection Error";
            newErrorType = "network";
            errorMessage =
              "Unable to connect to our servers. Please check your internet connection and try again. If you're behind a firewall, contact your IT administrator.";
          } else if (backendMessage) {
            errorMessage = backendMessage;
          }
        }

        setError(errorMessage);
        setErrorTitle(errorTitle);
        setErrorType(newErrorType);

        // Reset form password field on error for security
        form.setValue("password", "");
      }
    },
    [loginMutation, navigate, form]
  );

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center mb-8">
            <Building2 className="h-10 w-10 mr-3" />
            <h1 className="text-3xl font-bold">IAM System</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Secure Access
            <br />
            <span className="text-blue-200">Management</span>
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Streamline your identity and access management with enterprise-grade security and intuitive controls.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-blue-200" />
              <span className="text-blue-100">Enterprise Security</span>
            </div>
            <div className="flex items-center">
              <Lock className="h-5 w-5 mr-3 text-blue-200" />
              <span className="text-blue-100">Role-Based Access Control</span>
            </div>
            <div className="flex items-center">
              <Server className="h-5 w-5 mr-3 text-blue-200" />
              <span className="text-blue-100">Centralized Management</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="space-y-1 pb-8">
            <div className="flex items-center justify-center mb-6 lg:hidden">
              <Building2 className="h-8 w-8 mr-2 text-primary" />
              <span className="text-2xl font-bold">IAM System</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel
                      className={
                        fieldState.error ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300 font-medium"
                      }
                    >
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                          disabled={loginMutation.isPending}
                          className={`pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:focus:border-blue-400 ${
                            fieldState.error
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-700 dark:focus:border-red-500"
                              : ""
                          }`}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel
                      className={
                        fieldState.error ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300 font-medium"
                      }
                    >
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          disabled={loginMutation.isPending}
                          className={`pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:focus:border-blue-400 ${
                            fieldState.error
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-700 dark:focus:border-red-500"
                              : ""
                          }`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loginMutation.isPending}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                  </FormItem>
                )}
              />

              {error && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Alert
                    variant="destructive"
                    className="border-red-300 bg-red-50 shadow-sm dark:border-red-800 dark:bg-red-950/20"
                  >
                    {renderErrorIcon(errorType)}
                    <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">
                      {errorTitle}
                    </AlertTitle>
                    <AlertDescription className="text-red-700 dark:text-red-300 font-medium leading-relaxed">
                      {error}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
                disabled={loginMutation.isPending}
                size="lg"
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <p><span className="font-medium">Email:</span> admin@example.com</p>
              <p><span className="font-medium">Password:</span> Admin123!</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
