import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
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
          <h1 className="text-xl font-bold text-white ml-2">Privacy Policy</h1>
        </div>
      </header>

      <div className="p-4 pb-24">
        <Card>
          <CardHeader>
            <CardTitle>FitFusion Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="font-semibold mb-2">1. Information We Collect</h3>
              <p className="text-muted-foreground">
                We collect information you provide directly to us, such as when
                you create an account, track workouts, or contact us for
                support.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">
                2. How We Use Your Information
              </h3>
              <p className="text-muted-foreground">
                We use your information to provide, maintain, and improve our
                services, personalize your experience, and communicate with you.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Information Sharing</h3>
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties without your consent, except as
                described in this policy.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Data Security</h3>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Your Rights</h3>
              <p className="text-muted-foreground">
                You have the right to access, update, or delete your personal
                information. Contact us if you wish to exercise these rights.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Contact Us</h3>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please
                contact us at jkenterprise.email@gmail.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default PrivacyPolicy;
