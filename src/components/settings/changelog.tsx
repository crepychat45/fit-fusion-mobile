
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  Star, 
  Bug, 
  Zap, 
  Shield, 
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitBranch
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  changes: {
    category: 'feature' | 'fix' | 'security' | 'performance' | 'ui';
    description: string;
    important?: boolean;
  }[];
  downloadUrl?: string;
  size?: string;
}

const changelog: ChangelogEntry[] = [
  {
    version: "4.9.2",
    date: "2024-12-28",
    type: "minor",
    changes: [
      { category: "feature", description: "Enhanced Profile tab with achievements and analytics", important: true },
      { category: "feature", description: "Improved Settings UI with better navigation and validation" },
      { category: "fix", description: "Fixed profile auto-save functionality" },
      { category: "fix", description: "Resolved version display issues in settings" },
      { category: "ui", description: "Updated welcome message to show user name automatically" },
      { category: "performance", description: "Optimized component rendering and state management" }
    ],
    downloadUrl: "#",
    size: "12.4 MB"
  },
  {
    version: "4.9.1",
    date: "2024-12-25",
    type: "patch",
    changes: [
      { category: "fix", description: "Fixed chat settings not saving properly" },
      { category: "fix", description: "Resolved developer options toggle issues" },
      { category: "security", description: "Enhanced privacy settings validation", important: true },
      { category: "ui", description: "Improved mobile navigation responsiveness" }
    ],
    downloadUrl: "#",
    size: "11.8 MB"
  },
  {
    version: "4.9.0",
    date: "2024-12-20",
    type: "major",
    changes: [
      { category: "feature", description: "New AI-powered chat interface with enhanced security", important: true },
      { category: "feature", description: "Advanced developer options and debugging tools" },
      { category: "feature", description: "Comprehensive settings validation system" },
      { category: "security", description: "End-to-end encryption for all communications", important: true },
      { category: "ui", description: "Redesigned settings interface with better organization" },
      { category: "performance", description: "Improved app startup time by 40%" }
    ],
    downloadUrl: "#",
    size: "15.2 MB"
  },
  {
    version: "4.8.5",
    date: "2024-12-15",
    type: "hotfix",
    changes: [
      { category: "fix", description: "Critical security patch for authentication" },
      { category: "fix", description: "Fixed app crashes on certain Android devices" },
      { category: "fix", description: "Resolved data sync issues" }
    ],
    downloadUrl: "#",
    size: "9.8 MB"
  },
  {
    version: "4.8.4",
    date: "2024-12-10",
    type: "patch",
    changes: [
      { category: "feature", description: "Added workout video streaming" },
      { category: "fix", description: "Fixed progress tracking accuracy" },
      { category: "ui", description: "Updated exercise card design" },
      { category: "performance", description: "Reduced memory usage by 20%" }
    ],
    downloadUrl: "#",
    size: "11.5 MB"
  }
];

export function Changelog() {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set(['4.9.2']));
  const [filter, setFilter] = useState<'all' | 'features' | 'fixes' | 'security'>('all');

  const toggleVersion = (version: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  const getTypeIcon = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'major':
        return <Star className="h-4 w-4" />;
      case 'minor':
        return <Zap className="h-4 w-4" />;
      case 'patch':
        return <Bug className="h-4 w-4" />;
      case 'hotfix':
        return <Shield className="h-4 w-4" />;
      default:
        return <GitBranch className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'major':
        return 'bg-purple-500 text-white';
      case 'minor':
        return 'bg-blue-500 text-white';
      case 'patch':
        return 'bg-green-500 text-white';
      case 'hotfix':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'feature':
        return <Star className="h-3 w-3" />;
      case 'fix':
        return <Bug className="h-3 w-3" />;
      case 'security':
        return <Shield className="h-3 w-3" />;
      case 'performance':
        return <Zap className="h-3 w-3" />;
      default:
        return <GitBranch className="h-3 w-3" />;
    }
  };

  const filteredChangelog = changelog.filter(entry => {
    if (filter === 'all') return true;
    return entry.changes.some(change => {
      if (filter === 'features') return change.category === 'feature';
      if (filter === 'fixes') return change.category === 'fix';
      if (filter === 'security') return change.category === 'security';
      return false;
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Changelog</h3>
          <p className="text-sm text-muted-foreground">
            View the latest updates and improvements
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">All Changes</option>
            <option value="features">Features</option>
            <option value="fixes">Bug Fixes</option>
            <option value="security">Security</option>
          </select>
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {filteredChangelog.map((entry) => (
            <motion.div
              key={entry.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleVersion(entry.version)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getTypeColor(entry.type)}>
                        {getTypeIcon(entry.type)}
                        <span className="ml-1">v{entry.version}</span>
                      </Badge>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      
                      {entry.size && (
                        <Badge variant="outline" className="text-xs">
                          {entry.size}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {entry.downloadUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={entry.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      
                      {expandedVersions.has(entry.version) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {expandedVersions.has(entry.version) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {entry.changes.map((change, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className={`p-1 rounded-full ${
                                change.category === 'feature' ? 'bg-blue-100 text-blue-600' :
                                change.category === 'fix' ? 'bg-green-100 text-green-600' :
                                change.category === 'security' ? 'bg-red-100 text-red-600' :
                                change.category === 'performance' ? 'bg-purple-100 text-purple-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {getCategoryIcon(change.category)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm ${change.important ? 'font-medium' : ''}`}>
                                    {change.description}
                                  </span>
                                  {change.important && (
                                    <Badge variant="default" className="text-xs px-1 py-0">
                                      Important
                                    </Badge>
                                  )}
                                </div>
                                
                                <Badge variant="outline" className="text-xs mt-1">
                                  {change.category}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {entry.downloadUrl && (
                          <>
                            <Separator className="my-4" />
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">
                                Download this version to get the latest features
                              </div>
                              
                              <Button size="sm" asChild>
                                <a href={entry.downloadUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
