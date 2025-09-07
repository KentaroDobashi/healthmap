# HealthMap 🌱

**個人の健康データを地図のように可視化するアプリケーション**  
睡眠・体温・血液検査・食事記録などをインポートし、AIが週次サマリや関連性を提示します。  

## Features
- 📊 Dashboard / Timeline / Map でデータを可視化
- ⏱ 睡眠ログ・体温・体重などを iPhone HealthKit JSON からインポート
- 🧪 血液検査（Labs CSV）を取り込み
- 🤖 AI による週次サマリと自然言語クエリ → SQL チャート化
- 🔐 認証（NextAuth）・型安全（Prisma）・最新スタック（Next.js 14, Tailwind, shadcn）

## Tech Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL (Supabase)
- NextAuth
- Docker Compose (Postgres, Mailpit, Web)

## Getting Started (開発環境)
```bash
# 依存インストール
pnpm install

# DB起動
docker compose up -d db mailpit

# Prisma マイグレーション
pnpm prisma migrate dev

# 開発サーバ
pnpm dev

## Demo 
