
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Github, Heart, Globe, Star, Users, Award, Coffee, Mail, BookOpen, ExternalLink, 
  Smartphone, Shield, Zap, Download
} from "lucide-react";
import { VersionManager } from "./version-manager";

export function AboutPage() {
  const [currentVersion, setCurrentVersion] = useState(() => {
    return localStorage.getItem('fitfusion-app-version') || "4.7.0";
  });

  // Listen for version updates
  useEffect(() => {
    const handleVersionUpdate = (event: CustomEvent) => {
      setCurrentVersion(event.detail);
    };

    window.addEventListener('versionUpdated', handleVersionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('versionUpdated', handleVersionUpdate as EventListener);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-primary" />
                About FitFusion
              </CardTitle>
              <CardDescription>The complete fitness companion with AI-powered features</CardDescription>
            </div>
            <Badge variant="default" className="text-sm font-mono px-3 py-1">
              v{currentVersion}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              FitFusion is a revolutionary fitness application designed to transform your health journey 
              with AI-powered insights, personalized workouts, and comprehensive progress tracking. 
              Built with cutting-edge technology for the modern fitness enthusiast.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                <Star className="h-3 w-3" /> 4.9/5 Rating
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                <Users className="h-3 w-3" /> 5M+ Active Users
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                <Award className="h-3 w-3" /> Fitness App of the Year 2024
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                <Shield className="h-3 w-3" /> Privacy Certified
              </Badge>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">✨ Latest Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <Zap className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">AI-Powered Workouts</p>
                  <p className="text-xs text-muted-foreground">Personalized training plans</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Enhanced Security</p>
                  <p className="text-xs text-muted-foreground">End-to-end encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <Download className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Smart Sync</p>
                  <p className="text-xs text-muted-foreground">Cloud data synchronization</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                <Users className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Social Features</p>
                  <p className="text-xs text-muted-foreground">Connect with friends</p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              Development Team
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  FF
                </div>
                <div>
                  <p className="text-sm font-medium">FitFusion Development Team</p>
                  <p className="text-xs text-muted-foreground">
                    Crafted with ❤️ by fitness enthusiasts and tech innovators
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <Globe className="h-4 w-4" />
              Website
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <Mail className="h-4 w-4" />
              Support
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <BookOpen className="h-4 w-4" />
              Docs
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">📄 Legal & Licensing</h3>
            <p className="text-xs text-muted-foreground">
              This application uses open-source components and follows industry-standard 
              privacy and security practices.
            </p>
            <Button variant="link" size="sm" className="px-0 h-auto flex items-center gap-1 text-xs">
              View open source licenses
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg border text-center">
            <p className="text-xs text-muted-foreground mb-2">
              © 2024 FitFusion. All rights reserved.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="link" size="sm" className="p-0 h-6 text-xs hover:text-primary">
                Privacy Policy
              </Button>
              <span className="text-muted-foreground text-xs">•</span>
              <Button variant="link" size="sm" className="p-0 h-6 text-xs hover:text-primary">
                Terms of Service
              </Button>
              <span className="text-muted-foreground text-xs">•</span>
              <Button variant="link" size="sm" className="p-0 h-6 text-xs hover:text-primary">
                Cookie Policy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <VersionManager />
    </div>
  );
}
