import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TourCardSkeletonProps {
  viewMode: "grid" | "list";
}

export default function TourCardSkeleton({ viewMode }: TourCardSkeletonProps) {
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <Skeleton className="md:w-80 h-64 md:h-auto" />
          <CardContent className="flex-1 p-6 flex flex-col">
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-4 w-4/5 mb-1" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-6">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <Skeleton className="h-64 w-full" />
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
