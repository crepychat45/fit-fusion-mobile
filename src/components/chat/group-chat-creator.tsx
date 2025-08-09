
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, X, Plus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

interface GroupChatCreatorProps {
  onCreateGroup: (groupName: string, selectedUsers: User[]) => void;
  onClose: () => void;
}

export function GroupChatCreator({ onCreateGroup, onClose }: GroupChatCreatorProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Simulated user list
  const availableUsers: User[] = [
    { id: '1', name: 'Alice Johnson', status: 'online' },
    { id: '2', name: 'Bob Smith', status: 'away' },
    { id: '3', name: 'Charlie Brown', status: 'online' },
    { id: '4', name: 'Diana Prince', status: 'offline' },
    { id: '5', name: 'Ethan Hunt', status: 'online' },
    { id: '6', name: 'Fiona Green', status: 'away' },
    { id: '7', name: 'George Wilson', status: 'online' },
    { id: '8', name: 'Hannah Davis', status: 'offline' }
  ];

  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedUsers.find(selected => selected.id === user.id)
  );

  const handleUserSelect = (user: User) => {
    if (selectedUsers.length >= 10) {
      toast({
        title: "Maximum users reached",
        description: "You can add up to 10 users in a group chat",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedUsers(prev => [...prev, user]);
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive"
      });
      return;
    }

    if (selectedUsers.length < 2) {
      toast({
        title: "Not enough users",
        description: "Please select at least 2 users to create a group",
        variant: "destructive"
      });
      return;
    }

    onCreateGroup(groupName, selectedUsers);
    onClose();
    
    toast({
      title: "Group created",
      description: `"${groupName}" has been created with ${selectedUsers.length} members`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="w-96 bg-background border rounded-lg shadow-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Create Group Chat
        </h3>
        <p className="text-sm text-muted-foreground">Add members to start a group conversation</p>
      </div>

      {/* Group Name Input */}
      <div className="mb-4">
        <Label htmlFor="groupName">Group Name</Label>
        <Input
          id="groupName"
          placeholder="Enter group name..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          maxLength={50}
        />
      </div>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="mb-4">
          <Label>Selected Members ({selectedUsers.length}/10)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                {user.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleUserRemove(user.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* User Search */}
      <div className="mb-4">
        <Label>Add Members</Label>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Available Users */}
      <div className="mb-4">
        <div className="max-h-48 overflow-y-auto space-y-2">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-3 hover:bg-muted cursor-pointer" onClick={() => handleUserSelect(user)}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
                </div>
                
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          
          {filteredUsers.length === 0 && searchQuery && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No users found matching "{searchQuery}"
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={handleCreateGroup} 
          className="flex-1"
          disabled={!groupName.trim() || selectedUsers.length < 2}
        >
          Create Group
        </Button>
      </div>
    </div>
  );
}
