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

### 依存インストール
```bash
pnpm install
```
### DB起動
```bash
docker compose up -d db mailpit
```
### Prisma マイグレーション
```bash
pnpm prisma migrate dev
```

### 開発サーバ起動
```bash
pnpm dev
```
## 📂 プロジェクト構成
```csharp
healthmap/
├─ apps/
│  └─ web/            # Next.js アプリ
│     ├─ app/         # App Router
│     ├─ prisma/      # Prisma schema, migrations, seed.ts
│     ├─ package.json / pnpm-lock.yaml
│     └─ Dockerfile   # web サービス用 Dockerfile
├─ docker-compose.yml  # 全体の起動定義
└─ README.md
```

## 🗄 データベース設計の補足

Prisma スキーマにユニーク制約を追加し、**DB レベルでデータ整合性を保証**しています。

- `SleepSession`
  - ユーザーごとに同じ開始時刻のセッションを重複登録できない
  - ```prisma
    @@unique([userId, startedAt])
    ```

- `VitalSample`
  - ユーザーごとに同じ種類・同じ記録時刻のバイタルを重複登録できない
  - ```prisma
    @@unique([userId, kind, recordedAt])
    ```

- `LabResult`
  - ユーザーごとに同じ採血日時・同じ検査項目を重複登録できない
  - ```prisma
    @@unique([userId, testName, collectedAt])
    ```
### ✅ 動作検証

実際に SQL で `INSERT` を行い、**重複データを登録しようとするとエラーが発生することを確認済み**です。

例:

```bash
ERROR:  duplicate key value violates unique constraint "SleepSession_userId_startedAt_key"
DETAIL:  Key ("userId", "startedAt")=(u1, 2025-09-07 22:00:00+00) already exists.
```

### 🩹 よくあるトラブルと対処

- **Prisma のコマンドが見つからない**  
  → `pnpm prisma` ではなく `npx prisma` を使う / 依存を再インストール  

- **DB 接続エラー (P1001, P1002)**  
  → `docker compose up db` で DB を先に起動。`depends_on` で再試行される  

- **マイグレーションで止まる**  
  → 初回は `--name init` をつけると解決  

---

### 🔮 今後の展望

- フロントでの入力フォーム実装 → 実際にデータを登録 & 表示  
- CSV/JSON インポート機能  
- AI サマリ機能の統合  
- Supabase へのデプロイ  
- Ver.0.1 として公開予定 🚀  

---

### 📌 まとめ

- Docker Compose で Next.js + Prisma + PostgreSQL をワンコマンドで立ち上げ可能  
- ユニーク制約を設計し、**実際に INSERT 検証で動作確認済み**  
- 開発環境の再現性を担保したポートフォリオプロジェクト  
かい
