import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiquidGlassCard } from "@/components/enhanced-liquid-glass";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Shield,
  ArrowLeft,
  Download,
  Mail
} from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class EnhancedErrorRecovery extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ""
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ERR${Date.now().toString().slice(-6)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorId: `ERR${Date.now().toString().slice(-6)}`
    });
    
    console.error("Error caught by boundary:", error, errorInfo);
    
    // Send error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };
    
    // In a real app, send this to your error monitoring service
    console.log("Error report:", errorReport);
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ""
    });
    
    // Optionally reload the page
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleDownloadReport = () => {
    const errorReport = {
      errorId: this.state.errorId,
      message: this.state.error?.message || "Unknown error",
      stack: this.state.error?.stack || "No stack trace",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(errorReport, null, 2)], {
      type: "application/json"
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-report-${this.state.errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl animate-in fade-in duration-500">
            <LiquidGlassCard variant="strong">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                  Something went wrong
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  We apologize for the inconvenience. An unexpected error has occurred.
                </p>
                
                <div className="flex justify-center gap-2 mt-4">
                  <Badge variant="outline" className="text-xs">
                    Error ID: {this.state.errorId}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Bug className="h-3 w-3 mr-1" />
                    Auto-reported
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Error Details */}
                {this.state.error && (
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800 animate-in fade-in duration-300">
                    <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                      Error Details:
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400 font-mono break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={this.handleRetry}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                  
                  <Button
                    onClick={this.handleGoBack}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  
                  <Button
                    onClick={this.handleDownloadReport}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>

                {/* Additional Help */}
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 animate-in fade-in duration-500">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    Need Help?
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                    If this error persists, please contact our support team with error ID: <strong>{this.state.errorId}</strong>
                  </p>
                  <Button
                    onClick={() => window.location.href = "mailto:support@fitfusion.app?subject=Error Report " + this.state.errorId}
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-100"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>

                {/* Development Info */}
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border animate-in fade-in duration-700">
                    <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Developer Information
                    </summary>
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </CardContent>
            </LiquidGlassCard>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}