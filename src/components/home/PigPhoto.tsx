import { useState } from "react";

import { cn } from "@/lib/cn";

interface PigPhotoProps {
  alt?: string;
  className?: string;
}

export function PigPhoto({
  alt = "猪猪头像",
  className,
}: PigPhotoProps) {
  const [source, setSource] = useState("/pig.jpg");

  return (
    <img
      alt={alt}
      className={cn(
        "h-full w-full object-cover object-center",
        className,
      )}
      onError={() => setSource("/pig-placeholder.svg")}
      src={source}
    />
  );
}
