import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Watch,
  Smartphone,
  Wifi,
  CheckCircle,
} from "lucide-react";

interface DeviceWizardProps {
  onComplete: (device: any) => void;
  onCancel: () => void;
}

const watchBrands = [
  { id: "apple", name: "Apple Watch", icon: "🍎", models: ["Series 9", "Ultra 2", "SE 2"] },
  { id: "samsung", name: "Samsung Galaxy", icon: "📱", models: ["Watch 6", "Watch 6 Classic", "Watch 5 Pro"] },
  { id: "garmin", name: "Garmin", icon: "🏃", models: ["Fenix 7", "Forerunner 965", "Venu 3"] },
  { id: "fitbit", name: "Fitbit", icon: "💪", models: ["Sense 2", "Versa 4", "Charge 6"] },
  { id: "huawei", name: "Huawei Watch", icon: "📲", models: ["GT 4", "Fit 3", "Ultimate"] },
];

export const SmartWatchDeviceWizard: React.FC<DeviceWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      const brand = watchBrands.find(b => b.id === selectedBrand);
      const newDevice = {
        id: `${selectedBrand}-${Date.now()}`,
        name: deviceName || `${brand?.name} ${selectedModel}`,
        model: selectedModel,
        brand: brand?.name || "",
        brandIcon: brand?.icon || "⌚",
        connected: true,
        batteryLevel: 85,
        signalStrength: 90,
        heartRate: 72,
        steps: 0,
        lastSync: "Just now",
        status: "connected" as const,
      };
      onComplete(newDevice);
      setIsConnecting(false);
    }, 2000);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <Watch className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Select Your Watch Brand</h3>
              <p className="text-sm text-muted-foreground">
                Choose the brand of your smartwatch
              </p>
            </div>

            <RadioGroup
              value={selectedBrand}
              onValueChange={setSelectedBrand}
              className="space-y-3"
            >
              {watchBrands.map((brand) => (
                <label
                  key={brand.id}
                  className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all hover:bg-accent/50 ${
                    selectedBrand === brand.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <RadioGroupItem value={brand.id} id={brand.id} />
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{brand.icon}</span>
                    <span className="font-medium">{brand.name}</span>
                  </div>
                  {selectedBrand === brand.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </label>
              ))}
            </RadioGroup>
          </motion.div>
        );

      case 2:
        const selectedBrandData = watchBrands.find(b => b.id === selectedBrand);
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <div className="text-3xl mx-auto">{selectedBrandData?.icon}</div>
              <h3 className="text-lg font-semibold">Select Model</h3>
              <p className="text-sm text-muted-foreground">
                Choose your {selectedBrandData?.name} model
              </p>
            </div>

            <RadioGroup
              value={selectedModel}
              onValueChange={setSelectedModel}
              className="space-y-3"
            >
              {selectedBrandData?.models.map((model) => (
                <label
                  key={model}
                  className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all hover:bg-accent/50 ${
                    selectedModel === model
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <RadioGroupItem value={model} id={model} />
                  <span className="font-medium flex-1">{model}</span>
                  {selectedModel === model && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </label>
              ))}
            </RadioGroup>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <Smartphone className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Name Your Device</h3>
              <p className="text-sm text-muted-foreground">
                Give your watch a custom name (optional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device-name">Device Name</Label>
              <Input
                id="device-name"
                placeholder={`My ${selectedBrandData?.name} ${selectedModel}`}
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Brand:</span>
                <span className="text-muted-foreground">{selectedBrandData?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Model:</span>
                <span className="text-muted-foreground">{selectedModel}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Name:</span>
                <span className="text-muted-foreground">
                  {deviceName || `${selectedBrandData?.name} ${selectedModel}`}
                </span>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {!isConnecting ? (
              <>
                <div className="text-center space-y-2">
                  <Wifi className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="text-lg font-semibold">Connect Your Device</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow the instructions on your watch to complete pairing
                  </p>
                </div>

                <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs">
                      1
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Open your watch settings</p>
                      <p className="text-muted-foreground">Navigate to Bluetooth or connectivity settings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs">
                      2
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Enable pairing mode</p>
                      <p className="text-muted-foreground">Your watch should show "Ready to pair"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs">
                      3
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Confirm connection</p>
                      <p className="text-muted-foreground">Click connect below to complete setup</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Wifi className="h-16 w-16 mx-auto text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold">Connecting...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we establish a connection with your device
                </p>
                <Progress value={66} className="w-full max-w-xs mx-auto" />
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Step {step} of {totalSteps}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        {step > 1 && !isConnecting && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isConnecting}
          className="ml-auto"
        >
          Cancel
        </Button>
        {step < totalSteps && (
          <Button
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedBrand) ||
              (step === 2 && !selectedModel)
            }
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {step === totalSteps && !isConnecting && (
          <Button
            onClick={handleConnect}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Connect Device
          </Button>
        )}
      </div>
    </div>
  );
};
