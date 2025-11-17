import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Download,
  Star,
  Clock,
  Activity,
  Zap,
  Heart,
  TrendingUp,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  Watch,
} from "lucide-react";

interface WatchFace {
  id: string;
  name: string;
  thumbnail: string;
  category: "digital" | "analog" | "fitness" | "minimal" | "custom";
  rating: number;
  downloads: number;
  premium: boolean;
  compatible: string[];
}

const mockWatchFaces: WatchFace[] = [
  {
    id: "wf-1",
    name: "Digital Fitness Pro",
    thumbnail: "https://images.unsplash.com/photo-1523395243481-163f8f6155ab?w=400&h=400&fit=crop",
    category: "digital",
    rating: 4.8,
    downloads: 15420,
    premium: false,
    compatible: ["Apple", "Samsung", "Garmin"],
  },
  {
    id: "wf-2",
    name: "Classic Analog Elite",
    thumbnail: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=400&fit=crop",
    category: "analog",
    rating: 4.9,
    downloads: 23100,
    premium: true,
    compatible: ["Apple", "Samsung"],
  },
  {
    id: "wf-3",
    name: "Minimal Mono",
    thumbnail: "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=400&h=400&fit=crop",
    category: "minimal",
    rating: 4.7,
    downloads: 18900,
    premium: false,
    compatible: ["All"],
  },
  {
    id: "wf-4",
    name: "Activity Tracker",
    thumbnail: "https://images.unsplash.com/photo-1575052814074-e2e34ebc4297?w=400&h=400&fit=crop",
    category: "fitness",
    rating: 4.6,
    downloads: 12340,
    premium: false,
    compatible: ["Garmin", "Fitbit"],
  },
  {
    id: "wf-5",
    name: "Smart Digital",
    thumbnail: "https://images.unsplash.com/photo-1598662957477-0b4f47687f26?w=400&h=400&fit=crop",
    category: "digital",
    rating: 4.8,
    downloads: 19870,
    premium: true,
    compatible: ["Apple", "Samsung", "Huawei"],
  },
  {
    id: "wf-6",
    name: "Sport Focus",
    thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop",
    category: "fitness",
    rating: 4.9,
    downloads: 25600,
    premium: false,
    compatible: ["All"],
  },
];

interface WatchFaceGalleryProps {
  deviceBrand?: string;
  onApply: (faceId: string) => void;
}

export const WatchFaceGallery: React.FC<WatchFaceGalleryProps> = ({
  deviceBrand = "All",
  onApply,
}) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFace, setAppliedFace] = useState<string | null>(null);

  const categoryIcons = {
    all: Activity,
    digital: Clock,
    analog: Watch,
    fitness: TrendingUp,
    minimal: Zap,
    custom: ImageIcon,
  };

  const filteredFaces = mockWatchFaces.filter((face) => {
    const matchesCategory = selectedCategory === "all" || face.category === selectedCategory;
    const matchesSearch = face.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDevice = 
      face.compatible.includes("All") || 
      face.compatible.some(brand => brand.toLowerCase().includes(deviceBrand.toLowerCase()));
    return matchesCategory && matchesSearch && matchesDevice;
  });

  const handleApply = (faceId: string, faceName: string) => {
    setAppliedFace(faceId);
    onApply(faceId);
    
    toast({
      title: "Watch Face Applied",
      description: `${faceName} is now syncing to your device`,
    });

    // Simulate sync completion
    setTimeout(() => {
      toast({
        title: "Sync Complete",
        description: "Your watch face has been updated",
      });
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search watch faces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-max">
              {["all", "digital", "analog", "fitness", "minimal", "custom"].map((cat) => {
                const Icon = categoryIcons[cat as keyof typeof categoryIcons];
                return (
                  <TabsTrigger key={cat} value={cat} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Gallery Grid */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-4">
          {filteredFaces.map((face, index) => (
            <motion.div
              key={face.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 ${
                appliedFace === face.id ? 'border-primary shadow-lg' : ''
              }`}>
                <div className="relative aspect-square">
                  <img
                    src={face.thumbnail}
                    alt={face.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleApply(face.id, face.name)}
                      disabled={appliedFace === face.id}
                    >
                      {appliedFace === face.id ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Applied
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Apply
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 right-2 space-y-1">
                    {face.premium && (
                      <Badge className="bg-yellow-500/90 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {appliedFace === face.id && (
                      <Badge className="bg-green-500/90 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-3 space-y-2">
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{face.name}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{face.category}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{face.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {(face.downloads / 1000).toFixed(1)}K downloads
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Custom Upload Section */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center space-y-3">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Upload Custom Watch Face</h4>
              <p className="text-sm text-muted-foreground">
                Create your own personalized watch face
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Choose Image
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
