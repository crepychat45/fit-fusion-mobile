import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import {
  ChevronLeft,
  Download,
  FileText,
  Calendar,
  Clock,
  Filter,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import {
  exportUserData,
  downloadFile,
  getEstimatedFileSize,
  ExportFileType,
  DataCategory,
} from "@/utils/sound-exports";
import { DateRange } from "react-day-picker";

const ExportData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fileType, setFileType] = useState<ExportFileType>("json");
  const [selectedCategories, setSelectedCategories] = useState<DataCategory[]>([
    "workouts",
    "progress",
  ]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  });
  const [includeMedia, setIncludeMedia] = useState(false);
  const [anonymized, setAnonymized] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const toggleCategory = (category: DataCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleExport = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "No Data Selected",
        description: "Please select at least one data category to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    toast({
      title: "Preparing Export",
      description:
        "Your data is being prepared for export. This may take a moment.",
    });

    try {
      const downloadUrl = await exportUserData({
        fileType,
        categories: selectedCategories,
        timeRange: {
          start: dateRange.from || new Date(),
          end: dateRange.to || new Date(),
        },
        includeMedia,
        anonymized,
      });

      toast({
        title: "Export Complete",
        description: "Your data export is ready for download.",
      });

      // Generate a filename with current date
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `fitfusion-export-${timestamp}.${fileType}`;

      // Trigger download
      downloadFile(downloadUrl, fileName);
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description:
          "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Modified handler to handle optional 'to' in DateRange
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range) {
      setDateRange({ from: undefined, to: undefined });
    } else {
      setDateRange({
        from: range.from,
        to: range.to || range.from, // If 'to' is missing, use 'from' as fallback
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-white p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">
            Export Your Data
          </h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
            <CardDescription>
              Choose what data to export and in which format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Export Format</Label>
              <RadioGroup
                value={fileType}
                onValueChange={(value) => setFileType(value as ExportFileType)}
                className="grid grid-cols-2 gap-4 mt-3"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> JSON
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> CSV
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> PDF
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="html" id="html" />
                  <Label htmlFor="html" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> HTML
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">
                Select Data Categories
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {[
                  { id: "workouts", label: "Workouts" },
                  { id: "progress", label: "Progress" },
                  { id: "nutrition", label: "Nutrition" },
                  { id: "sleep", label: "Sleep" },
                  { id: "activity", label: "Activity" },
                  { id: "heart-rate", label: "Heart Rate" },
                  { id: "all", label: "All Data" },
                ].map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-secondary/10 transition-colors ${
                      selectedCategories.includes(category.id as DataCategory)
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => toggleCategory(category.id as DataCategory)}
                  >
                    <span>{category.label}</span>
                    {selectedCategories.includes(
                      category.id as DataCategory,
                    ) && <Check className="h-4 w-4 text-primary" />}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Estimated file size: {getEstimatedFileSize(selectedCategories)}
              </p>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium mb-3">Date Range</Label>
              <Tabs defaultValue="30days">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
                  <TabsTrigger value="6months">Last 6 Months</TabsTrigger>
                  <TabsTrigger value="custom">Custom Range</TabsTrigger>
                </TabsList>
                <TabsContent value="30days">
                  <p className="text-sm text-muted-foreground">
                    Exporting data from{" "}
                    {new Date(
                      Date.now() - 30 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString()}{" "}
                    to {new Date().toLocaleDateString()}
                  </p>
                </TabsContent>
                <TabsContent value="6months">
                  <p className="text-sm text-muted-foreground">
                    Exporting data from{" "}
                    {new Date(
                      Date.now() - 180 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString()}{" "}
                    to {new Date().toLocaleDateString()}
                  </p>
                </TabsContent>
                <TabsContent value="custom">
                  <div className="flex flex-col items-center space-y-4">
                    <CalendarComponent
                      mode="range"
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to,
                      }}
                      onSelect={handleDateRangeChange}
                      className="rounded-md border pointer-events-auto"
                      numberOfMonths={1}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="include-media" className="font-medium">
                    Include Media Files
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Export photos and videos
                  </p>
                </div>
                <Switch
                  id="include-media"
                  checked={includeMedia}
                  onCheckedChange={setIncludeMedia}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anonymized" className="font-medium">
                    Anonymize Personal Data
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Remove identifying information
                  </p>
                </div>
                <Switch
                  id="anonymized"
                  checked={anonymized}
                  onCheckedChange={setAnonymized}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedCategories.length === 0}
              className="w-full"
            >
              {isExporting ? "Preparing Export..." : "Export Data"}
              {!isExporting && <Download className="h-4 w-4 ml-2" />}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Data Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your exported data is for your personal use. Be cautious about
                sharing files that contain personal information. When
                anonymization is enabled, personal identifiers will be removed
                from the export.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default ExportData;
