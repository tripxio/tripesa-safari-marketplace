import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Tour Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-muted-foreground">
            <p className="mb-4">
              Sorry, we couldn't find the tour you're looking for. It may have
              been removed, updated, or the URL might be incorrect.
            </p>
            <p>
              Don't worry! We have many other amazing safari experiences waiting
              for you.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <Link href="/tours">
                <Search className="h-4 w-4 mr-2" />
                Browse All Tours
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Need help?{" "}
              <Link href="/contact" className="text-orange-500 hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
