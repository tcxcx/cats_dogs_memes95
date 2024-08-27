import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Component() {
  return (
    <div className="container mx-auto p-4">
      <Skeleton className="h-9 w-64 mb-6 mx-auto" />
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory" disabled>
            Inventory
          </TabsTrigger>
          <TabsTrigger value="deck" disabled>
            Deck
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <div className="flex flex-wrap gap-4 mb-4">
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="grid p-4 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {[...Array(15)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="deck">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="relative">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-8 w-20 absolute top-2 right-2" />
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <Skeleton className="h-10 w-32" />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
