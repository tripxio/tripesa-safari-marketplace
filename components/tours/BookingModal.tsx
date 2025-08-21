"use client";

import { useState } from "react";
import {
  Calendar,
  CreditCard,
  User,
  Phone,
  Mail,
  Users,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  submitBooking,
  submitMobileMoneyPayment,
  submitCardPayment,
  createPaymentPayload,
  getPaymentFees,
} from "@/lib/services/api";
import type { TourPackage, BookingRequest, BookingResponse } from "@/lib/types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: TourPackage;
}

export default function BookingModal({
  isOpen,
  onClose,
  tour,
}: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingResponse, setBookingResponse] =
    useState<BookingResponse | null>(null);

  // Payment states
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "mobile" | "card" | null
  >(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFees, setPaymentFees] = useState<any>(null);
  const [isLoadingFees, setIsLoadingFees] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email_address: "",
    phone_number: "",
    number_of_people: 1,
    date: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const bookingData: BookingRequest = {
        package_id: tour.id,
        date: formData.date,
        full_name: formData.full_name,
        email_address: formData.email_address,
        phone_number: formData.phone_number,
        number_of_people: formData.number_of_people,
        with_token: true, // Always request token for payment fees
      };

      const response = await submitBooking(tour.id, bookingData);
      setBookingResponse(response);
      setSubmitSuccess(true);

      // Log successful booking
      console.log("Booking successful:", {
        bookingId: response.id,
        agentToken: response.agent_token,
        totalAmount: response.total_amount,
        currency: response.currency,
      });

      // Reset form after successful submission
      setFormData({
        full_name: "",
        email_address: "",
        phone_number: "",
        number_of_people: 1,
        date: "",
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit booking"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitSuccess(false);
    setSubmitError(null);
    setBookingResponse(null);
    setShowPayment(false);
    setSelectedPaymentMethod(null);
    setPaymentError(null);
    setPaymentSuccess(false);
    onClose();
  };

  const loadPaymentFees = async () => {
    if (!bookingResponse?.agent_token || !bookingResponse.total_amount) return;

    setIsLoadingFees(true);
    try {
      const fees = await getPaymentFees(
        bookingResponse.agent_token,
        "booking",
        bookingResponse.currency || "USD",
        bookingResponse.total_amount,
        "collections"
      );
      setPaymentFees(fees);
      console.log("Payment fees loaded:", fees);
    } catch (error) {
      console.error("Failed to load payment fees:", error);
      // Continue without fees if this fails
    } finally {
      setIsLoadingFees(false);
    }
  };

  const handlePayment = async () => {
    if (
      !bookingResponse?.agent_token ||
      !selectedPaymentMethod ||
      !bookingResponse.total_amount
    ) {
      setPaymentError("Missing payment information. Please try booking again.");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // Create encrypted payment payload
      const encryptedPayload = createPaymentPayload(
        bookingResponse.total_amount,
        bookingResponse.currency || "USD",
        formData.phone_number,
        formData.email_address,
        formData.full_name,
        bookingResponse.id,
        tour.id,
        `Package booking payment for ${tour.title}`,
        tour.agency_id
      );

      console.log("Submitting payment with encrypted payload...");

      let paymentResult;
      if (selectedPaymentMethod === "mobile") {
        paymentResult = await submitMobileMoneyPayment(
          bookingResponse.agent_token,
          encryptedPayload
        );
      } else {
        paymentResult = await submitCardPayment(
          bookingResponse.agent_token,
          encryptedPayload
        );
      }

      console.log("Payment successful:", paymentResult);
      setPaymentSuccess(true);
      setShowPayment(false);
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again."
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Get tomorrow's date as minimum booking date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Payment success state
  if (paymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Payment Successful!
            </DialogTitle>
            <DialogDescription>
              Your booking and payment for "{tour.title}" have been completed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="space-y-2">
                <p>
                  <strong>Booking ID:</strong> {bookingResponse?.id}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {selectedPaymentMethod === "mobile"
                    ? "Mobile Money"
                    : "Card Payment"}
                </p>
                <p>
                  <strong>Status:</strong> Paid
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              You will receive confirmation emails for both your booking and
              payment shortly.
            </p>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Payment selection state
  if (showPayment && bookingResponse) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Choose your payment method to complete your booking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="space-y-2">
                <p>
                  <strong>Booking ID:</strong> {bookingResponse.id}
                </p>
                <p>
                  <strong>Amount to Pay:</strong> {bookingResponse.currency}{" "}
                  {bookingResponse.total_amount}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">
                Select Payment Method:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedPaymentMethod("mobile")}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedPaymentMethod === "mobile"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium">Mobile Money</p>
                  <p className="text-xs text-muted-foreground">MTN, Airtel</p>
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod("card")}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedPaymentMethod === "card"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium">Card Payment</p>
                  <p className="text-xs text-muted-foreground">
                    Visa, Mastercard
                  </p>
                </button>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {paymentError}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPayment(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!selectedPaymentMethod || isProcessingPayment}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {isProcessingPayment ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Booking success state (before payment)
  if (submitSuccess && bookingResponse) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your booking for "{tour.title}" has been successfully submitted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="space-y-2">
                <p>
                  <strong>Booking ID:</strong> {bookingResponse.id}
                </p>
                {bookingResponse.booking_reference && (
                  <p>
                    <strong>Reference:</strong>{" "}
                    {bookingResponse.booking_reference}
                  </p>
                )}
                {bookingResponse.total_amount && (
                  <p>
                    <strong>Total Amount:</strong> {bookingResponse.currency}{" "}
                    {bookingResponse.total_amount}
                  </p>
                )}
                <p>
                  <strong>Status:</strong> {bookingResponse.status}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {bookingResponse.message ||
                "You will receive a confirmation email shortly with further details."}
            </p>

            {bookingResponse.agent_token && bookingResponse.total_amount && (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Complete Later
                </Button>
                <Button
                  onClick={() => {
                    setShowPayment(true);
                    loadPaymentFees();
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Pay Now
                </Button>
              </div>
            )}

            {(!bookingResponse.agent_token ||
              !bookingResponse.total_amount) && (
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            Book Tour
          </DialogTitle>
          <DialogDescription>
            Complete your booking for "{tour.title}"
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {submitError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label
              htmlFor="full_name"
              className="text-sm font-medium flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email_address"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input
              id="email_address"
              name="email_address"
              type="email"
              required
              value={formData.email_address}
              onChange={handleInputChange}
              placeholder="Enter your email address"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label
              htmlFor="phone_number"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              required
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="+1234567890"
            />
          </div>

          {/* Number of People */}
          <div className="space-y-2">
            <Label
              htmlFor="number_of_people"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Number of People *
            </Label>
            <Select
              value={formData.number_of_people.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  number_of_people: parseInt(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(20)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} {i === 0 ? "Person" : "People"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label
              htmlFor="date"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Preferred Date *
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              min={minDate}
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>

          {/* Price Display */}
          {tour.display_price && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm">
                <strong>Price:</strong> {tour.currency?.symbol || "$"}
                {tour.display_price} {tour.currency?.code || "USD"}
                {tour.unit?.name && ` per ${tour.unit.name.toLowerCase()}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Final price may vary based on your selection and additional
                services.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Complete Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
