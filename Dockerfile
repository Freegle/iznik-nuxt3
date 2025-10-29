FROM node:22-slim

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    xvfb \
    dbus \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && mkdir -p /var/run/dbus \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV IZNIK_API_V1=http://freegle-apiv1:80/api \
    IZNIK_API_V2=http://freegle-apiv2:8192/api

COPY package*.json setup-hooks.* ./
RUN npm install --legacy-peer-deps

# Install Playwright browsers and system dependencies after npm install
RUN npx playwright install chromium && npx playwright install-deps

COPY . .

EXPOSE 3002

CMD export NODE_OPTIONS=--max-old-space-size=8192 && \
    rm -rf /tmp/nitro/worker-* && \
    if [ "$NUXT_DEV_MODE" = "true" ]; then \
        export HOST=0 && npm run dev; \
    else \
        npm run build && export HOST=0 && npm run start; \
    fi