/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Click the button below to accept the invitation and create your
          account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", padding: '40px 0' }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid hsl(240, 5%, 90%)', borderRadius: '24px' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: 'hsl(240, 5%, 10%)', margin: '0 0 20px', letterSpacing: '-0.02em' }
const text = { fontSize: '15px', color: 'hsl(240, 5%, 35%)', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: 'hsl(333, 71%, 50%)', textDecoration: 'underline', fontWeight: 500 as const }
const button = { background: 'linear-gradient(135deg, hsl(333, 71%, 50%), hsl(328, 85%, 60%))', color: '#ffffff', fontSize: '15px', fontWeight: 600 as const, borderRadius: '24px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 12px hsla(333, 71%, 50%, 0.25)' }
const footer = { fontSize: '13px', color: 'hsl(240, 5%, 50%)', margin: '32px 0 0', borderTop: '1px solid hsl(240, 5%, 92%)', paddingTop: '20px' }
