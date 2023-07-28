FROM node:18-alpine

WORKDIR /app

ENV IZNIK_API_V1=https://apiv1.localhost/api \
    IZNIK_API_V2=https://apiv2.localhost/api

RUN apk update && apk add git \
    && git clone https://github.com/Freegle/iznik-nuxt3.git

CMD cd iznik-nuxt3 \
    && git pull \
    && yes | npm install -y --legacy-peer-deps \
    && export NODE_OPTIONS=--max-old-space-size=8192;npm run build \
    && npm run start