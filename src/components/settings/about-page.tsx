
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Github, Heart, Globe, Star, Users, Award, Coffee, Mail, BookOpen, ExternalLink
} from "lucide-react";
import { VersionManager } from "./version-manager";

export function AboutPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>About FitFusion</CardTitle>
              <CardDescription>The complete fitness companion</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">v4.5.0</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              FitFusion is a comprehensive fitness application designed to help you track workouts, 
              monitor progress, and achieve your fitness goals.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" /> 4.9/5 Rating
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" /> 5M+ Users
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="h-3 w-3" /> Fitness App of the Year
              </Badge>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Development Team</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Coffee className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">FitFusion Team</p>
                  <p className="text-xs text-muted-foreground">Developed with ❤️ by fitness enthusiasts</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              Website
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Mail className="h-4 w-4" />
              Contact
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Documentation
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Licenses</h3>
            <p className="text-xs text-muted-foreground">
              This application uses open-source components, see the licensing information here.
            </p>
            <Button variant="link" size="sm" className="px-0 h-auto flex items-center gap-1">
              View licenses
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg border text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 FitFusion. All rights reserved.
            </p>
            <div className="flex justify-center gap-2 mt-1">
              <Button variant="link" size="sm" className="p-0 h-6 text-xs">Privacy Policy</Button>
              <span className="text-muted-foreground">•</span>
              <Button variant="link" size="sm" className="p-0 h-6 text-xs">Terms of Service</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <VersionManager />
    </div>
  );
}
