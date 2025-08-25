import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Plus,
  Users,
  MessageCircle,
  Video,
  Phone,
  MoreVertical,
  Crown,
  Shield,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  status: "online" | "offline" | "away" | "busy";
  lastSeen?: Date;
  isVerified?: boolean;
  isPremium?: boolean;
  fitnessLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  specialties?: string[];
  mutualConnections?: number;
}

interface UserChatListProps {
  onUserSelect: (user: User) => void;
  onGroupChatCreate: () => void;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    username: "@sarah_fit",
    status: "online",
    isVerified: true,
    isPremium: true,
    fitnessLevel: "expert",
    specialties: ["Yoga", "Pilates", "Nutrition"],
    mutualConnections: 12,
  },
  {
    id: "2",
    name: "Mike Chen",
    username: "@mike_gains",
    status: "online",
    isVerified: false,
    isPremium: false,
    fitnessLevel: "intermediate",
    specialties: ["Weightlifting", "CrossFit"],
    mutualConnections: 8,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    username: "@emily_runner",
    status: "away",
    isVerified: true,
    isPremium: true,
    fitnessLevel: "advanced",
    specialties: ["Running", "Marathon Training"],
    mutualConnections: 15,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: "4",
    name: "Alex Thompson",
    username: "@alex_coach",
    status: "busy",
    isVerified: true,
    isPremium: true,
    fitnessLevel: "expert",
    specialties: ["Personal Training", "Strength Training", "Nutrition"],
    mutualConnections: 25,
  },
  {
    id: "5",
    name: "Jessica Wang",
    username: "@jess_wellness",
    status: "offline",
    isVerified: false,
    isPremium: false,
    fitnessLevel: "beginner",
    specialties: ["Wellness", "Meditation"],
    mutualConnections: 3,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
];

export function UserChatList({
  onUserSelect,
  onGroupChatCreate,
}: UserChatListProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [filter, setFilter] = useState<
    "all" | "online" | "verified" | "premium"
  >("all");
  const { toast } = useToast();

  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.specialties?.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesFilter =
        filter === "all" ||
        (filter === "online" && user.status === "online") ||
        (filter === "verified" && user.isVerified) ||
        (filter === "premium" && user.isPremium);

      return matchesSearch && matchesFilter;
    });

    setFilteredUsers(filtered);
  }, [searchQuery, filter, users]);

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getFitnessLevelColor = (level: User["fitnessLevel"]) => {
    switch (level) {
      case "beginner":
        return "bg-blue-500";
      case "intermediate":
        return "bg-purple-500";
      case "advanced":
        return "bg-orange-500";
      case "expert":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return "";
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleStartChat = (user: User) => {
    toast({
      title: "Starting chat",
      description: `Opening conversation with ${user.name}`,
    });
    onUserSelect(user);
  };

  const filterOptions = [
    { value: "all", label: "All Users", icon: Users },
    { value: "online", label: "Online", icon: MessageCircle },
    { value: "verified", label: "Verified", icon: Shield },
    { value: "premium", label: "Premium", icon: Crown },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">
              Connect with Fitness Community
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} members available
            </p>
          </div>
          <Button
            onClick={onGroupChatCreate}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Group Chat
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, username, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value as any)}
              className="flex-shrink-0"
            >
              <option.icon className="h-3 w-3 mr-1" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-all duration-200"
              onClick={() => handleStartChat(user)}
            >
              <div className="flex items-start gap-3">
                {/* Avatar with status */}
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-background`}
                  />
                  {user.isVerified && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Shield className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name and badges */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    {user.isPremium && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="h-2 w-2 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {user.fitnessLevel && (
                      <Badge
                        className={`text-xs text-white ${getFitnessLevelColor(user.fitnessLevel)}`}
                      >
                        {user.fitnessLevel}
                      </Badge>
                    )}
                  </div>

                  {/* Username and status */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">
                      {user.username}
                    </span>
                    {user.status === "offline" && user.lastSeen && (
                      <span className="text-xs text-muted-foreground">
                        • {formatLastSeen(user.lastSeen)}
                      </span>
                    )}
                  </div>

                  {/* Specialties */}
                  {user.specialties && user.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {user.specialties.slice(0, 3).map((specialty) => (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {user.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Mutual connections */}
                  {user.mutualConnections && user.mutualConnections > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {user.mutualConnections} mutual connections
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" className="h-8">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Video className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found matching your criteria</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
