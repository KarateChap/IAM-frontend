import { useState } from "react";
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
import { useRegister } from "@/hooks/useAuth";
import type { RegisterRequest } from "@/types";
import { AxiosError } from "axios";
import {
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  UserPlus,
  Shield,
  Server,
  WifiOff,
  Clock,
  User,
  Mail,
} from "lucide-react";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [errorTitle, setErrorTitle] = useState<string>('')
  const [errorType, setErrorType] = useState<'auth' | 'network' | 'server' | 'validation' | 'general'>('general')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const registerMutation = useRegister()

  // Helper function to render appropriate icon based on error type
  const renderErrorIcon = () => {
    switch (errorType) {
      case 'auth':
        return <Shield className="h-4 w-4" />
      case 'network':
        return <WifiOff className="h-4 w-4" />
      case 'server':
        return <Server className="h-4 w-4" />
      case 'validation':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  // Helper function to parse error and set appropriate state
  const handleError = (err: unknown) => {
    console.log('Registration error:', err)
    
    // Clear password field on error for security
    form.setValue('password', '')
    
    if (err instanceof AxiosError) {
      const status = err.response?.status
      const backendMessage = err.response?.data?.message
      
      console.log('Error status:', status)
      console.log('Backend message:', backendMessage)
      
      switch (status) {
        case 409:
          if (backendMessage?.toLowerCase().includes('email')) {
            setErrorType('validation')
            setErrorTitle('Email Already Exists')
            setError('An account with this email address already exists. Please use a different email or try signing in instead.')
          } else if (backendMessage?.toLowerCase().includes('username')) {
            setErrorType('validation')
            setErrorTitle('Username Already Taken')
            setError('This username is already taken. Please choose a different username.')
          } else {
            setErrorType('validation')
            setErrorTitle('Account Already Exists')
            setError('An account with these details already exists. Please check your information or try signing in.')
          }
          break
        case 422:
          setErrorType('validation')
          setErrorTitle('Invalid Information')
          setError(backendMessage || 'Please check your information and try again. Make sure all fields are filled correctly.')
          break
        case 429:
          setErrorType('server')
          setErrorTitle('Too Many Attempts')
          setError('Too many registration attempts. Please wait a few minutes before trying again.')
          break
        case 500:
        case 502:
        case 503:
          setErrorType('server')
          setErrorTitle('Server Error')
          setError('Our servers are experiencing issues. Please try again in a few moments or contact support if the problem persists.')
          break
        default:
          if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
            setErrorType('network')
            setErrorTitle('Connection Problem')
            setError('Unable to connect to our servers. Please check your internet connection and try again.')
          } else {
            setErrorType('general')
            setErrorTitle('Registration Failed')
            setError(backendMessage || 'Something went wrong during registration. Please try again.')
          }
      }
    } else if (err instanceof Error) {
      setErrorType('general')
      setErrorTitle('Registration Failed')
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } else {
      setErrorType('general')
      setErrorTitle('Registration Failed')
      setError('An unexpected error occurred. Please try again.')
    }
  }

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    // Prevent multiple simultaneous submissions
    if (registerMutation.isPending) return
    
    setError(null)
    setErrorTitle('')
    setErrorType('general')

    try {
      await registerMutation.mutateAsync(data as RegisterRequest)
      // Navigate to dashboard (Redux state is handled by the hook)
      navigate('/dashboard')
    } catch (err: unknown) {
      handleError(err)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-[#d4943d] via-[#e6a55a] to-[#f2b878] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center mb-8">
            <Building2 className="h-10 w-10 mr-3" />
            <h1 className="text-3xl font-bold">IAM System</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Join Our
            <br />
            <span className="text-amber-200">Secure Platform</span>
          </h2>
          <p className="text-xl text-amber-100 mb-8 leading-relaxed">
            Create your account and get instant access to enterprise-grade identity and access management tools.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <UserPlus className="h-5 w-5 mr-3 text-amber-200" />
              <span className="text-amber-100">Quick Setup Process</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-amber-200" />
              <span className="text-amber-100">Secure by Default</span>
            </div>
            <div className="flex items-center">
              <Server className="h-5 w-5 mr-3 text-amber-200" />
              <span className="text-amber-100">Enterprise Ready</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      </div>

      {/* Right side - Register form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="space-y-1 pb-8">
            <div className="flex items-center justify-center mb-6 lg:hidden">
              <Building2 className="h-8 w-8 mr-2 text-primary" />
              <span className="text-2xl font-bold">IAM System</span>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Enter your information to get started
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel
                        className={
                          fieldState.error
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : ""
                        }
                      >
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          {...field}
                          disabled={registerMutation.isPending}
                          className={
                            fieldState.error
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-700 dark:focus:border-red-500"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel
                        className={
                          fieldState.error
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : ""
                        }
                      >
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          {...field}
                          disabled={registerMutation.isPending}
                          className={
                            fieldState.error
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-700 dark:focus:border-red-500"
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel
                      className={
                        fieldState.error
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : ""
                      }
                    >
                      Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          disabled={registerMutation.isPending}
                          className={`pl-10 ${
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
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel
                      className={
                        fieldState.error
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : ""
                      }
                    >
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                          disabled={registerMutation.isPending}
                          className={`pl-10 ${
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
                        fieldState.error
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : ""
                      }
                    >
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          disabled={registerMutation.isPending}
                          className={`pr-10 ${
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
                          disabled={registerMutation.isPending}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
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
                    {renderErrorIcon()}
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
                className="w-full font-semibold py-3"
                disabled={registerMutation.isPending}
                size="lg"
              >
                {registerMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-[#f2b878] hover:text-[#e6a55a] dark:text-[#f2b878] dark:hover:text-[#e6a55a] transition-colors duration-200 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
