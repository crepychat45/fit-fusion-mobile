import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface ChatBackgroundSelectorProps {
  currentBackground: string;
  onBackgroundChange: (background: string) => void;
  onClose: () => void;
}

export function ChatBackgroundSelector({
  currentBackground,
  onBackgroundChange,
  onClose,
}: ChatBackgroundSelectorProps) {
  const backgrounds = [
    {
      id: "default",
      name: "Default",
      style: "bg-background",
      preview: "#ffffff",
    },
    {
      id: "gradient-blue",
      name: "Blue Gradient",
      style: "bg-gradient-to-br from-blue-50 to-blue-100",
      preview: "linear-gradient(to bottom right, #dbeafe, #bfdbfe)",
    },
    {
      id: "gradient-green",
      name: "Green Gradient",
      style: "bg-gradient-to-br from-green-50 to-green-100",
      preview: "linear-gradient(to bottom right, #dcfce7, #bbf7d0)",
    },
    {
      id: "gradient-purple",
      name: "Purple Gradient",
      style: "bg-gradient-to-br from-purple-50 to-purple-100",
      preview: "linear-gradient(to bottom right, #f3e8ff, #ddd6fe)",
    },
    {
      id: "gradient-orange",
      name: "Orange Gradient",
      style: "bg-gradient-to-br from-orange-50 to-orange-100",
      preview: "linear-gradient(to bottom right, #fff7ed, #fed7aa)",
    },
    {
      id: "dark",
      name: "Dark Mode",
      style: "bg-gray-900",
      preview: "#111827",
    },
    {
      id: "pattern-dots",
      name: "Dotted Pattern",
      style: "bg-white",
      preview: "#ffffff",
      pattern: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
      patternSize: "20px 20px",
    },
    {
      id: "pattern-lines",
      name: "Lines Pattern",
      style: "bg-white",
      preview: "#ffffff",
      pattern:
        "repeating-linear-gradient(45deg, transparent, transparent 10px, #f3f4f6 10px, #f3f4f6 20px)",
      patternSize: "auto",
    },
  ];

  const handleBackgroundSelect = (background: any) => {
    let style = background.style;

    if (background.pattern) {
      style += ` [background-image:${background.pattern}] [background-size:${background.patternSize}]`;
    }

    onBackgroundChange(style);
    onClose();
  };

  return (
    <div className="w-96 bg-background border rounded-lg shadow-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Choose Chat Background</h3>
        <p className="text-sm text-muted-foreground">
          Customize your chat appearance
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {backgrounds.map((bg) => (
          <Card
            key={bg.id}
            className={`relative p-3 cursor-pointer transition-all hover:shadow-md ${
              currentBackground.includes(bg.style.split(" ")[0])
                ? "ring-2 ring-primary"
                : ""
            }`}
            onClick={() => handleBackgroundSelect(bg)}
          >
            <div
              className="w-full h-16 rounded mb-2 border"
              style={{
                background: bg.preview,
                backgroundImage: bg.pattern,
                backgroundSize: bg.patternSize,
              }}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{bg.name}</p>
                {bg.id === "default" && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>

              {currentBackground.includes(bg.style.split(" ")[0]) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t">
        <Button variant="outline" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
}
