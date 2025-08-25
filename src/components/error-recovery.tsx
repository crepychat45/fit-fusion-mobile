import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface ErrorRecoveryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorRecoveryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorRecovery extends Component<
  ErrorRecoveryProps,
  ErrorRecoveryState
> {
  constructor(props: ErrorRecoveryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorRecoveryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorRecovery caught an error:", error, errorInfo);
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });

    // Send error to monitoring service (if available)
    if (typeof window !== "undefined" && "navigator" in window) {
      try {
        // Send to analytics or error reporting service
        console.error("Application Error:", {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
      } catch (reportingError) {
        console.error("Failed to report error:", reportingError);
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We encountered an unexpected error. This has been logged and our
                team will investigate.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="bg-muted p-3 rounded-lg text-xs">
                  <summary className="cursor-pointer font-medium">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 text-xs overflow-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                <p>Error ID: {Date.now().toString(36)}</p>
                <p>If this persists, please contact support</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple functional error boundary for specific components
export function withErrorRecovery<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  return function ErrorRecoveryWrapper(props: P) {
    return (
      <ErrorRecovery fallback={fallback}>
        <Component {...props} />
      </ErrorRecovery>
    );
  };
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = (error: Error, context?: string) => {
    console.error("Manual error report:", { error, context });

    // Send to monitoring service
    if (typeof window !== "undefined") {
      try {
        console.error("User Reported Error:", {
          error: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
      } catch (reportingError) {
        console.error("Failed to report error:", reportingError);
      }
    }
  };

  return { reportError };
}
