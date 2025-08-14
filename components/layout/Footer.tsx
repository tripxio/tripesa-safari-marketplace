import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "/logo.png";
  const whitelabelName =
    process.env.NEXT_PUBLIC_WHITELABEL_NAME || "Tripesa Safari";

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-4 border-t border-gray-700 text-center text-gray-400">
        &copy; {currentYear} {whitelabelName}. All Rights Reserved.
      </div>
    </footer>
  );
}
