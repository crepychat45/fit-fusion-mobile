
import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft, HelpCircle, MessageCircle, FileText, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I track my progress?",
      answer: "You can view your progress in the Progress tab. It displays your workout history, weight changes, and other fitness metrics over time."
    },
    {
      question: "Can I create custom workouts?",
      answer: "Yes! Go to the Workouts tab and tap the '+' button to create your own custom workout with exercises of your choice."
    },
    {
      question: "How do I edit my profile?",
      answer: "Navigate to the Profile tab and tap 'Edit Profile' to update your personal information, fitness goals, and profile picture."
    },
    {
      question: "Can I sync with other fitness devices?",
      answer: "Currently, we support syncing with popular fitness wearables. Go to Settings > Integrations to connect your devices."
    },
    {
      question: "How accurate are the calorie calculations?",
      answer: "Our calorie calculations are estimates based on your weight, height, age, and activity level. For the most accurate results, consider using a heart rate monitor."
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="text-white p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">Help & Support</h1>
        </div>
      </div>
      
      {/* Help Content */}
      <div className="px-4 py-6">
        {/* Support Options */}
        <h3 className="font-medium mb-3">Get Support</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="hover:bg-secondary/20 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <MessageCircle className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Contact Us</h4>
              <p className="text-xs text-muted-foreground">Get direct support</p>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-secondary/20 transition-colors cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <FileText className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Guides</h4>
              <p className="text-xs text-muted-foreground">Read tutorials</p>
            </CardContent>
          </Card>
        </div>
        
        {/* FAQs */}
        <h3 className="font-medium mb-3">Frequently Asked Questions</h3>
        <Accordion type="single" collapsible className="bg-card rounded-lg shadow-sm">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {/* Video Tutorials */}
        <h3 className="font-medium mt-6 mb-3">Video Tutorials</h3>
        <Card className="mb-3">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="bg-secondary rounded-full p-2">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Getting Started</h4>
              <p className="text-sm text-muted-foreground">Learn the basics in 2 minutes</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        
        <Card className="mb-3">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="bg-secondary rounded-full p-2">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Tracking Workouts</h4>
              <p className="text-sm text-muted-foreground">Record your exercises effectively</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="bg-secondary rounded-full p-2">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Using the Progress Features</h4>
              <p className="text-sm text-muted-foreground">How to track your fitness journey</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Help;
