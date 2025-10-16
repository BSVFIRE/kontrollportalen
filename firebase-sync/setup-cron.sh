#!/bin/bash

# Script for å sette opp daglig synkronisering mellom Kontrollportal og Firebase_BSVFire
# Kjører hver dag kl 03:00

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Finn npm path
NPM_PATH=$(which npm)

# Cron job som kjører hver dag kl 03:00
CRON_JOB="0 3 * * * cd $PROJECT_DIR && $NPM_PATH run sync:firebase >> /tmp/firebase-sync.log 2>&1"

# Sjekk om cron job allerede eksisterer
if crontab -l 2>/dev/null | grep -q "sync:firebase"; then
    echo "⚠️  Cron job eksisterer allerede"
    echo "Kjør 'crontab -e' for å redigere manuelt"
    exit 1
fi

# Legg til cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job opprettet!"
echo "📅 Synkronisering kjører hver dag kl 03:00"
echo "📋 Logger lagres i: /tmp/firebase-sync.log"
echo ""
echo "For å se cron jobs: crontab -l"
echo "For å fjerne: crontab -e (slett linjen med sync:firebase)"
