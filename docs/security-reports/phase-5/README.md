# Phase 5 — Cloud Security Assessment (in progress)

Scan date: 2026-11-19 · Tools: Checkov 3.2.459, Trivy 0.76.2, Prowler (GCP run pending)
Scope: all Terraform stacks (AWS/GCP/Azure), all customer Dockerfiles, container
images, and the live GCP project `iconic-being-431804-c2`.

All findings below are REAL scan output (raw JSON/CSV in this directory), not
demonstration data.

## 1. IaC scanning — Checkov

Baseline: 22 failed checks. After remediation: 16 (6 fixed in IaC).

### Remediated in IaC (pending apply to live VM — gated on approval)

| Check | Resource | Fix |
|---|---|---|
| CKV_DOCKER_2 ×3 | customer-a/b/c Dockerfiles | HEALTHCHECK instructions added |
| CKV_GCP_32 | compute-vm module | `block-project-ssh-keys = TRUE` |
| CKV_GCP_39 | compute-vm module | Shielded VM: secure boot + vTPM + integrity monitoring |
| CKV_AZURE_18 | appservice module | `http2_enabled = true` |

### Accepted risks (documented, intentional for a free-tier portfolio lab)

| Check | Resource | Rationale |
|---|---|---|
| CKV_GCP_40 / Trivy GCP-0031 (HIGH) | NovaRetail VM public IP | Required for the public demo; cost approved (~$3.60/mo). No private-only alternative without a load balancer (paid). |
| CKV_GCP_38, CKV_GCP_84 ×2 / Trivy GCP-0033 | VM disk + Artifact Registry CSEK | Google-managed encryption at rest is sufficient for fictional demo data; CSEK adds key-management overhead with no demo benefit. |

### Deferred (Azure engagement paused — no payment card for signup)

12 App Service hardening checks (CKV_AZURE_13/17/63/65/66/78/88/211/212/214/222/225):
production features (always-on, zone redundancy, min instances, auth, logging,
private endpoints) that conflict with the F1 free tier or are irrelevant while
the Azure deployment is deferred. Revisit when Azure is activated.

## 2. IaC scanning — Trivy (config)

23 misconfigurations: 2 HIGH (both = the intentional public IP above),
13 MEDIUM (SSH keys / Shielded VM — fixed in IaC; OS Login + default-firewall
notes below), 8 LOW (HEALTHCHECK — fixed; CSEK — accepted; Azure — deferred).

Additional notes not auto-fixed:
- GCP-0036 (OS Login): instance uses metadata SSH keys via `gcloud compute ssh`;
  enabling OS Login org-wide is a project-level decision, tracked for Phase 6.
- GCP-0073 (default firewall rules): the project's `default` network auto-rules
  (allow-ssh/allow-icmp internal) exist; the demo only exposes tcp:80/443 via a
  tag-scoped rule. Tightening the default network is tracked for Phase 6.

## 3. Container image scanning — Trivy (COMPLETE)

| Image | Critical | High | Medium | Low | Total |
|---|---:|---:|---:|---:|---:|
| novaretail (python:3.12-slim) | 3 | 106 | 194 | 132 | 448 |
| bluepeak app (python:3.12-slim) | 3 | 106 | 194 | 132 | 448 |
| jigsaw (node:24-slim) | 1 | 43 | 112 | 88 | 251 |

- All 3 CRITICALs in the Python images are `perl-base` CVEs (CVE-2026-13221,
  CVE-2026-42496, CVE-2026-8376) with a fixed version available
  (5.40.1-6+deb13u1). Remediation: rebuild from the refreshed
  `python:3.12-slim` base and redeploy. Perl is not used by the apps —
  base-layer exposure only.
- Jigsaw CRITICAL CVE-2023-45853 (zlib1g) has no Debian fix yet — tracked,
  mitigated by the app not exposing zlib-decompression of untrusted input.
- Most remaining findings are Debian base-layer packages without fixes yet;
  rebuilds pick up fixes as Debian publishes them. Raw JSON in this directory.

## 4. Cloud posture — Prowler GCP (COMPLETE)

86 checks on project `iconic-being-431804-c2`: 19 PASS, 67 FAIL
(2 critical, 4 high, 60 medium, 1 low). Output: `prowler-gcp/` (CSV + OCSF).

### Critical — remediation planned (live change, approval-gated)

| Finding | Resource | Plan |
|---|---|---|
| SSH (22) open to the internet | `default-allow-ssh` firewall | Replace with IAP-only SSH (35.235.240.0/20) + operator IP; use `gcloud compute ssh --tunnel-through-iap` |
| RDP (3389) open to the internet | `default-allow-rdp` firewall | Delete — no Windows workloads |

### High

- Public IP on the VM — accepted (demo requirement, cost approved).
- Disk CSEK — accepted (Google-managed encryption, fictional data).
- OS Login 2FA not enabled — project-level identity hardening, Phase 6.
- Cloud Asset Inventory API not enabled — enable (free) in Phase 6.

### Medium (grouped)

- Block project-wide SSH keys — FIXED in IaC, apply pending.
- Deletion protection / disk auto-delete — enable in the pending hardening apply.
- 10× logging metric filters + alerting, logging sink — Phase 6 SOC scope.
- Default network in use, no flow/DNS logs — lab trade-off; custom VPC is Phase 6.
- Container Analysis / GCR scanning not enabled — paid per-image scanning;
  Trivy covers this need for free (documented alternative).
- Confidential Computing — not available on e2-micro; accepted.

### AWS posture

Blocked: local AWS credentials expired. Re-auth (`aws login --profile
cloudbridge`) then run Prowler AWS against account 043262085043.

## Artifacts

- `checkov/results_json.json` — baseline scan (22 failures)
- `checkov-after/results_json.json` — post-remediation scan (16 failures)
- `trivy-iac.json` — Trivy config scan
- `trivy-*.json` — image scans (pending)
- `prowler-gcp/` — GCP posture findings (pending)
