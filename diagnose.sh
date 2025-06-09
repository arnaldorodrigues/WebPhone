#!/bin/bash

echo "🔍 WebPhone 502 Error Diagnostic Script"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${YELLOW}1. Checking PM2 Status${NC}"
pm2 status

echo -e "\n${YELLOW}2. Checking if port 3000 is listening${NC}"
sudo netstat -tlnp | grep :3000 || echo "❌ Nothing listening on port 3000"

echo -e "\n${YELLOW}3. Checking PM2 WebPhone logs (last 20 lines)${NC}"
pm2 logs WebPhone --lines 20 || echo "❌ No PM2 logs found"

echo -e "\n${YELLOW}4. Checking Nginx status${NC}"
sudo systemctl status nginx --no-pager -l

echo -e "\n${YELLOW}5. Checking Nginx configuration test${NC}"
sudo nginx -t

echo -e "\n${YELLOW}6. Checking WebPhone Nginx logs (last 10 lines)${NC}"
sudo tail -10 /var/log/nginx/WebPhone_error.log 2>/dev/null || echo "❌ No Nginx error logs found"

echo -e "\n${YELLOW}7. Testing localhost:3000 connection${NC}"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000 || echo "❌ Failed to connect to localhost:3000"

echo -e "\n${YELLOW}8. Checking application directory${NC}"
ls -la /var/www/WebPhone/ | head -10

echo -e "\n${YELLOW}9. Checking if .next build exists${NC}"
ls -la /var/www/WebPhone/.next/ 2>/dev/null | head -5 || echo "❌ No .next build directory found"

echo -e "\n${YELLOW}10. Checking running processes on port 3000${NC}"
sudo lsof -i :3000 || echo "❌ No processes found on port 3000"

echo -e "\n${YELLOW}11. Memory and disk usage${NC}"
df -h /var/www/WebPhone
free -h

echo -e "\n${GREEN}Diagnostic complete!${NC}"
echo -e "If port 3000 shows nothing listening, your Node.js app isn't running."
echo -e "Check PM2 logs above for the reason why it's not starting." 