FROM node:18-alpine

WORKDIR /app

ENV IZNIK_API_V1=http://apiv1.localhost/api \
    IZNIK_API_V2=http://apiv2.localhost:8192/api

RUN apk update && apk add git \
    && git clone https://github.com/Freegle/iznik-nuxt3.git

CMD cd iznik-nuxt3 \
    && git pull \
    && yes | npm install -y --legacy-peer-deps \
    && export NODE_OPTIONS=--max-old-space-size=8192;npm run build \
    && export HOST=0; npm run start