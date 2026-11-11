# Ansistrano Deployment — Static Site (Rsync) Guide

This deployment strategy builds the Next.js static site (`out/`) **once locally** (or in CI) and synchronizes it directly to the target servers using Ansistrano (`rsync_direct`).

Target servers only require **Apache 2.4** and **rsync** — no Node.js, npm, or Git environment needed on the VMs.

---

## Prerequisites (Local Machine)

### 1. Install ansible-core

On Debian / Ubuntu, install via `pipx`:

```bash
pipx install ansible-core
```

### 2. Install Ansistrano roles and collections

From the `deployment/ansible/` directory:

```bash
cd deployment/ansible
ansible-galaxy install -r requirements.yml
ansible-galaxy collection install community.general ansible.posix
```

---

## Configuration

### 1. Inventories and SSH User

Copy example inventory and secrets files:

```bash
cd deployment/ansible

# Preprod
cp inventory/preprod.ini.example inventory/preprod.ini
cp group_vars/preprod/secrets.yml.example group_vars/preprod/secrets.yml

# Production
cp inventory/production.ini.example inventory/production.ini
cp group_vars/production/secrets.yml.example group_vars/production/secrets.yml
```

1. In `inventory/production.ini`, ensure target hosts (`<prod-server-01>` ... `<prod-server-N>`) are reachable via SSH.
2. In `group_vars/production/secrets.yml`, define `ansible_user: "<deploy-user>"`.

### 2. Apache Web Server Configuration (on target servers)

1. Copy the VirtualHost template to Apache:
   ```bash
   sudo cp deployment/production/apache-episciences-insights.conf.template /etc/apache2/sites-available/episciences-insights.conf
   ```
2. Enable required Apache modules and the site:
   ```bash
   sudo a2enmod rewrite headers expires deflate remoteip
   sudo a2ensite episciences-insights.conf
   sudo apache2ctl configtest
   sudo systemctl reload apache2
   ```

3. Ensure `/srv/episciences-insights` exists and belongs to the deploy user:
   ```bash
   sudo mkdir -p /srv/episciences-insights
   sudo chown -R <deploy-user>:www-data /srv/episciences-insights
   ```

4. Grant passwordless sudo to the deploy user for reloading Apache:
   ```sudoers
   # /etc/sudoers.d/<deploy-user>
   <deploy-user> ALL=(ALL) NOPASSWD: /bin/systemctl reload apache2
   ```

---

## Deploy

```bash
# Build locally and deploy to production (all nodes):
make deploy-production

# Deploy to a single node:
cd deployment/ansible
ansible-playbook deploy.yml -i inventory/production.ini --limit <prod-server-01>

# Deploy existing build without rebuilding:
make deploy-production-no-build

# Deploy to preprod:
make deploy-preprod
```

## Rollback

```bash
# Production rollback (instant atomic symlink switch to previous release):
make rollback-production

# Preprod rollback:
make rollback-preprod
```
