import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  LayoutGrid,
  Ruler,
  Sparkles,
  Type,
  Palette,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/contexts/theme-context";
import { useSettings } from "@/contexts/safe-settings-context";

export function DisplaySettings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const {
    fontSize,
    setFontSize,
    compactView,
    setCompactView,
    displayOptions,
    setDisplayOption,
  } = useSettings();

  const [textSize, setTextSize] = useState(fontSize);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [colorBlindMode, setColorBlindMode] = useState("none");
  const [contrastLevel, setContrastLevel] = useState(50);
  const [isApplyingChange, setIsApplyingChange] = useState(false);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    toast({
      title: `Theme Changed`,
      description: `App theme set to ${newTheme}.`,
    });
  };

  const handleFontSizeChange = (size: "small" | "medium" | "large") => {
    setTextSize(size);
    setFontSize(size);
    toast({
      title: `Font Size Changed`,
      description: `Text size set to ${size}.`,
    });

    // Apply the font size to the document root
    document.documentElement.classList.remove(
      "text-sm",
      "text-base",
      "text-lg",
    );

    switch (size) {
      case "small":
        document.documentElement.classList.add("text-sm");
        break;
      case "medium":
        document.documentElement.classList.add("text-base");
        break;
      case "large":
        document.documentElement.classList.add("text-lg");
        break;
    }
  };

  const handleCompactViewToggle = (checked: boolean) => {
    setCompactView(checked);

    // Simulate applying changes
    setIsApplyingChange(true);
    setTimeout(() => {
      toast({
        title: `${checked ? "Compact" : "Standard"} View Enabled`,
        description: `Layout has been updated.`,
      });
      setIsApplyingChange(false);
    }, 500);
  };

  const handleDisplayOptionToggle = (
    option: keyof typeof displayOptions,
    checked: boolean,
  ) => {
    setDisplayOption(option, checked);
    toast({
      title: `${formatOptionName(option)} ${checked ? "Enabled" : "Disabled"}`,
      description: `Display setting updated successfully.`,
    });
  };

  const formatOptionName = (option: string) => {
    return option
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const handleColorBlindModeChange = (mode: string) => {
    setColorBlindMode(mode);

    // Apply color blind mode
    document.documentElement.classList.remove(
      "color-normal",
      "color-protanopia",
      "color-deuteranopia",
      "color-tritanopia",
    );

    switch (mode) {
      case "protanopia":
        document.documentElement.classList.add("color-protanopia");
        break;
      case "deuteranopia":
        document.documentElement.classList.add("color-deuteranopia");
        break;
      case "tritanopia":
        document.documentElement.classList.add("color-tritanopia");
        break;
      default:
        document.documentElement.classList.add("color-normal");
    }

    toast({
      title: "Accessibility Setting Updated",
      description:
        mode === "none"
          ? "Standard color mode enabled"
          : `Color blind mode: ${mode}`,
    });
  };

  const handleContrastChange = (value: number[]) => {
    const level = value[0];
    setContrastLevel(level);

    // Apply contrast level
    document.documentElement.style.setProperty(
      "--contrast-factor",
      `${level / 50}`,
    );
  };

  const [readingRuler, setReadingRuler] = useState<boolean>(() => {
    try { return localStorage.getItem("fitfusion-reading-ruler") === "1"; } catch { return false; }
  });
  const [density, setDensity] = useState<"cozy" | "comfortable" | "compact">(() => {
    try {
      return (localStorage.getItem("fitfusion-density") as any) || "comfortable";
    } catch { return "comfortable"; }
  });

  useEffect(() => {
    document.documentElement.dataset.density = density;
    try { localStorage.setItem("fitfusion-density", density); } catch { /* noop */ }
  }, [density]);

  useEffect(() => {
    document.documentElement.classList.toggle("reading-ruler", readingRuler);
    try { localStorage.setItem("fitfusion-reading-ruler", readingRuler ? "1" : "0"); } catch { /* noop */ }
  }, [readingRuler]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Display Lab
            <Badge variant="secondary" className="ml-1 text-[10px]">New</Badge>
          </CardTitle>
          <CardDescription>
            Fine-grained controls that layer on top of your theme &amp; accent selection above.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              Interface Density
            </div>
            <div className="flex flex-wrap gap-2">
              {(["cozy", "comfortable", "compact"] as const).map((d) => (
                <Button
                  key={d}
                  variant={density === d ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                  onClick={() => {
                    setDensity(d);
                    toast({ title: "Density updated", description: `Interface set to ${d}.` });
                  }}
                >
                  {d}
                </Button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Adjusts padding across cards, lists, and navigation.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Reading Ruler</p>
                <p className="text-xs text-muted-foreground">
                  Follows your cursor to reduce line-tracking fatigue.
                </p>
              </div>
            </div>
            <Switch checked={readingRuler} onCheckedChange={setReadingRuler} />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              Preferred Font Family
            </div>
            <Select
              value={fontFamily}
              onValueChange={(value) => {
                setFontFamily(value);
                document.documentElement.style.setProperty("--font-family", value);
                try { localStorage.setItem("fitfusion-font-family", value); } catch { /* noop */ }
                toast({ title: "Font Changed", description: `Font family set to ${value}.` });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
                <SelectItem value="system-ui">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Compact View</p>
                <p className="text-xs text-muted-foreground">
                  Show more content in less space
                </p>
              </div>
            </div>
            <Switch
              checked={compactView}
              onCheckedChange={handleCompactViewToggle}
              disabled={isApplyingChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visual Effects</CardTitle>
          <CardDescription>
            Control animations and visual elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="animations">UI Animations</Label>
              <span className="text-xs text-muted-foreground">
                Show animations for UI elements
              </span>
            </div>
            <Switch
              id="animations"
              checked={displayOptions.animations}
              onCheckedChange={(checked) =>
                handleDisplayOptionToggle("animations", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="highContrast">High Contrast</Label>
              <span className="text-xs text-muted-foreground">
                Increase contrast for better visibility
              </span>
            </div>
            <Switch
              id="highContrast"
              checked={displayOptions.highContrast}
              onCheckedChange={(checked) =>
                handleDisplayOptionToggle("highContrast", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="showTips">Show Tips</Label>
              <span className="text-xs text-muted-foreground">
                Display helpful tips while using the app
              </span>
            </div>
            <Switch
              id="showTips"
              checked={displayOptions.showTips}
              onCheckedChange={(checked) =>
                handleDisplayOptionToggle("showTips", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="darkModeSchedule">Dark Mode Schedule</Label>
              <span className="text-xs text-muted-foreground">
                Automatically switch between light and dark mode
              </span>
            </div>
            <Switch
              id="darkModeSchedule"
              checked={displayOptions.darkModeSchedule}
              onCheckedChange={(checked) =>
                handleDisplayOptionToggle("darkModeSchedule", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="customFonts">Custom Fonts</Label>
              <span className="text-xs text-muted-foreground">
                Allow using custom fonts in the app
              </span>
            </div>
            <Switch
              id="customFonts"
              checked={displayOptions.customFonts}
              onCheckedChange={(checked) =>
                handleDisplayOptionToggle("customFonts", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>
            Settings to improve app accessibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="colorBlindMode" className="mb-2 block">
              Color Blind Mode
            </Label>
            <RadioGroup
              id="colorBlindMode"
              value={colorBlindMode}
              onValueChange={handleColorBlindModeChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">Standard Colors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="protanopia" id="protanopia" />
                <Label htmlFor="protanopia">Protanopia (Red-blind)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deuteranopia" id="deuteranopia" />
                <Label htmlFor="deuteranopia">Deuteranopia (Green-blind)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tritanopia" id="tritanopia" />
                <Label htmlFor="tritanopia">Tritanopia (Blue-blind)</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="contrast">Contrast Level</Label>
              <span className="text-sm font-medium">{contrastLevel}%</span>
            </div>
            <Slider
              id="contrast"
              min={0}
              max={100}
              step={5}
              value={[contrastLevel]}
              onValueChange={handleContrastChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>Default</span>
              <span>High</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Eye className="h-4 w-4 mr-1" />
            <span>These settings help make the app more accessible</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset to defaults
              setColorBlindMode("none");
              setContrastLevel(50);
              handleColorBlindModeChange("none");
              handleContrastChange([50]);

              toast({
                title: "Accessibility Reset",
                description: "Settings have been reset to defaults.",
              });
            }}
          >
            Reset to Defaults
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
