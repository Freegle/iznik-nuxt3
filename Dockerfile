FROM ghcr.io/freegle/freegle-base:latest

WORKDIR /app

ENV IZNIK_API_V1=http://freegle-apiv1:80/api \
    IZNIK_API_V2=http://freegle-apiv2:8192/api

COPY package*.json setup-hooks.* ./
COPY patches/ ./patches/
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3002

CMD export NODE_OPTIONS=--max-old-space-size=8192 && \
    rm -rf /tmp/nitro/worker-* && \
    if [ "$NUXT_DEV_MODE" = "true" ]; then \
        export HOST=0 && npm run dev; \
    else \
        npm run build && export HOST=0 && npm run start; \
    fi
