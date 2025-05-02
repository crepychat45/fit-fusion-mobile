
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ProfilePhotoUpload } from '@/components/profile-photo-upload';
import { Loader2, Save } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { useToast } from '@/components/ui/use-toast';
import { userProfile } from '@/data/user';

interface ProfileEditorProps {
  onSave?: () => void;
}

export function ProfileEditor({ onSave }: ProfileEditorProps) {
  const [name, setName] = useState(userProfile.name);
  const [goal, setGoal] = useState(userProfile.goal);
  const [bio, setBio] = useState('Fitness enthusiast focused on consistent progress');
  const [level, setLevel] = useState(userProfile.level);
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('78');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { saveProfileInfo } = useSettings();
  const { toast } = useToast();
  
  // Load saved profile data from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('fitfusion-profile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        setName(profileData.name || userProfile.name);
        setGoal(profileData.goal || userProfile.goal);
        setBio(profileData.bio || 'Fitness enthusiast focused on consistent progress');
        setLevel(profileData.level || userProfile.level);
        setAge(profileData.age || '35');
        setGender(profileData.gender || 'Male');
        setHeight(profileData.height || '175');
        setWeight(profileData.weight || '78');
        setProfileImage(profileData.profileImage || null);
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    }
  }, []);
  
  const handleSave = async () => {
    setIsSaving(true);
    
    const profileData = {
      name,
      goal,
      bio,
      level,
      age,
      gender,
      height,
      weight,
      profileImage
    };
    
    try {
      const success = await saveProfileInfo(profileData);
      
      if (success) {
        toast({
          title: 'Profile updated',
          description: 'Your profile information has been saved successfully.'
        });
        
        if (onSave) {
          onSave();
        }
      } else {
        toast({
          title: 'Update failed',
          description: 'There was an error saving your profile information.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'There was an error saving your profile information.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleImageUpdate = (image: string) => {
    setProfileImage(image);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex justify-center">
              <ProfilePhotoUpload 
                name={name} 
                initialImage={profileImage}
                onImageUpdate={handleImageUpdate} 
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    id="age" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    type="number"
                    min="16"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal">Fitness Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger id="goal">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Build muscle & improve fitness">Build muscle & improve fitness</SelectItem>
                  <SelectItem value="Lose weight">Lose weight</SelectItem>
                  <SelectItem value="Increase strength">Increase strength</SelectItem>
                  <SelectItem value="Improve endurance">Improve endurance</SelectItem>
                  <SelectItem value="Maintain fitness">Maintain fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="level">Fitness Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Tell us about yourself and your fitness journey"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input 
                  id="height" 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)} 
                  type="number"
                  min="100"
                  max="250"
                />
              </div>
              
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input 
                  id="weight" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  type="number"
                  min="30"
                  max="300"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        className="w-full" 
        size="lg"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Profile
          </>
        )}
      </Button>
    </div>
  );
}
