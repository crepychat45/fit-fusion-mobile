import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LegalDocumentProps {
  title: string;
  content: React.ReactNode;
}

export function LegalDocument({ title, content }: LegalDocumentProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">{content}</ScrollArea>
      </CardContent>
    </Card>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalDocument
      title="Privacy Policy"
      content={
        <div className="space-y-4 text-sm">
          <h3 className="font-medium">FitFusion Privacy Policy</h3>
          <p>Last Updated: April 2025</p>

          <h4 className="font-medium mt-4">1. Information We Collect</h4>
          <p>
            FitFusion collects information that you provide directly to us when
            you:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Create an account</li>
            <li>Fill in forms in our app</li>
            <li>Track workouts and fitness activities</li>
            <li>Communicate with our support team</li>
            <li>Upload photos or other content</li>
          </ul>

          <h4 className="font-medium mt-4">2. How We Use Your Information</h4>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Develop new features and functionality</li>
            <li>Track your fitness progress</li>
            <li>Send you important notifications</li>
            <li>Respond to your comments and questions</li>
          </ul>

          <h4 className="font-medium mt-4">3. Information Sharing</h4>
          <p>
            We do not sell your personal information. We may share information
            in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>With your consent</li>
            <li>For legal purposes if required</li>
            <li>With service providers who work on our behalf</li>
            <li>In anonymous or aggregated form for analytics</li>
          </ul>

          <h4 className="font-medium mt-4">4. Your Choices</h4>
          <p>You can:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Update your account information at any time</li>
            <li>Opt out of marketing communications</li>
            <li>Request deletion of your data</li>
            <li>Adjust privacy settings in the app</li>
          </ul>

          <h4 className="font-medium mt-4">5. Data Security</h4>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information.
          </p>

          <h4 className="font-medium mt-4">6. Changes to This Policy</h4>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last Updated" date.
          </p>

          <h4 className="font-medium mt-4">7. Contact Us</h4>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <p className="mt-1">Email: jkenterprise.email@gmail.com</p>
        </div>
      }
    />
  );
}

export function TermsOfService() {
  return (
    <LegalDocument
      title="Terms of Service"
      content={
        <div className="space-y-4 text-sm">
          <h3 className="font-medium">FitFusion Terms of Service</h3>
          <p>Last Updated: April 2025</p>

          <h4 className="font-medium mt-4">1. Acceptance of Terms</h4>
          <p>
            By accessing or using FitFusion, you agree to be bound by these
            Terms of Service. If you do not agree to all the terms and
            conditions, you may not access or use our services.
          </p>

          <h4 className="font-medium mt-4">2. Account Registration</h4>
          <p>
            To use certain features of the Service, you must register for an
            account. You agree to provide accurate information and keep your
            information updated.
          </p>

          <h4 className="font-medium mt-4">3. User Content</h4>
          <p>
            You retain ownership of any content you submit to FitFusion. By
            providing content, you grant us a worldwide, non-exclusive license
            to use, reproduce, modify, and display your content in connection
            with the Service.
          </p>

          <h4 className="font-medium mt-4">4. Prohibited Conduct</h4>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Violate any laws or regulations</li>
            <li>Impersonate any person or entity</li>
            <li>Interfere with the proper working of the Service</li>
            <li>
              Attempt to access areas of the Service not intended for public
              access
            </li>
            <li>Use the Service for commercial purposes without our consent</li>
          </ul>

          <h4 className="font-medium mt-4">5. Disclaimer of Warranties</h4>
          <p>
            FitFusion is provided "as is" without any warranties, express or
            implied. We do not guarantee that the Service will always be secure
            or error-free.
          </p>

          <h4 className="font-medium mt-4">6. Limitation of Liability</h4>
          <p>
            To the maximum extent permitted by law, FitFusion shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages resulting from your use of or inability to use the
            Service.
          </p>

          <h4 className="font-medium mt-4">7. Health Disclaimer</h4>
          <p>
            FitFusion is not a medical or fitness professional. Always consult
            with qualified professionals before starting any fitness program.
            Use of the app is at your own risk.
          </p>

          <h4 className="font-medium mt-4">8. Termination</h4>
          <p>
            We may terminate or suspend your account and access to the Service
            at our sole discretion, without notice, for conduct that we believe
            violates these Terms or is harmful to other users or us.
          </p>

          <h4 className="font-medium mt-4">9. Changes to Terms</h4>
          <p>
            We may modify these Terms at any time. By continuing to use
            FitFusion after any changes, you accept the modified Terms.
          </p>

          <h4 className="font-medium mt-4">10. Contact Us</h4>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mt-1">Email: jkenterprise.email@gmail.com</p>
        </div>
      }
    />
  );
}

export function DataDeletionRequest() {
  return (
    <LegalDocument
      title="Data Deletion Request"
      content={
        <div className="space-y-4 text-sm">
          <h3 className="font-medium">Data Deletion Request Process</h3>
          <p>Last Updated: April 2025</p>

          <p className="mt-4">
            At FitFusion, we respect your right to control your personal data.
            This document outlines the process for requesting deletion of your
            account and associated data.
          </p>

          <h4 className="font-medium mt-4">What Data Can Be Deleted</h4>
          <p>Upon request, we can delete:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Your account profile information</li>
            <li>Your workout history and activities</li>
            <li>Progress tracking data</li>
            <li>Profile photos and user-generated content</li>
            <li>Settings and preferences</li>
          </ul>

          <h4 className="font-medium mt-4">How to Request Data Deletion</h4>
          <p>You can request data deletion in two ways:</p>
          <ol className="list-decimal pl-6 space-y-1 mt-2">
            <li>
              From within the app: Go to Profile → Privacy → Data Deletion
              Request
            </li>
            <li>
              By email: Send a request to jkenterprise.email@gmail.com with the
              subject "Data Deletion Request" and include your account email
              address
            </li>
          </ol>

          <h4 className="font-medium mt-4">Verification Process</h4>
          <p>
            To protect your privacy and security, we will verify your identity
            before processing your deletion request. This may include confirming
            your email address or requesting additional information.
          </p>

          <h4 className="font-medium mt-4">Timeframe</h4>
          <p>
            We will process your deletion request within 30 days of
            verification. You will receive confirmation when your data has been
            deleted.
          </p>

          <h4 className="font-medium mt-4">Data Retention</h4>
          <p>
            Some information may be retained for legal or legitimate business
            purposes even after deletion, such as:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Records of transactions for financial reporting</li>
            <li>Aggregated or anonymized data that cannot identify you</li>
            <li>Information required for legal compliance</li>
          </ul>

          <h4 className="font-medium mt-4">Third-Party Data</h4>
          <p>
            If you've connected third-party services to FitFusion, you may need
            to separately delete data from those services.
          </p>

          <h4 className="font-medium mt-4">Contact Us</h4>
          <p>
            If you have questions about the data deletion process, please
            contact our privacy team at:
          </p>
          <p className="mt-1">Email: jkenterprise.email@gmail.com</p>
        </div>
      }
    />
  );
}
