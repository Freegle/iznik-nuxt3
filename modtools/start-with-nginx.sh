#!/bin/bash
set -e

echo "Starting ModTools production server with nginx caching proxy..."

# Build if .output doesn't exist or is empty
if [ ! -d "/app/modtools/.output" ] || [ -z "$(ls -A /app/modtools/.output 2>/dev/null)" ]; then
    echo "Building Nuxt application..."
    export NODE_OPTIONS=--max-old-space-size=8192
    rm -rf /tmp/nitro/worker-*
    npm run build
fi

# Create nginx cache directory
mkdir -p /tmp/nginx-cache

# Start Node server on internal port 3002
echo "Starting Node server on port 3002..."
export HOST=0 PORT=3002
node .output/server/index.mjs &
NODE_PID=$!

# Wait for Node to be ready
echo "Waiting for Node server to be ready..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:3002 > /dev/null 2>&1; then
        echo "Node server is ready!"
        break
    fi
    sleep 1
done

# Start nginx on port 3001
echo "Starting nginx on port 3001..."
nginx -c /app/modtools/nginx-proxy.conf -g 'daemon off;' &
NGINX_PID=$!

echo "Both services started. nginx PID: $NGINX_PID, Node PID: $NODE_PID"

# Handle shutdown
trap "echo 'Shutting down...'; kill $NGINX_PID $NODE_PID 2>/dev/null; exit 0" SIGTERM SIGINT

# Wait for either process to exit
wait -n $NGINX_PID $NODE_PID

# If one exits, kill the other
echo "One process exited, shutting down..."
kill $NGINX_PID $NODE_PID 2>/dev/null
exit 1
