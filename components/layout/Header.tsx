"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const textColorClass =
    isHomePage && !isScrolled ? "text-white" : "text-foreground";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? "bg-background/95 backdrop-blur border-b"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image
                src="/logo.png"
                alt="Tripesa Logo"
                width={32}
                height={32}
              />
            </div>
            <span className={`text-2xl font-bold ${textColorClass}`}>
              Tripesa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/tours"
              className={`${textColorClass} hover:text-orange-500 transition-colors`}
            >
              Tours
            </Link>
            <Link
              href="/destinations"
              className={`${textColorClass} hover:text-orange-500 transition-colors`}
            >
              Destinations
            </Link>
            <Link
              href="/about"
              className={`${textColorClass} hover:text-orange-500 transition-colors`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`${textColorClass} hover:text-orange-500 transition-colors`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <User
                className={`h-5 w-5 ${
                  isHomePage && !isScrolled ? "text-white" : ""
                }`}
              />
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X
                  className={`h-5 w-5 ${
                    isHomePage && !isScrolled ? "text-white" : ""
                  }`}
                />
              ) : (
                <Menu
                  className={`h-5 w-5 ${
                    isHomePage && !isScrolled ? "text-white" : ""
                  }`}
                />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t bg-background">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/tours"
                className="text-foreground hover:text-orange-500 transition-colors"
              >
                Tours
              </Link>
              <Link
                href="/destinations"
                className="text-foreground hover:text-orange-500 transition-colors"
              >
                Destinations
              </Link>
              <Link
                href="/about"
                className="text-foreground hover:text-orange-500 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-foreground hover:text-orange-500 transition-colors"
              >
                Contact
              </Link>
              <div className="flex items-center space-x-4 pt-4">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
