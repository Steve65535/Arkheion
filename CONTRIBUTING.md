# Contributing to FSCA

First off, thanks for taking the time to contribute! 🎉

## How Can I Contribute?

### 🐛 Reporting Bugs

- Use [GitHub Issues](https://github.com/Steve65535/fsca-cli/issues)
- Include your Node.js version, OS, and steps to reproduce
- Attach relevant logs or screenshots

### 💡 Suggesting Features

- Open an issue with the `enhancement` label
- Describe the use case and expected behavior

### 🔧 Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code, add tests
3. Ensure the test suite passes: `npm test`
4. Make sure your code follows the existing style
5. Issue your pull request

## Development Setup

```bash
git clone https://github.com/Steve65535/fsca-cli.git
cd fsca-cli
npm install

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

## Project Structure

```
fsca-cli/
├── cli/              # Command parser, executor, and command definitions
├── libs/
│   ├── commands/     # CLI command handlers (cluster/, wallet/, normal/)
│   ├── fsca-core/    # Solidity contracts (NormalTemplate, ClusterManager, etc.)
│   └── ...           # Shared utilities (logger, signer, config)
├── test/
│   ├── unit/         # Unit tests (parser, executor, logger)
│   └── integration/  # CLI integration tests
├── assets/           # Branding assets
└── documents/        # Project documentation
```

## Coding Style

- **JavaScript**: No semicolons, single quotes, 2-space indent
- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`)

## Code of Conduct

Be respectful. Be constructive. We're all here to build something great.

---

Thank you for helping make FSCA better! 🚀
