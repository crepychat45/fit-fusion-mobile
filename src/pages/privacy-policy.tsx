import { LegalPage, SELLER } from "@/components/legal/legal-page";

const PrivacyPolicy = () => (
  <LegalPage title="Privacy Policy">
    <p>This notice explains how {SELLER} ("we") handles personal data when you use the FitXFusion app and website. {SELLER} is the data controller responsible for your personal data.</p>
    <h2>Data we collect and why</h2>
    <ul>
      <li><b>Account data</b> (name, email, login credentials, profile photo) — to create and secure your account. Legal basis: contract.</li>
      <li><b>Fitness data</b> (workouts, progress, body metrics, sleep and water logs, data from watches you connect) — to provide tracking and coaching. Legal basis: contract and your consent for health data.</li>
      <li><b>Community and chat content</b> (posts, messages, AI coach prompts) — to provide those features. Legal basis: contract.</li>
      <li><b>Support messages</b> — to answer your requests. Legal basis: legitimate interests.</li>
      <li><b>Usage and device data</b> (IP address, device identifiers, app events, push tokens) — for security, fraud prevention, notifications and product improvement. Legal basis: legitimate interests or consent.</li>
    </ul>
    <h2>Who we share data with</h2>
    <ul>
      <li>Service providers that host the app, run the database, deliver notifications and process AI requests on our behalf.</li>
      <li>Paddle.com, our Merchant of Record, for the sale of subscriptions, subscription management, payments, tax compliance and invoicing.</li>
      <li>Professional advisers (legal, accounting) where needed.</li>
      <li>Authorities where required by law.</li>
    </ul>
    <p>We do not sell your personal data.</p>
    <h2>International transfers</h2>
    <p>Our providers may process data outside your country. Where required, we rely on safeguards such as Standard Contractual Clauses.</p>
    <h2>Retention</h2>
    <p>We keep account and fitness data while your account is active. When you delete your account, we delete or anonymise your data within 30 days, except records we must keep by law (such as transaction records, kept by Paddle and us as legally required).</p>
    <h2>Your rights</h2>
    <p>You can access, correct, export (via Export Data in the app), delete or restrict use of your data, object to processing, and withdraw consent at any time. You may also complain to your local data protection authority. We respond to requests within one month.</p>
    <h2>Security</h2>
    <p>We use encryption in transit, access controls and per-user data isolation to protect your data.</p>
    <h2>Cookies and local storage</h2>
    <p>We use essential browser storage to keep you signed in and remember your settings. We do not use advertising cookies. You can clear stored data in your browser or in Settings.</p>
    <h2>Contact</h2>
    <p>Contact {SELLER} through the Help page in the app for any privacy request.</p>
  </LegalPage>
);

export default PrivacyPolicy;
