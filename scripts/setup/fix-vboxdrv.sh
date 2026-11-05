#!/bin/bash
# CloudBridge — Fix VirtualBox kernel module
# Resolves: "The character device /dev/vboxdrv does not exist"
# Run once after kernel updates or fresh install
#
# REQUIRES: sudo
# OS: Kali Linux / Debian-based

set -euo pipefail

SCRIPT_NAME="$(basename "$0")"

echo "[$SCRIPT_NAME] Checking VirtualBox kernel module status..."

if [ -e /dev/vboxdrv ]; then
  echo "[$SCRIPT_NAME] /dev/vboxdrv exists — VirtualBox kernel module already loaded."
  exit 0
fi

echo "[$SCRIPT_NAME] /dev/vboxdrv missing. Installing kernel headers and virtualbox-dkms..."

KERNEL_VERSION="$(uname -r)"
echo "[$SCRIPT_NAME] Kernel version: $KERNEL_VERSION"

# Install headers and dkms module
sudo apt-get update -qq
sudo apt-get install -y "linux-headers-${KERNEL_VERSION}" virtualbox-dkms

echo "[$SCRIPT_NAME] Loading vboxdrv module..."
sudo modprobe vboxdrv

# Verify
if [ -e /dev/vboxdrv ]; then
  echo "[$SCRIPT_NAME] SUCCESS: /dev/vboxdrv now exists."
  echo "[$SCRIPT_NAME] VirtualBox VMs can now be started."
else
  echo "[$SCRIPT_NAME] ERROR: /dev/vboxdrv still missing after modprobe."
  echo "[$SCRIPT_NAME] Try: sudo dpkg-reconfigure virtualbox-dkms"
  echo "[$SCRIPT_NAME] Or check: dmesg | grep vbox"
  exit 1
fi
