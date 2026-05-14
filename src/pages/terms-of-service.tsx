import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-white p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">
            Terms of Service
          </h1>
        </div>
      </header>

      <div className="p-4 pb-24">
        <Card>
          <CardHeader>
            <CardTitle>FitFusion Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By using FitFusion, you agree to be bound by these Terms of
                Service and our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. Service Description</h3>
              <p className="text-muted-foreground">
                FitFusion is a fitness tracking and workout planning application
                that helps users achieve their health and fitness goals.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. User Responsibilities</h3>
              <p className="text-muted-foreground">
                Users are responsible for maintaining the accuracy of their
                health information and consulting healthcare professionals
                before starting any fitness program.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Health Disclaimer</h3>
              <p className="text-muted-foreground">
                FitFusion is not a substitute for professional medical advice.
                Always consult your doctor before beginning any exercise
                program.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Data Usage</h3>
              <p className="text-muted-foreground">
                We collect and use your data as described in our Privacy Policy
                to provide and improve our services.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Limitation of Liability</h3>
              <p className="text-muted-foreground">
                FitFusion is not liable for any injuries or health issues that
                may arise from using our application or following our workout
                recommendations.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default TermsOfService;
