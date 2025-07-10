"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Heart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Determine header background class based on page and scroll state
  const headerBgClass = isHomePage
    ? isScrolled
      ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
      : "bg-transparent border-b border-transparent"
    : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b";

  // Determine text color class based on page and scroll state
  const textColorClass =
    isHomePage && !isScrolled ? "text-white" : "text-foreground";

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${headerBgClass}`}
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search..." className="pl-10 w-64" />
            </div>
            <Button variant="ghost" size="icon">
              <Heart
                className={`h-5 w-5 ${
                  isHomePage && !isScrolled ? "text-white" : ""
                }`}
              />
            </Button>
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
                  <Heart className="h-5 w-5" />
                </Button>
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
