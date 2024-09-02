import { Suspense } from "react";
import GalleryComponent from "@/components/gallery";
import GallerySkeleton from "@/components/skeletons/gallery-skeleton";

export default function Gallery() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryComponent />
    </Suspense>
  );
}
