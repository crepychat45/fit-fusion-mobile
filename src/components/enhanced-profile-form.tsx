
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Target, 
  Activity,
  Shield,
  CheckCircle,
  AlertTriangle,
  Zap,
  Upload,
  Save
} from "lucide-react";
import { useSettings } from "@/contexts/settings-context";
import { motion } from "framer-motion";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  fitnessGoal: string;
  activityLevel: string;
  emergencyContact: string;
  medicalConditions: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export function EnhancedProfileForm() {
  const { toast } = useToast();
  const { saveProfileInfo } = useSettings();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    fitnessGoal: "",
    activityLevel: "",
    emergencyContact: "",
    medicalConditions: ""
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { id: 1, title: "Personal Info", fields: ["firstName", "lastName", "email", "phone"] },
    { id: 2, title: "Location & Date", fields: ["location", "dateOfBirth"] },
    { id: 3, title: "Fitness Profile", fields: ["fitnessGoal", "activityLevel"] },
    { id: 4, title: "Emergency & Medical", fields: ["emergencyContact", "medicalConditions"] }
  ];

  React.useEffect(() => {
    calculateProgress();
  }, [formData]);

  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => value.trim() !== "").length;
    setCompletionProgress((filledFields / totalFields) * 100);
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value.length < 2 ? "Must be at least 2 characters" : "";
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? "Invalid email format" : "";
      case "phone":
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        return !phoneRegex.test(value) ? "Invalid phone number" : "";
      case "dateOfBirth":
        const date = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age < 13 || age > 120 ? "Age must be between 13 and 120" : "";
      default:
        return "";
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateStep = (stepId: number): boolean => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return true;
    
    const stepErrors: ValidationErrors = {};
    let isValid = true;
    
    step.fields.forEach(field => {
      const value = formData[field as keyof FormData];
      const error = validateField(field, value);
      
      if (error || !value.trim()) {
        stepErrors[field] = error || "This field is required";
        isValid = false;
      }
    });
    
    setErrors(stepErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps
    let allValid = true;
    for (const step of steps) {
      if (!validateStep(step.id)) {
        allValid = false;
      }
    }
    
    if (!allValid) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await saveProfileInfo(formData);
      
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been saved successfully!",
        });
        
        // Reset form or redirect
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          location: "",
          dateOfBirth: "",
          fitnessGoal: "",
          activityLevel: "",
          emergencyContact: "",
          medicalConditions: ""
        });
        setActiveStep(1);
      } else {
        throw new Error("Failed to save profile");
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = steps.find(s => s.id === activeStep);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Setup
              </CardTitle>
              <CardDescription>
                Complete your profile to get personalized fitness recommendations
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {Math.round(completionProgress)}% Complete
            </Badge>
          </div>
          
          <div className="space-y-2">
            <Progress value={completionProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {steps.map((step) => (
                <span 
                  key={step.id} 
                  className={`flex items-center gap-1 ${
                    step.id === activeStep ? 'text-primary font-medium' : ''
                  } ${step.id < activeStep ? 'text-green-600' : ''}`}
                >
                  {step.id < activeStep && <CheckCircle className="h-3 w-3" />}
                  {step.id === activeStep && <Zap className="h-3 w-3" />}
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form Steps */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                {activeStep}
              </span>
              {currentStep?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              {activeStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={errors.firstName ? "border-red-500" : ""}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={errors.lastName ? "border-red-500" : ""}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className={errors.location ? "border-red-500" : ""}
                      placeholder="City, Country"
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date of Birth *
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className={errors.dateOfBirth ? "border-red-500" : ""}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fitnessGoal" className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Fitness Goal *
                    </Label>
                    <select
                      id="fitnessGoal"
                      value={formData.fitnessGoal}
                      onChange={(e) => handleInputChange("fitnessGoal", e.target.value)}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                        errors.fitnessGoal ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select your goal</option>
                      <option value="weight-loss">Weight Loss</option>
                      <option value="muscle-gain">Muscle Gain</option>
                      <option value="endurance">Improve Endurance</option>
                      <option value="strength">Build Strength</option>
                      <option value="general-fitness">General Fitness</option>
                    </select>
                    {errors.fitnessGoal && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.fitnessGoal}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activityLevel" className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      Activity Level *
                    </Label>
                    <select
                      id="activityLevel"
                      value={formData.activityLevel}
                      onChange={(e) => handleInputChange("activityLevel", e.target.value)}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${
                        errors.activityLevel ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select activity level</option>
                      <option value="sedentary">Sedentary (Little/no exercise)</option>
                      <option value="light">Light (Exercise 1-3 times/week)</option>
                      <option value="moderate">Moderate (Exercise 4-5 times/week)</option>
                      <option value="active">Active (Daily exercise or intense exercise 3-4 times/week)</option>
                      <option value="very-active">Very Active (Intense exercise 6-7 times/week)</option>
                    </select>
                    {errors.activityLevel && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.activityLevel}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      This information is optional but helps us provide better emergency support and health recommendations.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Emergency Contact
                      </Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        placeholder="Name and phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicalConditions" className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        Medical Conditions
                      </Label>
                      <textarea
                        id="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                        placeholder="Any medical conditions, allergies, or physical limitations we should know about..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={activeStep === 1}
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {activeStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Upload className="h-4 w-4 mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
