# CloudBridge — Project Status & Resume Guide

Last updated: 2026-11-20 · All 8 roadmap phases implemented and verified.

## Live estate

| Workload | Cloud | Endpoint | Access |
|---|---|---|---|
| BluePeak (customer-b) | AWS EC2 ap-southeast-2 + private S3 | https://cloudbridge-bluepeak.duckdns.org | SSH: `ssh -i ~/Desktop/C-Loud/<local-ssh-key> ec2-user@<ec2-public-ip>` |
| Jigsaw (customer-a) | GCP Cloud Run australia-southeast1 | https://cloudbridge-jigsaw-j2qhkxzfka-ts.a.run.app | gcloud (project iconic-being-431804-c2) |
| NovaTrail (customer-c) | GCP e2-micro VM us-central1-a (COS) | https://novatrail.duckdns.org | IAP-only: `gcloud compute ssh cloudbridge-novaretail --zone us-central1-a --project iconic-being-431804-c2 --tunnel-through-iap` |
| Dashboard | GitHub Pages | https://akheeltester.github.io/Cloud_Bridge/ | repo akheeltester/Cloud_Bridge, auto-deploys on push |
| Wazuh manager 4.14.6 | VirtualBox OVA, home LAN | https://<manager-lan-ip> (LAN) / <manager-tailscale-ip> (Tailscale) | SSH wazuh-user (password rotated — in scripts/soc/wazuh-api.env) |

gcloud lives at `~/google-cloud-sdk/bin` (off PATH). GCP billing: <billing-account-id>.
Running cloud cost: ~$3.60/month (GCP static IPv4 only); everything else free-tier.

## SOC state (Phase 6)

- Tailscale mesh: wazuh-manager / bluepeak-aws (<bluepeak-tailscale-ip>) / novatrail-gcp (<novatrail-tailscale-ip>), account <tailscale-account>.
- Agents: 015 bluepeak-aws (native RPM on EC2), 016 novatrail-gcp (container on COS). Both Active at last check.
- Enrollment password ENFORCED (use_password=yes); passwordless attempts rejected.
- Detection verified: simulated SSH brute force → rules 5710 (lvl 5) + 5712 (lvl 10), PCI/GDPR/NIST tags.
- Dashboard SOC page reads `dashboard/public/soc-data.json` (sanitized snapshot).
  Refresh: `python3 scripts/soc/sync-wazuh-soc.py` then commit + push.
- Credentials: `scripts/soc/wazuh-api.env` (gitignored) — SSH password, API user
  wazuh-wui (rotated), enrollment password, indexer admin (OVA default, LAN-only).
- Wazuh dashboard web login still the OVA default dashboard login — rotate via UI when convenient.

## Shutting the Wazuh VM down (safe)

- Cloud agents keep running; they buffer events briefly (queue 5000) then drop
  new ones until the manager returns. They auto-reconnect (~60s retry) on boot.
- Live demos and the dashboard are unaffected; SOC page keeps the last snapshot.
- On restart: tailscaled + wazuh services start automatically; agents reappear
  Active. Re-run the sync script to refresh the dashboard.
- If you also stop the GCP VM: the reserved static IP keeps costing (~$7/mo
  unattached). Release it or keep the VM running; DuckDNS points at it.

## Security posture (Phase 5, remediated)

- Checkov IaC 22 → 16 findings; Trivy image criticals 7 → 1 (remaining: no vendor fix);
  Prowler GCP 86 checks, 2/2 criticals fixed (internet-wide SSH/RDP removed).
- Reports: docs/security-reports/phase-5/. Runbooks: docs/migration-runbooks/.
- Hardening done: Shielded VM, IAP-only SSH, deletion protection, no static cloud
  keys (instance role + service accounts), Wazuh SSH rotated, enrollment password.

## Backlog (next enhancements)

1. Wazuh Active Response — auto-block brute-force source IPs (highest-impact demo).
2. AWS CloudTrail ingestion + Prowler AWS (blocked on AWS CLI re-auth — token expired).
3. Rotate Wazuh dashboard the OVA default dashboard login via the web UI.
4. Custom detection rules + incident-response playbooks.
5. Azure App Service deployment (IaC validated in terraform/azure; blocked — no card).
6. Automated SOC sync (cron) instead of manual runs.

## Key commits (2026-11-19/20)

c3a99ad Jigsaw PGlite fix → 5186c6e NovaTrail VM IaC → ee7a799 NovaTrail rebrand →
86859b7 dashboard portfolio upgrade → 6287cac remove "portfolio" keyword →
aa4d166 Phase 6 SOC live → 3e2ee97 hardening (SSH + enrollment password) →
e7f14d1 architecture diagram (cloudbridge-architecture.html/.png).
