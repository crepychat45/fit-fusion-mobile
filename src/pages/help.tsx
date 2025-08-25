import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import {
  ChevronLeft,
  HelpCircle,
  MessageCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactForm } from "@/components/contact-form";
import { AIChatbot } from "@/components/ai-chatbot";

const Help = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("faq");

  const faqs = [
    {
      question: "How do I track my progress?",
      answer:
        "You can view your progress in the Progress tab. It displays your workout history, weight changes, and other fitness metrics over time.",
    },
    {
      question: "Can I create custom workouts?",
      answer:
        "Yes! Go to the Workouts tab and tap the '+' button to create your own custom workout with exercises of your choice.",
    },
    {
      question: "How do I edit my profile?",
      answer:
        "Navigate to the Profile tab and tap 'Edit Profile' to update your personal information, fitness goals, and profile picture.",
    },
    {
      question: "Can I sync with other fitness devices?",
      answer:
        "Currently, we support syncing with popular fitness wearables. Go to Settings > Integrations to connect your devices.",
    },
    {
      question: "How accurate are the calorie calculations?",
      answer:
        "Our calorie calculations are estimates based on your weight, height, age, and activity level. For the most accurate results, consider using a heart rate monitor.",
    },
    {
      question: "Can I use FitFusion offline?",
      answer:
        "Yes, many features of FitFusion work offline. Your workout data will sync when you reconnect to the internet.",
    },
    {
      question: "How do I earn achievements?",
      answer:
        "Achievements are earned by completing specific fitness goals, like workout streaks or trying different exercise types. View your achievements in your Profile.",
    },
  ];

  const guides = [
    {
      title: "Getting Started with FitFusion",
      description: "Learn the basics and set up your profile",
      icon: <HelpCircle className="h-5 w-5 text-primary" />,
    },
    {
      title: "Creating Custom Workouts",
      description: "Design your perfect workout routine",
      icon: <HelpCircle className="h-5 w-5 text-primary" />,
    },
    {
      title: "Tracking Your Progress",
      description: "Monitor your fitness journey effectively",
      icon: <HelpCircle className="h-5 w-5 text-primary" />,
    },
    {
      title: "Using the Calendar",
      description: "Schedule and manage your workout plan",
      icon: <HelpCircle className="h-5 w-5 text-primary" />,
    },
    {
      title: "Understanding Your Stats",
      description: "Make sense of your fitness data",
      icon: <HelpCircle className="h-5 w-5 text-primary" />,
    },
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
        <Tabs defaultValue="faq" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="faq">
            <Accordion
              type="single"
              collapsible
              className="bg-card rounded-lg shadow-sm"
            >
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

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center mb-2">
                <MessageCircle className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">Need more help?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Can't find what you're looking for? Contact our support team or
                try our AI assistant.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => setActiveTab("contact")}
                >
                  Contact Us
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab("assistant")}
                >
                  AI Assistant
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guides">
            <div className="space-y-3">
              {guides.map((guide, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="bg-secondary rounded-full p-2 flex-shrink-0">
                      {guide.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{guide.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {guide.description}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FileText className="h-5 w-5 text-primary mr-2" />
                    App Documentation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Comprehensive guides for all FitFusion features.
                  </p>
                  <Button className="w-full">View Documentation</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <ContactForm />
          </TabsContent>

          <TabsContent value="assistant">
            <AIChatbot />
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Help;
