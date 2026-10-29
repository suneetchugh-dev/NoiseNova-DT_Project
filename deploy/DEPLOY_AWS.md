# Deploying Noise Nova on a single VM

One container runs the dashboard, the API, the WebSocket hub and SQLite. Caddy sits in front
for TLS. This works identically on EC2, Lightsail and an Azure VM — the image does not care.

Target address in this project: `noisenova.sahnirmaan.live` → the VM's public IP.

---

## 1. Create the VM

**EC2 (recommended)**

| Setting | Value |
|---|---|
| AMI | Ubuntu Server 24.04 LTS |
| Type | `t3.micro` (x86, free tier) or `t4g.small` (ARM, cheaper long-term) |
| Storage | 10–20 GB gp3 |
| Security group | inbound `22` from your IP, `80` and `443` from `0.0.0.0/0` |

Do **not** open `8787` to the internet. Only Caddy is published.

**Lightsail:** Ubuntu 24.04 blueprint, $5 plan, open ports 80/443 in Networking.

**Azure (student credits):** Ubuntu 24.04 B1s/B2s, open 80/443 in the NSG. Everything below is
unchanged.

## 2. Install Docker

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER" && newgrp docker
docker --version && docker compose version
```

## 3. Copy the project

From the laptop, excluding build output and dependencies:

```bash
rsync -av --exclude node_modules --exclude dist --exclude data --exclude android \
  ./Codebase/ ubuntu@<vm-ip>:~/noise-nova/
```

Or clone the repository on the VM if it is pushed.

## 4. Configure

```bash
cd ~/noise-nova/deploy
cp ../.env.example ../.env        # optional, compose reads HUB_TOKEN from the shell env
```

Create `deploy/.env` (compose reads this file automatically):

```dotenv
SITE_ADDRESS=noisenova.sahnirmaan.live
HUB_TOKEN=<paste a UUID>
```

Generate the token: `node -e "console.log(crypto.randomUUID())"` (or `openssl rand -hex 24`).

With `HUB_TOKEN` set, clients must pair with `noisenova.sahnirmaan.live#<token>` (the dashboard
accepts `host#token`). Leave it empty only for a throwaway demo.

## 5. DNS

In Cloudflare, add an `A` record `noisenova` → the VM's public IP.

**Set it to DNS-only (grey cloud).** With the orange cloud proxy enabled, Caddy's Let's Encrypt
HTTP-01 challenge cannot complete and you get a TLS error loop.

If you must keep the proxy on, use DNS-01 instead: uncomment the `tls { dns cloudflare … }`
block in `Caddyfile`, set `CF_API_TOKEN` in `deploy/.env`, and add it to the `caddy`
environment in `docker-compose.yml`. The token needs `Zone:DNS:Edit` for the zone.

## 6. Run

```bash
docker compose up -d --build
docker compose logs -f caddy hub
```

First boot issues the certificate (a few seconds). Then open:

```
https://noisenova.sahnirmaan.live
```

Health check:

```bash
curl https://noisenova.sahnirmaan.live/api/health
```

## 7. Connect the apps

- **Browser / PWA:** open the HTTPS URL and install. No pairing needed — same origin.
- **Android APK:** pair with `noisenova.sahnirmaan.live` (TLS, port 443 implied). If the token
  is set, enter `noisenova.sahnirmaan.live#<token>`.
- **ESP32:** `POST https://noisenova.sahnirmaan.live/api/ingest?nodeId=esp32-a&rms=0.05`
  with header `x-hub-token: <token>` when enabled.

## 8. Operations

```bash
docker compose ps
docker compose logs -f hub
docker compose restart hub
docker compose down            # keeps volumes (readings survive)
```

**Backups** — the database is one file in the `noise-data` volume:

```bash
docker run --rm -v deploy_noise-data:/data -v "$PWD":/backup alpine \
  sh -c 'tar czf /backup/noise-$(date +%F).tar.gz -C /data .'
```

**Update** — `git pull` (or rsync), then `docker compose up -d --build`.

**Log rotation** — Docker's default json log grows. Add to `/etc/docker/daemon.json`:

```json
{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }
```

then `sudo systemctl restart docker`.

## 9. Cost and demo risk

`t3.micro` is free-tier for 12 months, then roughly $8/month; Lightsail is a flat $5. Azure
credits cover the same shape.

The honest trade-off: a cloud hub adds an outage path to your demo. Venue Wi-Fi, an expired
domain or a stopped instance all take the dashboard down. **Run the viva on the LAN hub and
keep the deployed URL as the "production-ready" slide.** Both paths use the same image and the
same code — nothing to re-test.

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Caddy` loops on certificate | DNS is proxied (orange cloud) | set DNS-only, or switch to DNS-01 |
| `502` from Caddy | hub container down | `docker compose logs hub`, check `DB_PATH` |
| Phone cannot connect to LAN hub | firewall / guest Wi-Fi | `npm run firewall`, or use a hotspot |
| WebSocket drops every ~60 s | proxy idle timeout | heartbeat is 20 s; check Caddy is in front, not an extra LB |
| `SQLITE_CANTOPEN` | volume permissions | ensure `/data` is the mounted volume and owned by the container user |
| `Mixed Content` in APK | cleartext blocked | keep `cleartext: true` + `allowMixedContent: true`, and use `http://` only on LAN |
