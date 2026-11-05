# CloudBridge — Local Lab Topology

## Purpose

The local lab simulates customer on-premises infrastructure using VirtualBox. This allows migration workflows, Ansible automation, and discovery scripts to be developed and tested without incurring any cloud costs.

---

## Hardware

| Resource | Value |
|---|---|
| Host OS | Kali Linux |
| CPU | AMD Ryzen 5 |
| RAM | 16 GB |
| Virtualization | VirtualBox 7.2 |
| Kernel module | Requires `virtualbox-dkms` — see setup notes |

**VM Budget:** Given 16 GB RAM, run a maximum of 2–3 VMs simultaneously. Ubuntu Server can operate on 1 GB RAM. Avoid running all customer VMs at once.

---

## Network Architecture

### VirtualBox Adapters per VM

| Adapter | Type | Purpose |
|---|---|---|
| Adapter 1 | Host-only | Management, Ansible, SSH access from Kali |
| Adapter 2 | NAT (disabled when not needed) | Package downloads only — disable after provisioning |

**Isolation:** Host-only networks ensure VMs cannot reach the internet directly during lab exercises. The NAT adapter is only enabled temporarily for package installation, then disabled.

### IP Allocation

#### Customer A Network — `vboxnet0` (192.168.56.0/24)

| Host | Role | IP |
|---|---|---|
| Kali Linux (host) | Management / Ansible controller | 192.168.56.10 |
| customer-a-workstation | Ubuntu Desktop / Windows workstation simulation | 192.168.56.20 |
| customer-a-appserver | Ubuntu Server — application server | 192.168.56.30 |
| customer-a-database | Ubuntu Server — PostgreSQL database | 192.168.56.31 |

#### Customer B Network — `vboxnet1` (192.168.57.0/24)

| Host | Role | IP |
|---|---|---|
| Kali Linux (host) | Management / Ansible controller | 192.168.57.10 |
| customer-b-workstation | Ubuntu Desktop / workstation | 192.168.57.20 |
| customer-b-webserver | Ubuntu Server — web application | 192.168.57.30 |
| customer-b-database | Ubuntu Server — database | 192.168.57.31 |

---

## VM Specifications

### Ubuntu Server VMs (application and database servers)

| Parameter | Value |
|---|---|
| OS | Ubuntu Server 22.04 LTS |
| RAM | 1024 MB |
| Disk | 20 GB (dynamically allocated) |
| CPU | 1 vCPU |
| Network | Host-only + NAT (NAT disabled post-setup) |

### Ubuntu Desktop VM (workstation simulation)

| Parameter | Value |
|---|---|
| OS | Ubuntu Desktop 22.04 LTS |
| RAM | 2048 MB |
| Disk | 25 GB (dynamically allocated) |
| CPU | 2 vCPU |
| Network | Host-only + NAT |

> **Windows workstation:** Windows 11 evaluation ISO requires ~4 GB RAM minimum. Only provision if remaining memory allows. Not required for Phase 2 objectives.

---

## Services per Customer

### Customer A — ACME Technologies

| Service | VM | Port |
|---|---|---|
| Ubuntu application (simulated web app) | customer-a-appserver | 8080 |
| PostgreSQL 14 | customer-a-database | 5432 |
| Samba file share (simulated) | customer-a-appserver | 445 |
| SSH (Ansible management) | all | 22 |

### Customer B — BluePeak Solutions

| Service | VM | Port |
|---|---|---|
| Nginx web server | customer-b-webserver | 80, 443 |
| MySQL / PostgreSQL | customer-b-database | 3306 / 5432 |
| SSH | all | 22 |

---

## VirtualBox Kernel Module

VirtualBox is installed but the kernel module is not currently loaded:

```
WARNING: The character device /dev/vboxdrv does not exist.
Please install the virtualbox-dkms package and the appropriate headers.
```

**Resolution (Phase 2 prerequisite):**

```bash
sudo apt install virtualbox-dkms linux-headers-$(uname -r)
sudo modprobe vboxdrv
```

This must be resolved before VM provisioning in Phase 2.

---

## Ansible Access

All VMs are managed via Ansible from the Kali host.

Ansible inventory files: `ansible/inventory/`

SSH key-based authentication — keys are **never committed to the repository**.

---

## Status

| Component | Status |
|---|---|
| VirtualBox installed | ✅ Installed (v7.2) |
| Kernel module (vboxdrv) | ❌ Not loaded — requires `virtualbox-dkms` |
| Customer A VMs | 📋 Planned — Phase 2 |
| Customer B VMs | 📋 Planned — Phase 2 |
| Ansible inventory | 📋 Planned — Phase 2 |
| Network isolation validation | 📋 Planned — Phase 2 |
