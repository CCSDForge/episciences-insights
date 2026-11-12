# Production Web Server Configuration

Episciences Insights generates pre-compressed static assets in Brotli (`.br`) and Gzip (`.gz`) formats during the build step. Serving these pre-compressed assets directly eliminates runtime compression CPU overhead and delivers sub-second response times.

## Apache VirtualHost (`.htaccess` / `vhost.conf`)

```apache
<VirtualHost *:80>
    ServerName insights.episciences.org
    DocumentRoot /var/www/episciences-insights/out

    <Directory /var/www/episciences-insights/out>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        DirectoryIndex index.html

        ErrorDocument 404 /404.html

        # 1. Serve pre-compressed static assets (.br and .gz)
        <IfModule mod_rewrite.c>
            RewriteEngine On

            # Brotli priority if accepted by client
            RewriteCond %{HTTP:Accept-Encoding} br
            RewriteCond %{REQUEST_FILENAME}.br -f
            RewriteRule ^(.*)$ $1.br [L]

            # Gzip fallback
            RewriteCond %{HTTP:Accept-Encoding} gzip
            RewriteCond %{REQUEST_FILENAME}.gz -f
            RewriteRule ^(.*)$ $1.gz [L]
        </IfModule>

        <IfModule mod_headers.c>
            <Files *.json.br>
                ForceType application/json
                Header set Content-Encoding br
                Header append Vary Accept-Encoding
            </Files>

            <Files *.json.gz>
                ForceType application/json
                Header set Content-Encoding gzip
                Header append Vary Accept-Encoding
            </Files>

            # Next.js immutable assets (_next/static/) : 1 year cache
            <FilesMatch "\.(js|css)$">
                Header set Cache-Control "public, max-age=31536000, immutable"
            </FilesMatch>

            # JSON datasets: revalidate on deployment
            <FilesMatch "\.json(\.gz|\.br)?$">
                Header set Cache-Control "no-cache, must-revalidate"
            </FilesMatch>

            # HTML pages: immediate revalidation
            <FilesMatch "\.html$">
                Header set Cache-Control "public, max-age=0, must-revalidate"
            </FilesMatch>
        </IfModule>

        # 2. Dynamic compression fallback for uncompressed resources
        <IfModule mod_deflate.c>
            AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
            AddOutputFilterByType DEFLATE text/javascript application/javascript application/json image/svg+xml
        </IfModule>
    </Directory>
</VirtualHost>
```

---

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name insights.episciences.org;
    root /var/www/episciences-insights/out;
    index index.html;

    error_page 404 /404.html;

    # 1. Serve pre-compressed static assets directly
    gzip_static on;       # ngx_http_gzip_static_module
    # brotli_static on;   # requires ngx_brotli module

    # 2. Dynamic compression fallback
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml;

    # 3. Next.js static assets: cache 1 year
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 4. JSON datasets: revalidate on each request
    location ~* \.json(\.gz|\.br)?$ {
        expires -1;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # 5. HTML pages: revalidate
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```
