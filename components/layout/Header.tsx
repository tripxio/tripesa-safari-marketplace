"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "/logo.png";
  const whitelabelName =
    process.env.NEXT_PUBLIC_WHITELABEL_NAME || "Tripesa Safari";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Tours", href: "/tours" },
    { name: "Destinations", href: "/destinations" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

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
            <Image
              src={logoUrl}
              alt={`${whitelabelName} Logo`}
              width={isScrolled ? 32 : 40}
              height={isScrolled ? 32 : 40}
            />
            <span className={`text-2xl font-bold ${textColorClass}`}>
              {whitelabelName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${textColorClass} hover:text-orange-500 transition-colors`}
              >
                {link.name}
              </Link>
            ))}
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
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
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t bg-background">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-orange-500 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
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
