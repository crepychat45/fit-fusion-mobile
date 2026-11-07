import { LegalPage, SELLER } from "@/components/legal/legal-page";

const TermsOfService = () => (
  <LegalPage title="Terms of Service">
    <p>These Terms govern your use of the FitXFusion fitness app and website (the "Service"). The Service is provided by {SELLER} ("we", "us"). By using the Service you are contracting with {SELLER}.</p>
    <h2>1. Acceptance</h2>
    <p>By creating an account or continuing to use the Service, you agree to these Terms. If you do not agree, do not use the Service. You must be of legal age in your country, or have authority to bind the organisation you represent.</p>
    <h2>2. The Service</h2>
    <p>FitXFusion provides workout libraries, a workout player, progress tracking, community features, AI coaching and optional paid Premium plans. Free features remain available without a subscription.</p>
    <h2>3. Your account</h2>
    <p>Keep your login credentials confidential and provide accurate information. You are responsible for activity under your account.</p>
    <h2>4. Acceptable use</h2>
    <ul>
      <li>No unlawful use, fraud, spam or harassment of other members.</li>
      <li>No infringement of others' intellectual property.</li>
      <li>No malware, probing, scraping, reverse engineering or circumventing technical limits.</li>
      <li>No resale or redistribution of the Service.</li>
    </ul>
    <h2>5. AI features</h2>
    <p>AI coaching and generated workouts may be inaccurate and are not medical advice. You are responsible for your prompts and how you use outputs; consult a qualified professional before starting a new exercise programme. We may filter outputs or remove content that breaks these Terms.</p>
    <h2>6. Intellectual property</h2>
    <p>{SELLER} owns the Service, including its software, workouts, documentation and branding. We grant you a limited, non-exclusive, non-transferable licence to use it within your plan. You keep ownership of content you upload and grant us a limited licence to host and process it solely to provide the Service. Rights-holders may report infringing content to us; repeated infringers will be suspended.</p>
    <h2>7. Payments and subscriptions</h2>
    <p>Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.</p>
    <p>Premium plans are billed in INR monthly or yearly and renew automatically until cancelled. Prices are shown on our <a href="/pricing">Pricing page</a>. Payment, billing, taxes, cancellation and refunds are governed by the <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noreferrer">Paddle Buyer Terms</a> and our <a href="/refund-policy">Refund Policy</a>. You can cancel any time; access continues until the end of the paid period.</p>
    <h2>8. Service level</h2>
    <p>We do not guarantee the Service will be uninterrupted or error-free. To the fullest extent permitted by law, the Service is provided "as is" without implied warranties of merchantability or fitness for a particular purpose.</p>
    <h2>9. Suspension and termination</h2>
    <p>We may suspend or terminate access for material breach of these Terms, non-payment, security or fraud risk, or repeated or serious policy violations. You may delete your account at any time; your data is then deleted as described in our Privacy Policy.</p>
    <h2>10. Liability</h2>
    <p>Our aggregate liability is limited to the fees you paid in the 12 months before the claim. We are not liable for indirect or consequential losses (such as lost profits or data). Nothing limits liability for fraud, death or personal injury where the law does not allow it.</p>
    <h2>11. General</h2>
    <p>These Terms are governed by the laws of India. We may update these Terms and will show the new date above. Events beyond reasonable control excuse delays in performance.</p>
    <h2>12. Contact</h2>
    <p>Questions about these Terms can be sent to {SELLER} through the Help page in the app.</p>
  </LegalPage>
);

export default TermsOfService;
