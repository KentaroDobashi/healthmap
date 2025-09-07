FROM node:20-alpine
WORKDIR /app

# 依存だけイメージ側に用意（devDeps 含む）。ソースは bind mount で供給
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@latest --activate \
  && pnpm i

EXPOSE 3000
CMD ["pnpm","dev"]
