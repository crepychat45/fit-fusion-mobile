import React, { useState, useRef, useEffect } from "react";
import { ImageOptimizer } from "@/utils/image-optimizer";
import { cn } from "@/lib/utils";

interface EnhancedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  lazy?: boolean;
  placeholder?: boolean;
  optimized?: boolean;
  width?: number;
  height?: number;
}

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  fallbackSrc = "/placeholder.svg",
  lazy = true,
  placeholder = true,
  optimized = true,
  width,
  height,
  className,
  alt = "",
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(!lazy);

  useEffect(() => {
    if (!lazy) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.01,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  useEffect(() => {
    if (!isInView) return;

    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        let imageUrl = src;

        if (optimized && src && !src.startsWith("/placeholder.svg")) {
          imageUrl = ImageOptimizer.getOptimizedImageUrl(src, width, height);
        }

        // Validate image exists
        const isValid = await ImageOptimizer.validateImageUrl(imageUrl);

        if (isValid) {
          setImageSrc(imageUrl);
        } else {
          throw new Error("Image failed to load");
        }

        setIsLoading(false);
      } catch (error) {
        console.warn("Image failed to load:", src, error);
        setHasError(true);
        setImageSrc(fallbackSrc);
        setIsLoading(false);
      }
    };

    loadImage();
  }, [isInView, src, fallbackSrc, optimized, width, height]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  // Generate placeholder while loading
  const placeholderSrc =
    placeholder && width && height
      ? ImageOptimizer.createPlaceholder(width, height)
      : fallbackSrc;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && placeholder && (
        <div
          className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      )}

      <img
        ref={imgRef}
        src={isInView ? imageSrc : placeholderSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
        loading={lazy ? "lazy" : "eager"}
        {...props}
      />
    </div>
  );
};
