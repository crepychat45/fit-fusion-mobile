import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square,
  Download,
  Upload,
  Headphones,
  Speaker,
  Radio,
  Waves,
  Zap,
  Settings,
  Brain,
  Languages,
  Ear
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceMessage {
  id: string;
  type: "input" | "output";
  audioBlob: Blob;
  transcript?: string;
  timestamp: Date;
  duration: number;
  processed: boolean;
}

interface EnhancedVoiceFeaturesProps {
  onVoiceInput?: (transcript: string, audioBlob: Blob) => void;
  onPlaybackComplete?: () => void;
  isAIResponding?: boolean;
}

export function EnhancedVoiceFeatures({ 
  onVoiceInput,
  onPlaybackComplete,
  isAIResponding = false
}: EnhancedVoiceFeaturesProps) {
  const { toast } = useToast();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Voice messages
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  
  // Settings
  const [voiceSettings, setVoiceSettings] = useState({
    inputVolume: 80,
    outputVolume: 75,
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true,
    voiceActivation: false,
    language: "en-US",
    speechRate: 1.0,
    speechPitch: 1.0,
    voiceProfile: "alloy"
  });
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Available voice profiles
  const voiceProfiles = [
    { id: "alloy", name: "Alloy", description: "Neutral, balanced tone" },
    { id: "echo", name: "Echo", description: "Warm, engaging voice" },
    { id: "fable", name: "Fable", description: "Expressive, storytelling" },
    { id: "onyx", name: "Onyx", description: "Deep, authoritative" },
    { id: "nova", name: "Nova", description: "Bright, energetic" },
    { id: "shimmer", name: "Shimmer", description: "Gentle, soothing" }
  ];

  // Supported languages
  const supportedLanguages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "pt-BR", name: "Portuguese" },
    { code: "ru-RU", name: "Russian" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "hi-IN", name: "Hindi" }
  ];

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioElementRef.current = new Audio();
    }
    
    return () => {
      cleanupRecording();
    };
  }, []);

  // Audio level monitoring
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average);
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: voiceSettings.echoCancellation,
          noiseSuppression: voiceSettings.noiseReduction,
          autoGainControl: voiceSettings.autoGainControl,
          sampleRate: 44100,
          channelCount: 1
        }
      });

      streamRef.current = stream;
      
      // Setup audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        // Create voice message
        const voiceMessage: VoiceMessage = {
          id: Date.now().toString(),
          type: "input",
          audioBlob,
          timestamp: new Date(),
          duration: recordingTime,
          processed: false
        };

        setVoiceMessages(prev => [...prev, voiceMessage]);

        // Process voice to text
        await processVoiceToText(voiceMessage);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer and audio monitoring
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      monitorAudioLevel();

      toast({
        title: "🎤 Recording Started",
        description: "Speak clearly into your microphone",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "❌ Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      cleanupRecording();
      
      toast({
        title: "✅ Recording Complete",
        description: "Processing your voice message...",
      });
    }
  };

  // Cleanup recording resources
  const cleanupRecording = () => {
    setIsRecording(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setAudioLevel(0);
  };

  // Process voice to text using Web Speech API
  const processVoiceToText = async (voiceMessage: VoiceMessage) => {
    try {
      // Simulate voice processing (replace with actual API call)
      const mockTranscripts = [
        "What's the best workout for building muscle?",
        "How many calories should I eat to lose weight?",
        "Can you suggest a 30-minute cardio routine?",
        "What are some healthy post-workout snacks?",
        "How do I improve my running endurance?",
        "What's the proper form for deadlifts?"
      ];
      
      const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      
      // Update voice message with transcript
      setVoiceMessages(prev => 
        prev.map(msg => 
          msg.id === voiceMessage.id 
            ? { ...msg, transcript: randomTranscript, processed: true }
            : msg
        )
      );

      // Call callback with transcript and audio
      if (onVoiceInput) {
        onVoiceInput(randomTranscript, voiceMessage.audioBlob);
      }

      toast({
        title: "🎯 Voice Processed",
        description: "Your message has been transcribed successfully!",
      });

    } catch (error) {
      console.error('Error processing voice:', error);
      toast({
        title: "❌ Processing Error",
        description: "Failed to process voice message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Play audio message
  const playAudioMessage = async (voiceMessage: VoiceMessage) => {
    if (!audioElementRef.current) return;

    try {
      const audioUrl = URL.createObjectURL(voiceMessage.audioBlob);
      audioElementRef.current.src = audioUrl;
      audioElementRef.current.volume = voiceSettings.outputVolume / 100;
      
      audioElementRef.current.onended = () => {
        setIsPlaying(false);
        setSelectedMessage(null);
        URL.revokeObjectURL(audioUrl);
        onPlaybackComplete?.();
      };

      await audioElementRef.current.play();
      setIsPlaying(true);
      setSelectedMessage(voiceMessage.id);

    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "❌ Playback Error",
        description: "Unable to play audio message.",
        variant: "destructive"
      });
    }
  };

  // Stop audio playback
  const stopPlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsPlaying(false);
      setSelectedMessage(null);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice level visualization
  const VoiceLevelVisualizer = () => {
    const level = (audioLevel / 255) * 100;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-1 bg-primary rounded-full ${
              level > i * 10 ? 'opacity-100' : 'opacity-20'
            }`}
            style={{ height: `${Math.max(4, (level / 10) * (i + 1))}px` }}
            animate={{ 
              height: level > i * 10 ? `${Math.max(8, (level / 5) * (i + 1))}px` : '4px'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Voice Recording Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Recording
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Button and Status */}
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className={`rounded-full h-20 w-20 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAIResponding}
              >
                <motion.div
                  animate={isRecording ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {isRecording ? (
                    <Square className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </motion.div>
              </Button>
            </motion.div>

            {/* Recording Status */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center space-y-2"
                >
                  <Badge variant="destructive" className="animate-pulse">
                    Recording {formatTime(recordingTime)}
                  </Badge>
                  <VoiceLevelVisualizer />
                  <p className="text-sm text-muted-foreground">
                    Tap to stop recording
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!isRecording && voiceMessages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Tap the microphone to start voice recording
              </p>
            )}
          </div>

          {/* Voice Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select 
                value={voiceSettings.language}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        {lang.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Voice Profile</label>
              <Select 
                value={voiceSettings.voiceProfile}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, voiceProfile: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div>
                        <div className="font-medium">{profile.name}</div>
                        <div className="text-xs text-muted-foreground">{profile.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Input Volume
              </label>
              <Slider
                value={[voiceSettings.inputVolume]}
                onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, inputVolume: value }))}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-right">
                {voiceSettings.inputVolume}%
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Output Volume
              </label>
              <Slider
                value={[voiceSettings.outputVolume]}
                onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, outputVolume: value }))}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-right">
                {voiceSettings.outputVolume}%
              </div>
            </div>
          </div>

          {/* Audio Enhancement Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Noise Reduction</label>
              <Switch
                checked={voiceSettings.noiseReduction}
                onCheckedChange={(checked) => setVoiceSettings(prev => ({ ...prev, noiseReduction: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Echo Cancellation</label>
              <Switch
                checked={voiceSettings.echoCancellation}
                onCheckedChange={(checked) => setVoiceSettings(prev => ({ ...prev, echoCancellation: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto Gain Control</label>
              <Switch
                checked={voiceSettings.autoGainControl}
                onCheckedChange={(checked) => setVoiceSettings(prev => ({ ...prev, autoGainControl: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Messages History */}
      {voiceMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Voice Messages ({voiceMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {voiceMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${
                    selectedMessage === message.id ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedMessage === message.id && isPlaying) {
                            stopPlayback();
                          } else {
                            playAudioMessage(message);
                          }
                        }}
                      >
                        {selectedMessage === message.id && isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <div>
                        <div className="text-sm font-medium">
                          {formatTime(message.duration)} • {message.timestamp.toLocaleTimeString()}
                        </div>
                        {message.transcript && (
                          <div className="text-sm text-muted-foreground mt-1">
                            "{message.transcript}"
                          </div>
                        )}
                        {!message.processed && (
                          <Badge variant="secondary" className="mt-1">
                            <Brain className="h-3 w-3 mr-1" />
                            Processing...
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {message.type === "input" ? "You" : "AI"}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}