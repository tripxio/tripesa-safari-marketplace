"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Shield,
  ShieldCheck,
  ShieldX,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllAdminUsers,
  activateAdminUser,
  deactivateAdminUser,
  setupTwoFactor,
  disableTwoFactor,
  AdminUser,
} from "@/lib/firebase/auth";
import { logAdminAction } from "@/lib/firebase/analytics";
import { validateEmail } from "@/lib/utils/email-validation";

// Helper function to format dates safely
const formatDate = (date: any): string => {
  if (!date) return "Unknown";

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }
    return (
      dateObj.toLocaleDateString() +
      " " +
      dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } catch (error) {
    return "Invalid Date";
  }
};

export default function AdminUserManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [emailError, setEmailError] = useState<string>("");
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Create user form state
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "admin" as "admin" | "super-admin",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Email validation effect
  useEffect(() => {
    if (newUser.email) {
      if (!validateEmail(newUser.email)) {
        setEmailError("Please enter a valid email address");
        setEmailExists(null);
      } else {
        setEmailError("");
        // Check if email exists (debounced)
        const timeoutId = setTimeout(() => {
          checkEmailExists(newUser.email);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timeoutId);
      }
    } else {
      setEmailError("");
      setEmailExists(null);
    }
  }, [newUser.email]);

  // Check if email exists
  const checkEmailExists = async (email: string) => {
    if (!validateEmail(email)) return;

    setIsCheckingEmail(true);
    try {
      const response = await fetch("/api/admin/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailExists(data.exists);
        if (data.exists) {
          setEmailError("An admin user with this email address already exists");
        } else {
          setEmailError("");
        }
      } else {
        console.error("Error checking email:", data.error);
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const adminUsers = await getAllAdminUsers();
      setUsers(adminUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load admin users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!validateEmail(newUser.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!newUser.name.trim()) {
      toast.error("Please enter a valid name");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        logAdminAction("create_user", newUser.email);
        toast.success("Admin user created successfully!", {
          description: `An email with login credentials has been sent to ${newUser.email}`,
        });

        // Reset form
        setNewUser({
          email: "",
          name: "",
          role: "admin",
        });
        setShowCreateForm(false);
        setEmailError("");

        // Reload users
        await loadUsers();
      } else {
        toast.error(data.error || "Failed to create admin user");
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create admin user");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    try {
      const action = user.isActive ? "deactivate" : "activate";

      const response = await fetch("/api/admin/manage-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        logAdminAction(
          action === "deactivate" ? "deactivate_user" : "activate_user",
          user.email
        );
        toast.success(
          action === "deactivate"
            ? "User deactivated successfully"
            : "User activated successfully"
        );
        await loadUsers();
      } else {
        toast.error(data.error || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleToggle2FA = async (user: AdminUser) => {
    try {
      if (user.twoFactorEnabled) {
        await disableTwoFactor(user.uid);
        logAdminAction("disable_2fa", user.email);
        toast.success("2FA disabled successfully");
      } else {
        const { secret, qrCode } = await setupTwoFactor(user.uid);
        logAdminAction("enable_2fa", user.email);
        toast.success("2FA enabled successfully");
        // You could show the QR code to the admin here
      }
      await loadUsers();
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      toast.error("Failed to update 2FA status");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Users
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading admin users...
          </p>
        </div>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Users
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage admin users and their permissions.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Admin User
        </Button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Create New Admin User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="John Doe"
                    required
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="admin@tripesa.co"
                      required
                      className={`mt-1 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        newUser.email && !emailError && emailExists === false
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                          : emailError
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {newUser.email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isCheckingEmail ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        ) : emailError ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : emailExists === false ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : emailExists === true ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                      <AlertCircle className="h-4 w-4 inline-block mr-1" />
                      {emailError}
                    </p>
                  )}
                  {newUser.email && !emailError && emailExists === false && (
                    <p className="mt-1 text-sm text-green-500 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 inline-block mr-1" />
                      Email is available
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Role
                  </Label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value as "admin" | "super-admin",
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    aria-label="Select user role"
                  >
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={
                    isCreating ||
                    !!emailError ||
                    !newUser.name.trim() ||
                    !newUser.email.trim() ||
                    emailExists === true ||
                    isCheckingEmail
                  }
                >
                  {isCreating ? "Creating..." : "Create User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEmailError("");
                    setEmailExists(null);
                    setNewUser({
                      email: "",
                      name: "",
                      role: "admin",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <Users className="h-5 w-5 mr-2" />
            Admin Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.uid}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  user.isActive
                    ? "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 opacity-60"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    {user.role === "super-admin" ? (
                      <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </h3>
                      <Badge
                        variant={
                          user.role === "super-admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                      {user.twoFactorEnabled && (
                        <Badge
                          variant="outline"
                          className="text-green-600 dark:text-green-400"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          2FA
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Created: {formatDate(user.createdAt)}
                      {user.lastLogin && (
                        <span className="ml-2">
                          • Last login: {formatDate(user.lastLogin)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleUserStatus(user)}
                  >
                    {user.isActive ? (
                      <>
                        <ShieldX className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle2FA(user)}
                  >
                    {user.twoFactorEnabled ? (
                      <>
                        <Unlock className="h-4 w-4 mr-1" />
                        Disable 2FA
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        Enable 2FA
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No admin users found
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
