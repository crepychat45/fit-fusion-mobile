import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LiquidGlassCard } from "@/components/enhanced-liquid-glass";
import {
  Calendar,
  Star,
  Zap,
  Shield,
  Bug,
  Sparkles,
  ArrowUp,
  Gift,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink
} from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch" | "hotfix";
  featured: boolean;
  changes: {
    features: string[];
    improvements: string[];
    fixes: string[];
    security: string[];
  };
  highlights: string[];
  downloadUrl?: string;
}

const changelog: ChangelogEntry[] = [
  {
    version: "4.9.2",
    date: "2025-01-03",
    type: "major",
    featured: true,
    changes: {
      features: [
        "🤖 Revolutionary AI-powered workout recommendations with machine learning",
        "🔐 Advanced biometric authentication with enhanced security protocols",
        "🎯 Real-time group fitness challenges with leaderboards",
        "📱 Smart nutrition tracking with barcode scanning and AI analysis",
        "📴 Offline workout mode with intelligent sync capabilities",
        "🎨 New dynamic theme system with customizable color palettes",
        "📊 Enhanced analytics dashboard with predictive insights"
      ],
      improvements: [
        "⚡ 60% faster app startup time with optimized loading",
        "🔋 Improved battery optimization reducing consumption by 40%",
        "🛡️ Enhanced security protocols with zero-trust architecture",
        "♿ Better accessibility features meeting WCAG 2.1 AA standards",
        "✨ Smoother animations with 120fps support",
        "🌐 Improved offline functionality with intelligent caching"
      ],
      fixes: [
        "🔧 Fixed workout timer synchronization issues across devices",
        "💬 Resolved chat notification bugs and message delivery",
        "📈 Fixed progress chart data accuracy and real-time updates",
        "🧠 Improved memory usage optimization reducing RAM by 35%",
        "🌙 Fixed dark mode theme inconsistencies and contrast issues"
      ],
      security: [
        "🔒 End-to-end encryption for all user communications",
        "🛡️ Advanced threat detection and prevention system",
        "🔐 Multi-factor authentication with biometric support",
        "🚫 Enhanced data privacy controls with granular permissions"
      ]
    },
    highlights: [
      "Revolutionary AI coaching system",
      "60% performance improvement",
      "Advanced security overhaul",
      "New liquid glass UI design"
    ]
  },
  {
    version: "4.8.1",
    date: "2024-12-15",
    type: "patch",
    featured: false,
    changes: {
      features: [],
      improvements: [
        "🔧 Enhanced error handling and logging",
        "📱 Improved mobile responsiveness",
        "🎨 Updated UI components styling"
      ],
      fixes: [
        "🐛 Fixed authentication token refresh issues",
        "💾 Resolved data sync conflicts",
        "🔊 Fixed audio playback in workout sessions"
      ],
      security: [
        "🔐 Updated authentication libraries",
        "🛡️ Enhanced API security measures"
      ]
    },
    highlights: [
      "Critical security patches",
      "Authentication improvements",
      "Bug fixes and stability"
    ]
  },
  {
    version: "4.8.0",
    date: "2024-12-01",
    type: "minor",
    featured: false,
    changes: {
      features: [
        "🎵 New workout music integration",
        "📷 Enhanced profile photo features",
        "🏆 Achievement system improvements"
      ],
      improvements: [
        "🚀 Faster loading times",
        "📱 Better mobile navigation",
        "🎨 Refreshed visual design"
      ],
      fixes: [
        "🔧 Various UI/UX improvements",
        "📊 Chart rendering optimizations",
        "💾 Data persistence enhancements"
      ],
      security: []
    },
    highlights: [
      "New music features",
      "Enhanced achievements",
      "Performance optimizations"
    ]
  }
];

export function ChangelogManager() {
  const [expandedVersions, setExpandedVersions] = useState<string[]>(["4.9.2"]);
  const [selectedType, setSelectedType] = useState<string>("all");

  const toggleExpanded = (version: string) => {
    setExpandedVersions(prev => 
      prev.includes(version) 
        ? prev.filter(v => v !== version)
        : [...prev, version]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "major": return <Star className="h-4 w-4 text-yellow-500" />;
      case "minor": return <Zap className="h-4 w-4 text-blue-500" />;
      case "patch": return <Bug className="h-4 w-4 text-green-500" />;
      case "hotfix": return <Shield className="h-4 w-4 text-red-500" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "features": return <Sparkles className="h-3 w-3 text-green-500" />;
      case "improvements": return <ArrowUp className="h-3 w-3 text-blue-500" />;
      case "fixes": return <Bug className="h-3 w-3 text-orange-500" />;
      case "security": return <Shield className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  const filteredChangelog = changelog.filter(entry => 
    selectedType === "all" || entry.type === selectedType
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <LiquidGlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Release Changelog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["all", "major", "minor", "patch", "hotfix"].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {getTypeIcon(type)}
                <span className="ml-1">{type === "all" ? "All Updates" : type}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </LiquidGlassCard>

      {/* Changelog Entries */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredChangelog.map((entry, index) => (
            <motion.div
              key={entry.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <LiquidGlassCard 
                variant={entry.featured ? "strong" : "normal"}
                bubble={entry.featured}
              >
                {entry.featured && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(entry.type)}
                        <span className="font-mono text-lg font-bold">v{entry.version}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {entry.type} Release
                        </Badge>
                        {entry.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(entry.version)}
                      >
                        {expandedVersions.includes(entry.version) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.highlights.map((highlight, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {expandedVersions.includes(entry.version) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />
                        
                        <div className="space-y-4">
                          {Object.entries(entry.changes).map(([type, items]) => (
                            items.length > 0 && (
                              <div key={type}>
                                <h4 className="flex items-center gap-2 font-semibold mb-2 capitalize">
                                  {getChangeIcon(type)}
                                  {type}
                                  <Badge variant="outline" className="text-xs">
                                    {items.length}
                                  </Badge>
                                </h4>
                                <ul className="space-y-1 ml-5">
                                  {items.map((item, idx) => (
                                    <motion.li
                                      key={idx}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="text-sm text-muted-foreground"
                                    >
                                      {item}
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>
                            )
                          ))}
                        </div>

                        {entry.downloadUrl && (
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download v{entry.version}
                            </Button>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Release Notes
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}