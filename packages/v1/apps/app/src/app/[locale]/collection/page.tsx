"use client";

import { Suspense } from "react";
import GalleryComponent from "@/components/gallery";
import GallerySkeleton from "@/components/skeletons/gallery-skeleton";
import LoadingCheckWrapper from "@/components/loading-wrap-check";

const Collection = () => {
  return (
    <LoadingCheckWrapper>
      <Suspense fallback={<GallerySkeleton />}>
        <GalleryComponent />
      </Suspense>
    </LoadingCheckWrapper>
  );
};

export default Collection;
