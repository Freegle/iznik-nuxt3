FROM node:18-alpine

# Install postfix for mail relay
RUN apk add --no-cache postfix

WORKDIR /app

ENV IZNIK_API_V1=http://freegle-apiv1:80/api \
    IZNIK_API_V2=http://freegle-apiv2:8192/api

COPY package*.json setup-hooks.* ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3002

CMD export NODE_OPTIONS=--max-old-space-size=8192 && \
    rm -rf /tmp/nitro/worker-* && \
    echo "relayhost = [mailhog]:1025" >> /etc/postfix/main.cf && \
    postfix start && \
    if [ "$NUXT_DEV_MODE" = "true" ]; then \
        export HOST=0 && npm run dev; \
    else \
        npm run build && export HOST=0 && npm run start; \
    fi