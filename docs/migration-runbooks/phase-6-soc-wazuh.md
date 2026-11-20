# Phase 6 — SOC & Monitoring (Wazuh)

Status: **implemented and verified — 2026-11-20**

## Architecture

```text
 BluePeak EC2 (AWS)                NovaTrail VM (GCP COS)
 wazuh-agent 4.14.6 (RPM)          wazuh-agent 4.14.6 (container)
 <bluepeak-tailscale-ip>                     <novatrail-tailscale-ip>
        \                              /
         \      Tailscale mesh        /
          \    (private, free tier)  /
           wazuh-manager (VirtualBox, home LAN)
           <manager-tailscale-ip> / <manager-lan-ip>
           manager + indexer + dashboard (OVA 4.14.6)
                     |
        scripts/soc/sync-wazuh-soc.py (sanitized snapshot)
                     |
        dashboard/public/soc-data.json → GitHub Pages SOC page
```

The manager stays on the home LAN (no cloud cost, no public exposure). Tailscale
provides the private transport between the cloud agents and the manager — no
router port-forwarding, nothing opened to the internet.

## Components

| Component | Where | How |
|---|---|---|
| Wazuh manager 4.14.6 | VirtualBox OVA, bridged <manager-lan-ip> | manager + indexer + dashboard, all active |
| Tailscale | all 3 machines | free personal tailnet, hostnames wazuh-manager / bluepeak-aws / novatrail-gcp |
| Agent 015 bluepeak-aws | EC2 Amazon Linux 2023 | native RPM; auth logs (journald), FIM, SCA (CIS AL2023), syscollector |
| Agent 016 novatrail-gcp | GCP Container-Optimized OS | `wazuh/wazuh-agent:4.14.6` container, host network/pid, privileged; host FIM via `/:/host:ro`, docker-listener, SCA |

## Agent enrollment (reproducible)

Enrollment requires a password (hardened 2026-11-20: `<use_password>yes</use_password>`
+ `/var/ossec/etc/authd.pass` on the manager; passwordless attempts are rejected).
The password lives in the gitignored `scripts/soc/wazuh-api.env`
(`WAZUH_ENROLLMENT_PASSWORD`). Group must exist first:

```bash
# on the manager
echo y | sudo /var/ossec/bin/agent_groups -a -g cloudbridge
```

EC2 (RPM):

```bash
sudo WAZUH_MANAGER=<manager-tailscale-ip> WAZUH_AGENT_NAME=bluepeak-aws \
  WAZUH_AGENT_GROUP=cloudbridge rpm -ivh wazuh-agent-4.14.6-1.x86_64.rpm
sudo systemctl enable --now wazuh-agent
# if a stale entry exists: manage_agents -r <id> on manager, then:
sudo /var/ossec/bin/agent-auth -m <manager-tailscale-ip> -A bluepeak-aws -G cloudbridge -P "$ENROLL_PW"
```

GCP COS (container — no package manager on COS):

```bash
sudo docker run -d --name wazuh-agent --restart unless-stopped \
  --hostname novatrail-gcp --network host --pid host --privileged \
  -e WAZUH_MANAGER_SERVER=<manager-tailscale-ip> \
  -e WAZUH_AGENT_NAME=novatrail-gcp -e WAZUH_AGENT_GROUP=cloudbridge \
  -e WAZUH_REGISTRATION_PASSWORD="$ENROLL_PW" \
  -v /var/lib/cloudbridge-novaretail/wazuh/ossec.conf:/wazuh-config-mount/etc/ossec.conf:ro \
  -v /:/host:ro -v /var/run/docker.sock:/var/run/docker.sock \
  wazuh/wazuh-agent:4.14.6
```

The mounted ossec.conf points syscheck at `/host/etc`, `/host/usr/bin`,
`/host/usr/sbin`, and the app data dir; docker-listener watches the Docker
socket. Tailscale runs as a sibling container (`tailscale/tailscale`, host
network, state on the stateful disk) so both survive reboots.

## Detection verification (2026-11-20)

Simulated SSH brute force against BluePeak (10 failed logins, non-existent user):

- Rule **5710** (level 5) — "sshd: Attempt to login using a non-existent user", per attempt
- Rule **5712** (level 10) — "sshd: brute force trying to get access to the system"
- Compliance tags attached automatically: PCI DSS 10.2.4/10.2.5, GDPR IV.35.7.d, NIST 800-53 AC.7/AU.14, HIPAA 164.312.b

Both agents also run CIS Amazon Linux 2023 SCA benchmarks and FIM baselines.
846 alerts in the first 24h (mostly PAM session / sudo / SCA events).

## Dashboard integration

GitHub Pages is static and the manager is private, so the SOC page consumes a
sanitized snapshot:

```bash
python3 scripts/soc/sync-wazuh-soc.py   # needs scripts/soc/wazuh-api.env (gitignored)
git add dashboard/public/soc-data.json && git commit && git push
```

The script pulls agent status from the manager API (55000) and alerts from the
indexer (9200, localhost-only on the manager, reached over SSH). Sanitization:
source IPs masked to first two octets, raw log lines stripped, only the three
CloudBridge agents included.

## Hardening backlog

Done 2026-11-20:

1. ~~OVA default SSH credentials~~ — wazuh-user password rotated to a random
   value (stored in the gitignored env file; also needed for VM console login).
2. ~~Passwordless enrollment~~ — authd password enabled; both agents re-enrolled
   with it (IDs 015/016); passwordless enrollment verified rejected.

Remaining (before calling this production-style):

3. Wazuh dashboard default login (the OVA default dashboard login) — rotate via the dashboard UI.
4. AWS CloudTrail ingestion via the Wazuh AWS module (needs AWS CLI re-auth).
5. Prowler AWS assessment (same blocker).
