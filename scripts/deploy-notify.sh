#!/bin/sh
# Notification Slack apres deploiement Dokploy
# Lit SLACK_WEBHOOK_URL depuis l'environnement

WEBHOOK="${SLACK_WEBHOOK_URL:-}"
if [ -z "$WEBHOOK" ]; then
  echo "[deploy-notify] SLACK_WEBHOOK_URL non defini, notification ignoree"
  exit 0
fi

# Utilise Node.js pour encoder le JSON proprement (evite les injections via commit msg)
node -e "
const https = require('https');
const { execSync } = require('child_process');

const sha = (() => { try { return execSync('git rev-parse --short HEAD', {encoding:'utf-8'}).trim() } catch { return 'unknown' } })();
const msg = (() => { try { return execSync('git log -1 --pretty=%s', {encoding:'utf-8'}).trim() } catch { return 'unknown' } })();
const time = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
const prodUrl = process.env.PROD_URL || 'https://fondsbarnier.sedipec.com';

const payload = JSON.stringify({
  blocks: [
    { type: 'header', text: { type: 'plain_text', text: 'Deploiement Production' } },
    { type: 'section', fields: [
      { type: 'mrkdwn', text: '*Statut:*\n:white_check_mark: En ligne' },
      { type: 'mrkdwn', text: '*Commit:*\n\`' + sha + '\`' }
    ]},
    { type: 'section', fields: [
      { type: 'mrkdwn', text: '*Message:*\n' + msg },
      { type: 'mrkdwn', text: '*Date:*\n' + time }
    ]},
    { type: 'actions', elements: [
      { type: 'button', text: { type: 'plain_text', text: 'Voir la prod' }, url: prodUrl, style: 'primary' }
    ]}
  ]
});

const url = new URL(process.env.SLACK_WEBHOOK_URL);
const req = https.request({ hostname: url.hostname, path: url.pathname, method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
  process.exit(0);
});
req.on('error', () => process.exit(0));
req.write(payload);
req.end();
" 2>/dev/null || true

echo "[deploy-notify] Notification Slack envoyee"
