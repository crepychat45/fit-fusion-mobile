import { LegalPage, SELLER } from "@/components/legal/legal-page";

const RefundPolicy = () => (
  <LegalPage title="Refund Policy">
    <p>{SELLER} offers a 30-day money-back guarantee on all FitXFusion Premium plans.</p>
    <h2>Refund period</h2>
    <p>If you're not satisfied, you can request a full refund within 30 days of your order date, for any reason — including a change of mind.</p>
    <h2>How to request a refund</h2>
    <p>Refunds are processed by our payment provider and Merchant of Record, Paddle. To request one, visit <a href="https://paddle.net" target="_blank" rel="noreferrer">paddle.net</a> and look up your order using the email you paid with, or contact us through the Help page in the app and we will arrange it.</p>
    <h2>Cancelling</h2>
    <p>You can cancel your subscription at any time from the Subscription page. Cancelling stops future renewals; you keep Premium until the end of the period you paid for.</p>
    <p>See also Paddle's <a href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noreferrer">refund policy</a>.</p>
  </LegalPage>
);

export default RefundPolicy;
