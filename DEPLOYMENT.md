# Deployment Guide - VPS + Cloudflare Tunnel

## Arsitektur

```
Internet → Cloudflare DNS/CDN
             → Cloudflare Tunnel
               → VPS (Docker)
                 ├── frontend (nginx:80)    ← admin.example.com
                 ├── blog (next.js:3000)    ← example.com
                 ├── backend (go:8080)      ← internal API
                 └── postgres (5432)        ← internal DB
```

## Prasyarat

- VPS dengan Docker & Docker Compose terinstall
- Domain yang sudah di-pointing ke Cloudflare (nameserver Cloudflare)
- Akun Cloudflare (gratis)

## Langkah 1: Setup Cloudflare Tunnel

1. Login ke [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com)
2. Pergi ke **Networks → Tunnels**
3. Klik **Create a tunnel** → pilih **Cloudflared**
4. Beri nama tunnel (misal: `go-blog`)
5. Copy **Tunnel Token** yang diberikan
6. Konfigurasi **Public Hostname**:

   | Subdomain | Domain        | Service              |
   |-----------|---------------|----------------------|
   | (kosong)  | example.com   | http://blog:3000     |
   | www       | example.com   | http://blog:3000     |
   | admin     | example.com   | http://frontend:80   |
   | api       | example.com   | http://backend:8080  |

   > **Catatan**: Sesuaikan dengan domain kamu.

## Langkah 2: Setup di VPS

```bash
# 1. Clone repository
git clone https://github.com/username/Go-Blog.git
cd Go-Blog

# 2. Buat file .env dari template
cp .env.production .env

# 3. Edit .env - isi semua value
nano .env
```

### Isi .env yang WAJIB diganti:

```env
DB_PASSWORD=password_yang_kuat_123!
JWT_SECRET=random_string_minimal_32_karakter
DOMAIN=domainmu.com
ALLOWED_ORIGINS=https://admin.domainmu.com,https://domainmu.com
NEXT_PUBLIC_API_URL=https://api.domainmu.com/api
NEXT_PUBLIC_UPLOAD_URL=https://api.domainmu.com
CLOUDFLARE_TUNNEL_TOKEN=token_dari_cloudflare
```

## Langkah 3: Deploy

```bash
# Build dan jalankan semua service
docker compose up -d --build

# Cek status
docker compose ps

# Cek logs jika ada masalah
docker compose logs -f
```

## Langkah 4: Verifikasi

Setelah deploy, cek:

- `https://domainmu.com` → Blog (Next.js)
- `https://admin.domainmu.com` → Admin Panel (React)
- `https://api.domainmu.com/health` → Backend health check

## Maintenance

### Update Deployment

```bash
# Pull perubahan terbaru
git pull

# Rebuild dan restart
docker compose up -d --build
```

### Backup Database

```bash
# Backup
docker compose exec postgres pg_dump -U dimas pos > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T postgres psql -U dimas pos < backup_20240101.sql
```

### Lihat Logs

```bash
# Semua service
docker compose logs -f

# Service tertentu
docker compose logs -f backend
docker compose logs -f blog
docker compose logs -f cloudflared
```

### Restart Service

```bash
# Restart semua
docker compose restart

# Restart satu service
docker compose restart backend
```

## Troubleshooting

### Tunnel tidak connect
- Pastikan `CLOUDFLARE_TUNNEL_TOKEN` benar
- Cek logs: `docker compose logs cloudflared`

### Database connection error
- Pastikan postgres sudah healthy: `docker compose ps`
- Cek DSN di environment variable

### Upload gambar tidak muncul
- Pastikan `NEXT_PUBLIC_UPLOAD_URL` mengarah ke domain yang benar
- Pastikan Cloudflare tunnel route `api.domain.com` ke `backend:8080`

### Blog/Admin tidak bisa akses API
- Pastikan `ALLOWED_ORIGINS` mencakup semua domain yang digunakan
- Cek browser console untuk CORS error
