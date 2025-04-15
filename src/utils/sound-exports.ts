
import { SoundEffect, VibrationPattern, provideFeedback } from "./feedback-utils";

// File types supported for export
export type ExportFileType = 'json' | 'csv' | 'pdf' | 'html';

// Data categories for export
export type DataCategory = 
  'workouts' | 
  'progress' | 
  'nutrition' | 
  'sleep' | 
  'activity' | 
  'heart-rate' | 
  'all';

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
  fileType: 'json',
  categories: ['all'],
  timeRange: {
    start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // Last 30 days
    end: new Date()
  },
  includeMedia: false,
  anonymized: false
};

/**
 * Export user data to a file
 * @param config Export configuration
 * @returns Promise that resolves to the download URL
 */
export const exportUserData = async (
  config: Partial<ExportConfig> = {}
): Promise<string> => {
  // Play sound and vibrate
  provideFeedback('notification', 'medium');
  
  const fullConfig = { ...defaultExportConfig, ...config };
  
  // In a real app, this would call an API endpoint
  // For now, we'll simulate a delay and return a fake download URL
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Generate a simulated file name based on config
      const timestamp = new Date().toISOString().replace(/:/g, '-');
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
  if (categories.includes('all')) {
    return '5-15 MB';
  }
  
  // Calculate rough estimate based on selected categories
  const sizeMap: Record<DataCategory, number> = {
    'workouts': 0.5,  // MB
    'progress': 1.2,
    'nutrition': 2.5,
    'sleep': 0.8,
    'activity': 3.5,
    'heart-rate': 4.2,
    'all': 15
  };
  
  const totalSize = categories.reduce((sum, category) => sum + sizeMap[category], 0);
  
  if (totalSize < 1) {
    return `${Math.round(totalSize * 1000)} KB`;
  }
  
  return `${totalSize.toFixed(1)} MB`;
};

// Simulated download function
export const downloadFile = (url: string, fileName: string): void => {
  // In a real application, this would create an actual download
  // For demo purposes, we'll just provide feedback and log to console
  provideFeedback('success', 'success');
  console.log(`Downloading file: ${fileName} from ${url}`);
  
  // Create a fake download notification
  const event = new CustomEvent('file-download', { 
    detail: { url, fileName, complete: true } 
  });
  window.dispatchEvent(event);
};
