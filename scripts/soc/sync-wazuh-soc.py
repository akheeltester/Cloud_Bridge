#!/usr/bin/env python3
"""Sync real Wazuh SOC data into the CloudBridge dashboard.

Fetches agent status from the Wazuh manager API and recent alerts from the
Wazuh indexer (localhost-only, reached over SSH), sanitizes them for public
display, and writes dashboard/public/soc-data.json. The dashboard fetches
that file at runtime; commit + push to publish an update.

Config: scripts/soc/wazuh-api.env (gitignored). Run from anywhere:
    python3 scripts/soc/sync-wazuh-soc.py
"""
import json
import os
import sys
import datetime
import urllib3
import requests
import paramiko

urllib3.disable_warnings()

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(ROOT, "scripts", "soc", "wazuh-api.env")
OUT_PATH = os.path.join(ROOT, "dashboard", "public", "soc-data.json")
FOCUS_AGENTS = ["bluepeak-aws", "novatrail-gcp", "wazuh-server"]


def load_env():
    cfg = {}
    with open(ENV_PATH) as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                cfg[k.strip()] = v.strip()
    return cfg


def severity(level: int) -> str:
    if level >= 12:
        return "critical"
    if level >= 9:
        return "high"
    if level >= 5:
        return "medium"
    return "low"


def mask_ip(ip):
    if not ip:
        return None
    parts = str(ip).split(".")
    if len(parts) == 4:
        return ".".join(parts[:2]) + ".x.x"
    return "masked"


def fetch_agents(cfg):
    base = cfg["WAZUH_API_URL"]
    r = requests.post(
        f"{base}/security/user/authenticate",
        auth=(cfg["WAZUH_API_USER"], cfg["WAZUH_API_PASSWORD"]),
        verify=False, timeout=30,
    )
    r.raise_for_status()
    token = r.json()["data"]["token"]
    r = requests.get(
        f"{base}/agents",
        params={"select": "id,name,status,version,group", "limit": 100},
        headers={"Authorization": f"Bearer {token}"},
        verify=False, timeout=30,
    )
    r.raise_for_status()
    agents = []
    for a in r.json()["data"]["affected_items"]:
        if a["name"] not in FOCUS_AGENTS:
            continue
        agents.append({
            "id": a["id"],
            "name": a["name"],
            "status": a["status"],
            "version": a.get("version", ""),
            "group": (a.get("group") or ["default"])[0],
        })
    return agents


def fetch_alerts(cfg):
    query = {
        "size": 200,
        "sort": [{"timestamp": {"order": "desc"}}],
        "query": {"bool": {"must": [
            {"range": {"timestamp": {"gte": "now-24h"}}},
            {"terms": {"agent.name": FOCUS_AGENTS}},
        ]}},
        "_source": ["timestamp", "agent.name", "agent.id", "rule.id", "rule.level",
                     "rule.description", "rule.groups", "data.srcip", "location"],
    }
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(cfg["WAZUH_SSH_HOST"], username=cfg["WAZUH_SSH_USER"],
                password=cfg["WAZUH_SSH_PASSWORD"], timeout=20)
    try:
        sftp = ssh.open_sftp()
        with sftp.open("/tmp/cloudbridge-alert-query.json", "w") as fh:
            fh.write(json.dumps(query))
        sftp.close()
        cmd = (
            "sudo curl -sk -u "
            f"{cfg['WAZUH_INDEXER_USER']}:{cfg['WAZUH_INDEXER_PASSWORD']} "
            "-H 'Content-Type: application/json' "
            "-XPOST 'https://127.0.0.1:9200/wazuh-alerts-*/_search' "
            "-d @/tmp/cloudbridge-alert-query.json; rm -f /tmp/cloudbridge-alert-query.json"
        )
        _, stdout, stderr = ssh.exec_command(cmd, timeout=60)
        body = stdout.read().decode()
        if not body.strip():
            raise RuntimeError(f"empty indexer response: {stderr.read().decode()[:300]}")
        return json.loads(body)
    finally:
        ssh.close()


def main():
    cfg = load_env()
    agents = fetch_agents(cfg)
    raw = fetch_alerts(cfg)
    hits = raw.get("hits", {}).get("hits", [])
    total_24h = raw.get("hits", {}).get("total", {}).get("value", len(hits))

    alerts, by_level, by_agent, rule_counts = [], {}, {}, {}
    for h in hits:
        s = h.get("_source", {})
        rule = s.get("rule", {})
        level = int(rule.get("level", 0))
        sev = severity(level)
        agent = s.get("agent", {}).get("name", "unknown")
        rid = str(rule.get("id", ""))
        desc = rule.get("description", "")
        alerts.append({
            "timestamp": s.get("timestamp"),
            "agent": agent,
            "rule_id": rid,
            "level": level,
            "severity": sev,
            "description": desc,
            "groups": [g for g in rule.get("groups", []) if g in
                       ("syslog", "sshd", "authentication_failed", "invalid_login",
                        "authentication_success", "sca", "syscheck", "docker",
                        "gdpr_IV_35.7.d", "pci_dss_10.2.4", "nist_800_53_AC.7",
                        "hipaa_164.312.b", "tsc_CC7.2", "mitre")][:6],
            "srcip": mask_ip(s.get("data", {}).get("srcip")),
            "location": s.get("location", ""),
        })
        by_level[sev] = by_level.get(sev, 0) + 1
        by_agent[agent] = by_agent.get(agent, 0) + 1
        key = (rid, desc, level)
        rule_counts[key] = rule_counts.get(key, 0) + 1

    top_rules = [
        {"rule_id": k[0], "description": k[1], "level": k[2], "count": c}
        for k, c in sorted(rule_counts.items(), key=lambda kv: -kv[1])[:6]
    ]
    out = {
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "window": "last 24 hours",
        "manager": {"name": "wazuh-server", "version": "Wazuh v4.14.6",
                    "transport": "Tailscale mesh (private)"},
        "agents": agents,
        "summary": {
            "total_alerts_24h": total_24h,
            "sampled": len(alerts),
            "by_level": by_level,
            "by_agent": by_agent,
            "top_rules": top_rules,
        },
        "alerts": alerts,
    }
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as fh:
        json.dump(out, fh, indent=1)
    print(f"wrote {OUT_PATH}: {len(alerts)} alerts sampled / {total_24h} in 24h, "
          f"{len(agents)} agents, levels={by_level}")


if __name__ == "__main__":
    sys.exit(main())
