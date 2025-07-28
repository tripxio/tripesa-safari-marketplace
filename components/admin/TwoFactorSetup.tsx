"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  QrCode,
  Smartphone,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  setupTwoFactor,
  disableTwoFactor,
  verifyAndEnable2FA,
  generateNewBackupCodes,
  getCurrentAdminUser,
  AdminUser,
} from "@/lib/firebase/auth";
import { logAdminAction } from "@/lib/firebase/analytics";

export default function TwoFactorSetup() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCodeData, setQrCodeData] = useState<{
    secret: string;
    qrCode: string;
    backupCodes: Array<{ code: string; used: boolean }>;
  } | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentAdminUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
      toast.error("Failed to load user information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    if (!currentUser) return;

    try {
      setIsSettingUp(true);
      const result = await setupTwoFactor(currentUser.uid);
      setQrCodeData(result);
      logAdminAction("setup_2fa", "initiated");
      toast.success(
        "2FA setup initiated! Scan the QR code with your authenticator app."
      );
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      toast.error("Failed to setup 2FA");
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!currentUser || !qrCodeData || !verificationCode) return;

    try {
      setIsVerifying(true);
      setVerificationError("");

      const isValid = await verifyAndEnable2FA(
        currentUser.uid,
        verificationCode
      );

      if (isValid) {
        setIsVerified(true);
        logAdminAction("verify_2fa", "success");
        toast.success(
          "2FA verification successful! Your account is now protected."
        );

        // Reload user to get updated 2FA status
        await loadCurrentUser();
      } else {
        setVerificationError("Invalid verification code. Please try again.");
        toast.error("Invalid verification code");
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Verification failed";
      setVerificationError(errorMessage);
      toast.error("Failed to verify 2FA code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!currentUser) return;

    try {
      setIsDisabling(true);
      await disableTwoFactor(currentUser.uid);
      logAdminAction("disable_2fa", "success");
      toast.success("2FA has been disabled for your account.");

      // Reset state
      setQrCodeData(null);
      setIsVerified(false);
      setVerificationCode("");

      // Reload user
      await loadCurrentUser();
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast.error("Failed to disable 2FA");
    } finally {
      setIsDisabling(false);
    }
  };

  const handleGenerateNewBackupCodes = async () => {
    if (!currentUser) return;

    try {
      const newCodes = await generateNewBackupCodes(currentUser.uid);
      logAdminAction("generate_backup_codes", "success");
      toast.success("New backup codes generated successfully!");

      // Update the qrCodeData with new backup codes
      if (qrCodeData) {
        setQrCodeData({
          ...qrCodeData,
          backupCodes: newCodes.map((code) => ({ code, used: false })),
        });
      }
    } catch (error) {
      console.error("Error generating new backup codes:", error);
      toast.error("Failed to generate new backup codes");
    }
  };

  const copySecret = () => {
    if (qrCodeData?.secret) {
      navigator.clipboard.writeText(qrCodeData.secret);
      toast.success("Secret key copied to clipboard");
    }
  };

  const downloadQRCode = () => {
    if (qrCodeData?.qrCode) {
      const link = document.createElement("a");
      link.href = qrCodeData.qrCode;
      link.download = "tripesa-2fa-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded");
    }
  };

  const copyBackupCodes = () => {
    if (qrCodeData?.backupCodes) {
      const codesText = qrCodeData.backupCodes
        .map((code) => code.code)
        .join("\n");
      navigator.clipboard.writeText(codesText);
      toast.success("Backup codes copied to clipboard");
    }
  };

  const downloadBackupCodes = () => {
    if (qrCodeData?.backupCodes) {
      const codesText = qrCodeData.backupCodes
        .map((code) => code.code)
        .join("\n");

      const blob = new Blob([codesText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tripesa-backup-codes.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Backup codes downloaded");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Two-Factor Authentication
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Two-Factor Authentication
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add an extra layer of security to your admin account.
        </p>
      </div>

      {/* Current Status */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <Shield className="h-5 w-5 mr-2" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            {currentUser?.twoFactorEnabled ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    2FA is enabled
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-green-600 dark:text-green-400"
                >
                  Protected
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    2FA is disabled
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your account is not protected with two-factor authentication
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-red-600 dark:text-red-400"
                >
                  Unprotected
                </Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup 2FA */}
      {!currentUser?.twoFactorEnabled && !qrCodeData && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Enable Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                How it works:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>
                  • Download an authenticator app (Google Authenticator, Authy,
                  etc.)
                </li>
                <li>• Scan the QR code or enter the secret key manually</li>
                <li>• Enter the 6-digit code from your app to verify</li>
                <li>• You'll need this code every time you log in</li>
              </ul>
            </div>
            <Button
              onClick={handleSetup2FA}
              disabled={isSettingUp}
              className="w-full"
            >
              {isSettingUp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Setting up...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Enable 2FA
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* QR Code Setup */}
      {qrCodeData && !isVerified && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Step 1: Scan QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={qrCodeData.qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={downloadQRCode}>
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Manual Entry (if QR code doesn't work)
              </Label>
              <div className="flex space-x-2">
                <Input
                  value={showSecret ? qrCodeData.secret : "••••••••••••••••"}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" onClick={copySecret}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use this secret key if you can't scan the QR code
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification */}
      {qrCodeData && !isVerified && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Step 2: Verify Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label
                htmlFor="verificationCode"
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                Enter 6-digit code from your authenticator app
              </Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="123456"
                maxLength={6}
                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {verificationError && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                  {verificationError}
                </p>
              )}
            </div>
            <Button
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify and Enable 2FA
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {isVerified && (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-green-200 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Two-Factor Authentication Enabled!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your account is now protected with 2FA. You'll need to enter a
              code from your authenticator app every time you log in.
            </p>
            <Button onClick={() => window.location.reload()}>
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Disable 2FA */}
      {currentUser?.twoFactorEnabled && (
        <Card className="dark:bg-gray-800 dark:border-gray-700 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Disable Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">
                Warning:
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                Disabling 2FA will remove the extra security layer from your
                account. Only do this if you're having trouble with your
                authenticator app.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={isDisabling}
            >
              {isDisabling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Disabling...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Disable 2FA
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes */}
      {qrCodeData && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Backup Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Important:
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                If you lose access to your authenticator app, these backup codes
                can be used to regain access to your account. Please store them
                in a secure location.
              </p>
            </div>

            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={copyBackupCodes}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Backup Codes
              </Button>
              <Button variant="outline" onClick={downloadBackupCodes}>
                <Download className="h-4 w-4 mr-2" />
                Download Backup Codes
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {qrCodeData.backupCodes.map((code, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs font-mono"
                >
                  {code.code}
                </Badge>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleGenerateNewBackupCodes}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Generate New Backup Codes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes Management for Enabled 2FA */}
      {currentUser?.twoFactorEnabled && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Backup Codes Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Backup Codes:
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Generate new backup codes if you've used most of your current
                ones or want to refresh them.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleGenerateNewBackupCodes}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Generate New Backup Codes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Recommended Apps
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Google Authenticator</li>
                <li>• Authy</li>
                <li>• Microsoft Authenticator</li>
                <li>• 1Password</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Troubleshooting
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Make sure your device time is accurate</li>
                <li>• Try manual entry if QR code fails</li>
                <li>• Keep backup codes in a safe place</li>
                <li>• Contact admin if you lose access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
