"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitInquiry } from "@/lib/services/api";
import type { TourPackage, InquiryRequest } from "@/lib/types";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: TourPackage;
  agencySlug: string;
}

export default function InquiryModal({
  isOpen,
  onClose,
  tour,
  agencySlug,
}: InquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email_address: "",
    phone_number: "",
    no_of_people: 1,
    inquiry_date: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      const inquiryData: InquiryRequest = {
        id: tour.id,
        type: "package",
        phone_number: formData.phone_number,
        full_name: formData.full_name,
        email_address: formData.email_address,
        no_of_people: formData.no_of_people,
        inquiry_date: formData.inquiry_date,
        message: formData.message || undefined,
      };

      await submitInquiry(agencySlug, inquiryData);
      setSubmitSuccess(true);

      // Reset form after successful submission
      setFormData({
        full_name: "",
        email_address: "",
        phone_number: "",
        no_of_people: 1,
        inquiry_date: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit inquiry"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitSuccess(false);
    setSubmitError(null);
    onClose();
  };

  // Get tomorrow's date as minimum inquiry date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (submitSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Inquiry Sent!</DialogTitle>
            <DialogDescription>
              Your inquiry for "{tour.title}" has been sent successfully. The
              tour operator will contact you within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleClose}
              className="bg-green-600 hover:bg-green-700"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Inquiry</DialogTitle>
          <DialogDescription>
            Get in touch with the tour operator for "{tour.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium">
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
            <Label htmlFor="email_address" className="text-sm font-medium">
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
            <Label htmlFor="phone_number" className="text-sm font-medium">
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
            <Label htmlFor="no_of_people" className="text-sm font-medium">
              Number of People *
            </Label>
            <Select
              value={formData.no_of_people.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  no_of_people: parseInt(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of people" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(20)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} {i === 0 ? "person" : "people"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inquiry Date */}
          <div className="space-y-2">
            <Label htmlFor="inquiry_date" className="text-sm font-medium">
              Preferred Travel Date *
            </Label>
            <div className="relative">
              <Input
                id="inquiry_date"
                name="inquiry_date"
                type="date"
                required
                min={minDate}
                value={formData.inquiry_date}
                onChange={handleInputChange}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Additional Message
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Any specific requirements or questions about the tour..."
            />
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {submitError}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? "Sending..." : "Send Inquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
