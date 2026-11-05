# Security Policy

## Overview

CloudBridge is a public portfolio project simulating cloud consulting and security engineering operations. All infrastructure is either locally simulated or deployed in isolated lab environments. No production customer data is used anywhere in this repository.

## Supported Scope

This project is a **learning and portfolio platform**. It is not a production service and does not process real customer data. Security reports should focus on:

- Hardcoded credentials or secrets in committed files
- Overly permissive IAM policies in Terraform examples
- Insecure network configurations in infrastructure code
- Exposed sensitive information in documentation

## Reporting a Vulnerability

If you discover a credential, secret, access key, or other sensitive material that has been accidentally committed to this repository, please report it immediately.

**Do not open a public GitHub issue for security-sensitive findings.**

Contact method: Open a private [GitHub Security Advisory](../../security/advisories/new) in this repository.

Please include:

- The file path and approximate line number
- A description of the sensitive material (not the value itself)
- How it could be exploited

You will receive a response within 48 hours. Confirmed findings will be remediated immediately, including credential rotation if required.

## Known Scope Limitations

The following are intentional design choices and are **not** vulnerabilities:

- Simulated infrastructure uses private RFC 1918 address space (192.168.x.x) that is not publicly routable
- Fictional customer data (ACME Technologies, BluePeak Solutions, NovaRetail) used in documentation
- Demonstration findings in security reports are labeled as such and are not real scan outputs
- Terraform configurations are validated locally — no resources are deployed unless explicitly stated

## Credential and Secret Prevention

This project enforces the following controls:

- `.gitignore` blocks `*.tfstate`, `*.tfstate.backup`, `.env`, `*.pem`, `*.key`, `terraform.tfvars`
- GitHub Actions CI runs `git-secrets` or `trufflehog` on every push (Phase 1 CI, in progress)
- Checkov scans all Terraform for credential misconfigurations before merge

## Out of Scope

- Social engineering
- Physical security
- Denial of service attacks
- Findings in third-party tools (Terraform, Ansible, Prowler) — report those upstream
