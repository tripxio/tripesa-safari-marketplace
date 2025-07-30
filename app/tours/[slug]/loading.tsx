import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section Skeleton */}
      <div className="relative h-[60vh] md:h-[70vh] bg-gray-300 dark:bg-gray-700 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Skeleton className="h-4 w-4 bg-white/30" />
                  <Skeleton className="h-4 w-24 bg-white/30" />
                </div>
                <Skeleton className="h-8 md:h-12 w-full max-w-md mb-4 bg-white/30" />
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Skeleton className="h-4 w-4 bg-white/30" />
                    <Skeleton className="h-4 w-16 bg-white/30" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Skeleton className="h-4 w-4 bg-white/30" />
                    <Skeleton className="h-4 w-20 bg-white/30" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-3">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-10 w-10 rounded-full bg-white/30" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-8 w-24 mb-1 bg-white/30" />
                  <Skeleton className="h-4 w-20 bg-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4 text-center">
                    <Skeleton className="h-6 w-6 mx-auto mb-2" />
                    <Skeleton className="h-4 w-16 mx-auto mb-1" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabs Skeleton */}
            <Card className="animate-pulse">
              <CardHeader>
                <div className="flex space-x-1 border-b">
                  {["Overview", "Itinerary", "Included", "Gallery"].map(
                    (tab, index) => (
                      <Skeleton key={index} className="h-10 w-20" />
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-lg animate-pulse">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-8 w-24 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-px w-full" />

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full rounded-md" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>

                  <Skeleton className="h-px w-full" />

                  {/* Tour Operator Info */}
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 flex-1 rounded-md" />
                      <Skeleton className="h-8 flex-1 rounded-md" />
                    </div>
                  </div>

                  <Skeleton className="h-px w-full" />

                  {/* Safety & Policies */}
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
