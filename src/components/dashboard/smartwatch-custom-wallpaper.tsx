import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  Download,
} from "lucide-react";

interface CustomWallpaperProps {
  deviceModel: string;
  onApply: (imageData: string) => void;
  onCancel: () => void;
}

export const CustomWallpaperUploader: React.FC<CustomWallpaperProps> = ({
  deviceModel,
  onApply,
  onCancel,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState([100]);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApply = () => {
    if (selectedImage) {
      // In a real app, this would process the image with the transformations
      onApply(selectedImage);
      toast({
        title: "Wallpaper Applied",
        description: "Your custom wallpaper is now syncing to your device",
      });
    }
  };

  return (
    <div className="space-y-6">
      {!selectedImage ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="rounded-full bg-primary/10 p-6">
                <ImageIcon className="h-12 w-12 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Upload Custom Wallpaper</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Choose an image from your device to use as your watch wallpaper.
                  Recommended size: 400x400px
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-5 w-5" />
                Choose Image
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, or WEBP (max 5MB)
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Preview */}
          <Card>
            <CardContent className="p-6">
              <Label className="mb-4 block">Preview on {deviceModel}</Label>
              <div className="relative mx-auto w-64 h-64 rounded-3xl overflow-hidden bg-black border-4 border-gray-800 shadow-2xl">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${selectedImage})`,
                    backgroundSize: `${scale[0]}%`,
                    backgroundPosition: `${position.x}% ${position.y}%`,
                    transform: `rotate(${rotation}deg)`,
                    transition: "all 0.3s ease",
                  }}
                />
                {/* Watch UI Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                  <div className="text-center">
                    <div className="text-4xl font-bold">12:34</div>
                    <div className="text-sm opacity-80">Monday, Dec 18</div>
                  </div>
                  <div className="flex justify-around text-xs">
                    <div className="text-center">
                      <div className="font-bold">8,432</div>
                      <div className="opacity-60">Steps</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">72</div>
                      <div className="opacity-60">BPM</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardContent className="space-y-6 p-6">
              {/* Zoom */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </Label>
                  <span className="text-sm text-muted-foreground">{scale[0]}%</span>
                </div>
                <Slider
                  value={scale}
                  onValueChange={setScale}
                  min={50}
                  max={200}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Position X */}
              <div className="space-y-2">
                <Label>Horizontal Position</Label>
                <Slider
                  value={[position.x]}
                  onValueChange={([x]) => setPosition({ ...position, x })}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Position Y */}
              <div className="space-y-2">
                <Label>Vertical Position</Label>
                <Slider
                  value={[position.y]}
                  onValueChange={([y]) => setPosition({ ...position, y })}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Rotation */}
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotation
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  className="gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Rotate 90°
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedImage(null)}
              className="flex-1 gap-2"
            >
              <X className="h-4 w-4" />
              Change Image
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 gap-2"
            >
              <Check className="h-4 w-4" />
              Apply Wallpaper
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
