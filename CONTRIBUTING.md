# Contributing to CloudBridge

CloudBridge is a personal portfolio and learning project. External contributions are welcome for documentation improvements, security feedback, and code quality suggestions.

## Before You Contribute

Read `SECURITY.md` before submitting anything. If you find credentials, secrets, or private keys in this repository, follow the security disclosure process there — do not open a public issue.

## What You Can Contribute

- Documentation improvements
- Terraform module corrections or security hardening
- Ansible playbook improvements
- Python script improvements
- Bug reports for infrastructure code
- Security findings (via private advisory)

## What This Repository Does Not Accept

- Real customer data
- Actual cloud credentials or access keys
- Proprietary infrastructure configurations
- Features that require paid cloud services without prior discussion

## Workflow

1. Fork the repository.
2. Create a branch: `git checkout -b fix/describe-your-change`
3. Make your changes. Follow the standards in `.editorconfig`.
4. Run any relevant validators:
   - Terraform: `terraform fmt` and `terraform validate`
   - Python: `ruff check` and `mypy`
   - Shell: `shellcheck`
5. Open a pull request against `main`.
6. Describe what you changed and why.

## Commit Messages

Use this format:

```
[PHASE-X] short description of change

Optional longer explanation if needed.
```

Example: `[PHASE-1] add .gitignore secret blocking rules`

## Code Standards

- No hardcoded credentials anywhere.
- No `terraform.tfvars` files with real values — use `.example` suffixes.
- No `*.tfstate` files committed.
- Python: type annotations, docstrings, `ruff` clean.
- Terraform: `terraform fmt` before committing.
- Shell scripts: `set -euo pipefail`.

## Questions

Open a GitHub Discussion if you have questions about the project architecture or approach.
