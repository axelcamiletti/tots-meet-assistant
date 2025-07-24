# Dockerfile para TOTS Meet Bot
FROM node:18-slim

# Instalar dependencias de sistema para Playwright
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libxss1 \
    libxrandr2 \
    libgconf-2-4 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libdrm2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package.json y instalar dependencias
COPY package*.json ./
RUN npm install

# Instalar browsers de Playwright
RUN npx playwright install chromium

# Copiar código del bot
COPY src/ ./src/
COPY tsconfig.json ./

# Compilar TypeScript
RUN npm run build

# Comando para ejecutar el bot
CMD ["node", "dist/bot.js"]
