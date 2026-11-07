FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY services/login-service/package.json services/login-service/package-lock.json ./services/login-service/
RUN cd services/login-service && npm ci --omit=dev --no-audit --no-fund
COPY services/shipping-service/requirements.txt ./services/shipping-service/requirements.txt
RUN python3 -m venv /opt/venv && /opt/venv/bin/pip install --no-cache-dir -r services/shipping-service/requirements.txt
COPY --chown=node:node . .
ENV NODE_ENV=production LOCAL_SERVICES=false SHIPPING_PYTHON=/opt/venv/bin/python PYTHONUNBUFFERED=1
USER node
EXPOSE 10000
CMD ["node", "scripts/start-hosted.cjs"]
