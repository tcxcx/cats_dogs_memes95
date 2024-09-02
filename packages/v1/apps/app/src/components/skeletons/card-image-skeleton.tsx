import { Card, CardContent } from "@v1/ui/card";
import { Skeleton } from "@v1/ui/skeleton";
import { AspectRatio } from "@v1/ui/aspect-ratio";

export default function CardSkeleton() {
  return (
    <div className="relative w-64 mx-auto">
      <Card className="relative w-full h-96 bg-gray-200 border-4 border-black rounded-2xl overflow-hidden">
        <CardContent className="px-1 py-1 h-full flex flex-col">
          <Skeleton className="h-8 w-full mb-1" />
          <div className="flex-grow -mb-1 border-2 border-gray-700 flex justify-center items-center">
            <AspectRatio ratio={1} className="bg-gray-300">
              <Skeleton className="w-full h-full" />
            </AspectRatio>
          </div>
          <div className="bg-gray-200 border-2 border-gray-700 px-2 py-1">
            <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
            <div className="flex justify-around mt-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
