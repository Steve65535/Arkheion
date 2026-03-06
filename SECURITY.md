# Security Policy

## ⚠️ Important Notice

FSCA is a **smart contract orchestration framework**. Vulnerabilities in this project could directly impact the security of funds managed by contracts built on top of it. We take security extremely seriously.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅         |
| < 1.0   | ❌         |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email:

📧 **security@fsca.io**

Include the following in your report:

1. **Description** of the vulnerability
2. **Steps to reproduce** (or a proof-of-concept)
3. **Impact assessment** — what an attacker could achieve
4. **Suggested fix** (if you have one)

### What to Expect

- **Acknowledgment** within 48 hours
- **Status update** within 7 days
- **Fix timeline** depends on severity:
  - 🔴 Critical (fund loss risk): patch within 24-48 hours
  - 🟡 High: patch within 1 week
  - 🟢 Medium/Low: patch in next release

## Scope

The following components are in scope for security reports:

| Component | Priority |
|-----------|----------|
| `NormalTemplate.sol` | 🔴 Critical |
| `ClusterManager.sol` | 🔴 Critical |
| `EvokerManager.sol` | 🔴 Critical |
| `MultiSigWallet.sol` / `ProxyWallet.sol` | 🔴 Critical |
| CLI command handlers | 🟡 High |
| Configuration parsing | 🟢 Medium |

## Security Best Practices for Users

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive configuration
3. **Test on testnets** before mainnet deployment
4. **Set appropriate multi-sig thresholds** (≥ 2 of 3 recommended)
5. **Review all `wallet submit` data** before confirming

## Audit Status

- [ ] Internal review: complete
- [ ] Slither static analysis: planned
- [ ] Mythril symbolic execution: planned
- [ ] Third-party audit: seeking funding

---

Thank you for helping keep FSCA and its users safe. 🔐
