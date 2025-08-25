import {
  SoundEffect,
  VibrationPattern,
  provideFeedback,
} from "./feedback-utils";

// File types supported for export
export type ExportFileType = "json" | "csv" | "pdf" | "html";

// Data categories for export
export type DataCategory =
  | "workouts"
  | "progress"
  | "nutrition"
  | "sleep"
  | "activity"
  | "heart-rate"
  | "all";

// Export format configuration
interface ExportConfig {
  fileType: ExportFileType;
  categories: DataCategory[];
  timeRange: {
    start: Date;
    end: Date;
  };
  includeMedia: boolean;
  anonymized: boolean;
}

// Default export configuration
const defaultExportConfig: ExportConfig = {
  fileType: "json",
  categories: ["all"],
  timeRange: {
    start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // Last 30 days
    end: new Date(),
  },
  includeMedia: false,
  anonymized: false,
};

/**
 * Export user data to a file
 * @param config Export configuration
 * @returns Promise that resolves to the download URL
 */
export const exportUserData = async (
  config: Partial<ExportConfig> = {},
): Promise<string> => {
  // Play sound and vibrate
  provideFeedback("notification", "medium");

  const fullConfig = { ...defaultExportConfig, ...config };

  // In a real app, this would call an API endpoint
  // For now, we'll simulate a delay and return a fake download URL
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Generate a simulated file name based on config
      const timestamp = new Date().toISOString().replace(/:/g, "-");
      const fileName = `fitfusion-export-${timestamp}.${fullConfig.fileType}`;

      // In a real app, this would be a URL to download the generated file
      const downloadUrl = `/download/${fileName}`;

      // Resolve with the download URL
      resolve(downloadUrl);
    }, 2000);
  });
};

/**
 * Get file size description based on data categories
 * @param categories Data categories to export
 * @returns Estimated file size as readable string
 */
export const getEstimatedFileSize = (categories: DataCategory[]): string => {
  if (categories.includes("all")) {
    return "5-15 MB";
  }

  // Calculate rough estimate based on selected categories
  const sizeMap: Record<DataCategory, number> = {
    workouts: 0.5, // MB
    progress: 1.2,
    nutrition: 2.5,
    sleep: 0.8,
    activity: 3.5,
    "heart-rate": 4.2,
    all: 15,
  };

  const totalSize = categories.reduce(
    (sum, category) => sum + sizeMap[category],
    0,
  );

  if (totalSize < 1) {
    return `${Math.round(totalSize * 1000)} KB`;
  }

  return `${totalSize.toFixed(1)} MB`;
};

/**
 * Download a file with the given URL and filename
 * @param url The URL of the file to download
 * @param fileName The name to save the file as
 */
export const downloadFile = (url: string, fileName: string): void => {
  // Play feedback sound
  provideFeedback("success", "success");

  // In a real application with actual file URLs, we would create a download link
  // For this demo, we'll create a dummy file with some content
  const dummyContent = createDummyFileContent(fileName);

  // Create a blob from the content
  const blob = new Blob([dummyContent], {
    type: getContentType(fileName.split(".").pop() as ExportFileType),
  });

  // Create a URL for the blob
  const objectUrl = URL.createObjectURL(blob);

  // Create a temporary link element
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;

  // Append to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL
  setTimeout(() => URL.revokeObjectURL(objectUrl), 100);

  // Create a fake download notification
  const event = new CustomEvent("file-download", {
    detail: { url, fileName, complete: true },
  });
  window.dispatchEvent(event);

  console.log(`Downloading file: ${fileName}`);
};

/**
 * Create dummy content for the file based on file type
 * @param fileName The name of the file
 * @returns String content for the file
 */
const createDummyFileContent = (fileName: string): string => {
  const fileType = fileName.split(".").pop() as ExportFileType;
  const timestamp = new Date().toISOString();

  switch (fileType) {
    case "json":
      return JSON.stringify(
        {
          exportDate: timestamp,
          user: {
            id: "user123",
            name: "Demo User",
            email: "demo@example.com",
          },
          data: {
            workouts: [
              { id: "w1", name: "Morning Run", type: "cardio", duration: 45 },
              { id: "w2", name: "Upper Body", type: "strength", duration: 60 },
            ],
            progress: {
              weight: [
                { date: "2025-04-01", value: 75.5 },
                { date: "2025-04-15", value: 74.8 },
              ],
              steps: [
                { date: "2025-04-14", value: 8452 },
                { date: "2025-04-15", value: 9120 },
              ],
            },
          },
        },
        null,
        2,
      );

    case "csv":
      return [
        "Date,Activity,Duration,Calories",
        "2025-04-01,Morning Run,45,320",
        "2025-04-03,Upper Body,60,450",
        "2025-04-07,HIIT Session,30,280",
        "2025-04-10,Yoga,45,180",
        "2025-04-14,Cycling,60,520",
      ].join("\n");

    case "html":
      return `<!DOCTYPE html>
<html>
<head>
  <title>FitFusion Data Export</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #3b82f6; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>FitFusion Data Export</h1>
  <p>Export Date: ${timestamp}</p>
  <p>User: Demo User (demo@example.com)</p>
  
  <h2>Workout History</h2>
  <table>
    <tr>
      <th>Date</th>
      <th>Activity</th>
      <th>Duration</th>
      <th>Calories</th>
    </tr>
    <tr>
      <td>2025-04-01</td>
      <td>Morning Run</td>
      <td>45 min</td>
      <td>320</td>
    </tr>
    <tr>
      <td>2025-04-03</td>
      <td>Upper Body</td>
      <td>60 min</td>
      <td>450</td>
    </tr>
    <tr>
      <td>2025-04-07</td>
      <td>HIIT Session</td>
      <td>30 min</td>
      <td>280</td>
    </tr>
  </table>
</body>
</html>`;

    case "pdf":
      // For PDF, we'll create a simple text representation since we can't generate actual PDFs in this demo
      return `FitFusion Data Export
Generated: ${timestamp}
User: Demo User (demo@example.com)

WORKOUT HISTORY
--------------
2025-04-01 | Morning Run | 45 min | 320 calories
2025-04-03 | Upper Body | 60 min | 450 calories
2025-04-07 | HIIT Session | 30 min | 280 calories
2025-04-10 | Yoga | 45 min | 180 calories
2025-04-14 | Cycling | 60 min | 520 calories

PROGRESS SUMMARY
--------------
Weight: 75.5kg -> 74.8kg
Average Steps: 8,786 per day
Sleep Quality: Good`;

    default:
      return `FitFusion Data Export
Generated: ${timestamp}
This is a sample export file.`;
  }
};

/**
 * Get the correct content type based on file type
 * @param fileType The type of file
 * @returns Content type string
 */
const getContentType = (fileType: ExportFileType): string => {
  switch (fileType) {
    case "json":
      return "application/json";
    case "csv":
      return "text/csv";
    case "html":
      return "text/html";
    case "pdf":
      return "application/pdf";
    default:
      return "text/plain";
  }
};
