#!/bin/bash

# Browser Phone HTTPS Deployment Script
# Usage: ./deploy.sh YOUR_VPS_IP

if [ -z "$1" ]; then
    echo "Usage: $0 YOUR_VPS_IP"
    exit 1
fi

VPS_IP=$1
APP_NAME="WebPhone"
APP_DIR="/var/www/$APP_NAME"

echo "🚀 Starting HTTPS deployment for Browser Phone..."
echo "📋 VPS IP: $VPS_IP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p $APP_DIR
sudo mkdir -p /var/log/pm2
sudo mkdir -p /etc/ssl/$APP_NAME
sudo chown -R $USER:$USER $APP_DIR
print_status "Directories created"

# Step 2: Install dependencies if not already installed
echo "📦 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt install nginx -y
fi

print_status "Dependencies checked/installed"

# Step 3: Generate SSL certificate
echo "🔐 Generating SSL certificate for IP: $VPS_IP"
sudo openssl genrsa -out /etc/ssl/$APP_NAME/private.key 2048
sudo openssl req -new -key /etc/ssl/$APP_NAME/private.key \
    -out /etc/ssl/$APP_NAME/cert.csr \
    -subj "/C=US/ST=State/L=City/O=WebPhone/CN=$VPS_IP"
sudo openssl x509 -req -days 365 \
    -in /etc/ssl/$APP_NAME/cert.csr \
    -signkey /etc/ssl/$APP_NAME/private.key \
    -out /etc/ssl/$APP_NAME/certificate.crt
sudo chmod 600 /etc/ssl/$APP_NAME/private.key
sudo chmod 644 /etc/ssl/$APP_NAME/certificate.crt
print_status "SSL certificate generated"

# Step 4: Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $VPS_IP;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $VPS_IP;

    # SSL Configuration
    ssl_certificate /etc/ssl/$APP_NAME/certificate.crt;
    ssl_certificate_key /etc/ssl/$APP_NAME/private.key;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Handle static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Error and access logs
    error_log /var/log/nginx/${APP_NAME}_error.log;
    access_log /var/log/nginx/${APP_NAME}_access.log;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
print_status "Nginx configured and reloaded"

# Step 5: Build application
echo "🔨 Building application..."
cd $APP_DIR
npm ci --production=false
npm run build
print_status "Application built"

# Step 6: Start with PM2
echo "🚀 Starting application with PM2..."
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
print_status "Application started with PM2"

# Step 7: Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
print_status "Firewall configured"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Summary:"
echo "  • Application: $APP_NAME"
echo "  • HTTPS URL: https://$VPS_IP"
echo "  • HTTP URL: http://$VPS_IP (redirects to HTTPS)"
echo "  • SSL Certificate: Self-signed for IP $VPS_IP"
echo "  • Process Manager: PM2"
echo "  • Reverse Proxy: Nginx"
echo ""
echo "📊 Useful commands:"
echo "  • Check PM2 status: pm2 status"
echo "  • View PM2 logs: pm2 logs $APP_NAME"
echo "  • Restart app: pm2 restart $APP_NAME"
echo "  • Check Nginx status: sudo systemctl status nginx"
echo "  • View Nginx logs: sudo tail -f /var/log/nginx/${APP_NAME}_access.log"
echo ""
print_warning "Note: Since this uses a self-signed certificate, browsers will show a security warning."
print_warning "You can safely proceed by clicking 'Advanced' and 'Proceed to site'."
echo ""
echo "🔗 Your application is now accessible at: https://$VPS_IP"