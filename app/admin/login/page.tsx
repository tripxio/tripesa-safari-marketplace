"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import { adminLogin } from "@/lib/firebase/auth";
import { logAdminLogin } from "@/lib/firebase/analytics";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<"initial" | "2fa" | "complete">(
    "initial"
  );
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we've completed the full login flow
    if (loginStep === "complete") {
      router.push("/admin");
    }
  }, [loginStep, router]);

  const getErrorMessage = (error: any): string => {
    const message = error.message || error.code || "";

    // Map Firebase auth errors to user-friendly messages
    if (
      message.includes("Invalid password") ||
      message.includes("auth/wrong-password")
    ) {
      return "Incorrect email or password. Please try again.";
    }
    if (
      message.includes("User not found") ||
      message.includes("auth/user-not-found")
    ) {
      return "No account found with this email address.";
    }
    if (
      message.includes("Too many requests") ||
      message.includes("auth/too-many-requests")
    ) {
      return "Too many failed attempts. Please try again later.";
    }
    if (
      message.includes("Invalid email") ||
      message.includes("auth/invalid-email")
    ) {
      return "Please enter a valid email address.";
    }
    if (
      message.includes("User disabled") ||
      message.includes("auth/user-disabled")
    ) {
      return "This account has been disabled. Please contact support.";
    }
    if (message.includes("2FA code required")) {
      return "Please enter your 2FA code.";
    }
    if (message.includes("Invalid 2FA code")) {
      return "Invalid 2FA code. Please try again.";
    }

    // Default fallback
    return "Login failed. Please check your credentials and try again.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const credentials = {
        email,
        password,
        ...(showTwoFactor && { twoFactorCode }),
      };

      await adminLogin(credentials);
      logAdminLogin(email);
      toast.success("Login successful!");
      setLoginStep("complete");
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.message.includes("2FA code required")) {
        setShowTwoFactor(true);
        setLoginStep("2fa");
        toast.info("Please enter your 2FA code");
      } else if (error.message.includes("Invalid 2FA code")) {
        toast.error("Invalid 2FA code. Please try again.");
        setTwoFactorCode("");
      } else {
        toast.error(getErrorMessage(error));
        // Reset on other errors
        setShowTwoFactor(false);
        setLoginStep("initial");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loginStep === "complete") {
    return null; // Will redirect to admin dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full w-fit">
            <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Login
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to access the Tripesa Safari admin panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tripesa.co"
                required
                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {showTwoFactor && (
              <div>
                <Label
                  htmlFor="twoFactorCode"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Two-Factor Authentication Code
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="twoFactorCode"
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={6}
                    className="pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Contact the system administrator if you need access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
