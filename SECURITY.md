# Security Policy

## Supported Versions

The following versions of this project receive security updates via Dependabot:

| Version  | Supported |
| -------- | --------- |
| latest   | ✅        |
| < latest | ❌        |

We support the latest release for npm and Yarn dependencies.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** publicly disclose it in GitHub issues.
2. Send an email to **security@example.com** (replace with your email).
3. Include:
   - Steps to reproduce the vulnerability
   - A description of the potential impact
   - Any relevant environment details

We will:

- Acknowledge receipt within **48 hours**
- Provide an initial assessment within **7 days**
- Deploy a fix and release an update as soon as possible

## Dependabot Security Updates

We use [Dependabot](https://docs.github.com/en/code-security/dependabot) to automatically:

- Detect vulnerable npm and Yarn dependencies
- Open PRs to update them
- Run tests to ensure no regressions

### Dependabot Config

See `.github/dependabot.yml` for our update schedule:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    commit-message:
      prefix: "deps"
    allow:
      - dependency-type: "all"

  - package-ecosystem: "yarn"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    commit-message:
      prefix: "deps"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"

---
## **How this helps**
- GitHub will show a **Security** tab in your repo
- Dependabot will automatically open security update PRs for npm, Yarn, and Actions
- This satisfies GitHub’s recommendation for public repositories

---
If you want, I can **add this `SECURITY.md` plus the fixed `dependabot.yml`** in one commit so your repo is fully security-compliant and auto-updating.

Do you want me to prepare that combined commit for you?
```
