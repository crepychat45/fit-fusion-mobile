import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Zap,
  Database,
  Settings,
  Cpu,
  Network,
  Lock,
  Eye,
  Smartphone,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ValidationResult {
  category: string;
  status: "passed" | "warning" | "failed";
  message: string;
  details: string;
  icon: typeof CheckCircle;
  fix?: () => void;
}

export function EnhancedSettingsValidation() {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [overallScore, setOverallScore] = useState(0);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  const [autoValidation, setAutoValidation] = useState(true);

  const validationCategories = [
    { name: "Security Configuration", icon: Shield, weight: 25 },
    { name: "Performance Settings", icon: Zap, weight: 20 },
    { name: "Database Integrity", icon: Database, weight: 20 },
    { name: "System Configuration", icon: Settings, weight: 15 },
    { name: "Network Security", icon: Network, weight: 10 },
    { name: "Privacy Controls", icon: Lock, weight: 10 },
  ];

  const runComprehensiveValidation = async () => {
    if (isValidating) return;

    setIsValidating(true);
    setValidationProgress(0);
    setValidationResults([]);

    const results: ValidationResult[] = [];
    let totalScore = 0;

    try {
      for (let i = 0; i < validationCategories.length; i++) {
        const category = validationCategories[i];

        // Simulate validation time
        await new Promise((resolve) => setTimeout(resolve, 800));

        setValidationProgress(((i + 1) / validationCategories.length) * 100);

        toast({
          title: `Validating ${category.name}...`,
          description: `Step ${i + 1} of ${validationCategories.length}`,
        });

        // Simulate validation results
        const categoryResults = await validateCategory(category.name);
        results.push(...categoryResults);

        // Calculate score for this category
        const passedTests = categoryResults.filter(
          (r) => r.status === "passed",
        ).length;
        const totalTests = categoryResults.length;
        const categoryScore = (passedTests / totalTests) * category.weight;
        totalScore += categoryScore;
      }

      setValidationResults(results);
      setOverallScore(Math.round(totalScore));
      setLastValidation(new Date());

      const criticalIssues = results.filter(
        (r) => r.status === "failed",
      ).length;
      const warnings = results.filter((r) => r.status === "warning").length;

      if (criticalIssues === 0 && warnings === 0) {
        toast({
          title: "🎉 Perfect Configuration!",
          description:
            "All settings validated successfully with no issues found.",
        });
      } else if (criticalIssues === 0) {
        toast({
          title: "✅ Validation Complete",
          description: `Found ${warnings} minor warnings that can be addressed.`,
        });
      } else {
        toast({
          title: "⚠️ Issues Found",
          description: `Found ${criticalIssues} critical issues and ${warnings} warnings.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "❌ Validation Failed",
        description: "An error occurred during validation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const validateCategory = async (
    categoryName: string,
  ): Promise<ValidationResult[]> => {
    // Simulate different validation scenarios
    const mockResults: Record<string, ValidationResult[]> = {
      "Security Configuration": [
        {
          category: "Security",
          status: "passed",
          message: "Two-Factor Authentication",
          details: "2FA is properly configured and active",
          icon: CheckCircle,
        },
        {
          category: "Security",
          status: "warning",
          message: "Session Timeout",
          details:
            "Session timeout could be more restrictive for better security",
          icon: AlertTriangle,
          fix: () => toast({ title: "Applied recommended session timeout" }),
        },
        {
          category: "Security",
          status: "passed",
          message: "Password Policy",
          details: "Strong password requirements are enforced",
          icon: CheckCircle,
        },
      ],
      "Performance Settings": [
        {
          category: "Performance",
          status: "passed",
          message: "Cache Configuration",
          details: "Application cache is optimally configured",
          icon: CheckCircle,
        },
        {
          category: "Performance",
          status: "failed",
          message: "Image Optimization",
          details: "Large images detected that could be compressed",
          icon: AlertTriangle,
          fix: () => toast({ title: "Optimized image compression settings" }),
        },
      ],
      "Database Integrity": [
        {
          category: "Database",
          status: "passed",
          message: "Connection Pool",
          details: "Database connections are properly managed",
          icon: CheckCircle,
        },
        {
          category: "Database",
          status: "passed",
          message: "Query Optimization",
          details: "All queries are using appropriate indexes",
          icon: CheckCircle,
        },
      ],
      "System Configuration": [
        {
          category: "System",
          status: "passed",
          message: "Environment Variables",
          details: "All required environment variables are set",
          icon: CheckCircle,
        },
        {
          category: "System",
          status: "warning",
          message: "Log Retention",
          details: "Log retention period could be optimized",
          icon: AlertTriangle,
          fix: () => toast({ title: "Updated log retention settings" }),
        },
      ],
      "Network Security": [
        {
          category: "Network",
          status: "passed",
          message: "HTTPS Configuration",
          details: "SSL/TLS is properly configured",
          icon: CheckCircle,
        },
        {
          category: "Network",
          status: "passed",
          message: "CORS Settings",
          details: "Cross-origin requests are properly restricted",
          icon: CheckCircle,
        },
      ],
      "Privacy Controls": [
        {
          category: "Privacy",
          status: "passed",
          message: "Data Encryption",
          details: "All sensitive data is encrypted at rest",
          icon: CheckCircle,
        },
        {
          category: "Privacy",
          status: "passed",
          message: "Access Controls",
          details: "User permissions are properly configured",
          icon: CheckCircle,
        },
      ],
    };

    return mockResults[categoryName] || [];
  };

  const fixAllIssues = async () => {
    const fixableIssues = validationResults.filter(
      (r) => r.fix && r.status !== "passed",
    );

    if (fixableIssues.length === 0) {
      toast({
        title: "No fixable issues",
        description: "All issues require manual attention.",
      });
      return;
    }

    toast({
      title: "🔧 Auto-fixing issues",
      description: `Applying fixes for ${fixableIssues.length} issues...`,
    });

    for (const issue of fixableIssues) {
      if (issue.fix) {
        issue.fix();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Re-run validation after fixes
    setTimeout(() => runComprehensiveValidation(), 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Attention";
  };

  useEffect(() => {
    if (autoValidation && !lastValidation) {
      runComprehensiveValidation();
    }
  }, [autoValidation]);

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Validation Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Advanced Settings Validation
            </CardTitle>
            <CardDescription>
              AI-powered validation and optimization of your application
              settings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold">
                    {overallScore}
                    <span className="text-lg text-muted-foreground">/100</span>
                  </span>
                  <Badge
                    variant={
                      overallScore >= 90
                        ? "default"
                        : overallScore >= 70
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {getScoreLabel(overallScore)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Overall Configuration Score
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runComprehensiveValidation}
                  disabled={isValidating}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-1 ${isValidating ? "animate-spin" : ""}`}
                  />
                  {isValidating ? "Validating..." : "Run Validation"}
                </Button>
                {validationResults.some(
                  (r) => r.fix && r.status !== "passed",
                ) && (
                  <Button variant="default" size="sm" onClick={fixAllIssues}>
                    <Zap className="h-4 w-4 mr-1" />
                    Auto-Fix
                  </Button>
                )}
              </div>
            </div>

            {isValidating && (
              <div className="space-y-2">
                <Progress value={validationProgress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Running comprehensive validation...{" "}
                  {Math.round(validationProgress)}%
                </p>
              </div>
            )}

            {lastValidation && (
              <div className="text-xs text-muted-foreground text-center">
                Last validation: {lastValidation.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Validation Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Validation Categories
            </CardTitle>
            <CardDescription>
              Detailed breakdown of validation results by category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationCategories.map((category, index) => {
              const CategoryIcon = category.icon;
              const categoryResults = validationResults.filter((r) =>
                r.category
                  .toLowerCase()
                  .includes(category.name.toLowerCase().split(" ")[0]),
              );
              const passed = categoryResults.filter(
                (r) => r.status === "passed",
              ).length;
              const total = categoryResults.length;
              const percentage =
                total > 0 ? Math.round((passed / total) * 100) : 0;

              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Weight: {category.weight}% | {passed}/{total} checks
                        passed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={`font-medium ${getScoreColor(percentage)}`}>
                        {percentage}%
                      </p>
                    </div>
                    <Progress value={percentage} className="w-16 h-2" />
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Validation Results */}
      <AnimatePresence>
        {validationResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Detailed Results
                </CardTitle>
                <CardDescription>
                  Complete validation report with actionable recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {validationResults.map((result, index) => {
                  const ResultIcon = result.icon;
                  const isFixable = !!result.fix;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Alert
                        className={
                          result.status === "passed"
                            ? "border-green-200 bg-green-50/50"
                            : result.status === "warning"
                              ? "border-yellow-200 bg-yellow-50/50"
                              : "border-red-200 bg-red-50/50"
                        }
                      >
                        <ResultIcon
                          className={`h-4 w-4 ${
                            result.status === "passed"
                              ? "text-green-600"
                              : result.status === "warning"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>{result.message}</strong>
                              <br />
                              <span className="text-sm">{result.details}</span>
                            </div>
                            {isFixable && result.status !== "passed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={result.fix}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Fix
                              </Button>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optimization Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              AI Optimization Suggestions
            </CardTitle>
            <CardDescription>
              Machine learning-powered recommendations to improve your
              configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Performance Optimization</strong>
                <br />
                Enable aggressive caching for static assets to improve load
                times by up to 40%.
              </AlertDescription>
            </Alert>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Enhancement</strong>
                <br />
                Consider implementing Content Security Policy (CSP) headers for
                additional protection.
              </AlertDescription>
            </Alert>

            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>Database Optimization</strong>
                <br />
                Query performance could be improved by adding composite indexes
                on frequently joined tables.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
