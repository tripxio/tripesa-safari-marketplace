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

export default function Footer() {
  return (
    <footer className="bg-muted/50 safari-texture border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Tripesa Logo"
                  width={32}
                  height={32}
                />
              </div>
              <span className="text-2xl font-bold">Tripesa</span>
            </div>
            <p className="text-muted-foreground">
              Discover Africa's greatest adventures with our AI-powered safari
              marketplace. Connecting you to unforgettable experiences across
              the continent.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-orange-500 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-orange-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-orange-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/tours"
                className="block text-muted-foreground hover:text-orange-500 transition-colors"
              >
                Browse Tours
              </Link>
              <Link
                href="/destinations"
                className="block text-muted-foreground hover:text-orange-500 transition-colors"
              >
                Destinations
              </Link>
              <Link
                href="/about"
                className="block text-muted-foreground hover:text-orange-500 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-muted-foreground hover:text-orange-500 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Destinations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Popular Destinations</h3>
            <div className="space-y-2">
              <Link
                href="/tours?destination=uganda"
                className="block text-muted-foreground hover:text-orange-500 transition-colors"
              >
                Uganda
              </Link>
              <Link
                href="/tours?destination=tanzania"
                className="block text-muted-foreground hover:text-orange-500 transition-colors"
              >
                Tanzania
              </Link>
              <Link
                href="/tours?destination=kenya"
                className="block text-muted-foreground hover:text-orange-500 transition-colors"
              >
                Kenya
              </Link>
              <Link
                href="/tours?destination=rwanda"
                className="block text-muted-foreground hover:text-orange-500 transition-colors"
              >
                Rwanda
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">info@tripesa.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Tripesa. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-orange-500 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-orange-500 text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
