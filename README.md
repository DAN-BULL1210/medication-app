# 服薬確認ツール

ひとり暮らしの高齢者用服薬記録LINE通知アプリケーション

## アプリの目的と背景
「ひとり暮らしの叔父にちゃんと薬を飲んでほしいけど複雑な操作ができない」という心配事を解決するために開発しました。
利用者が行う操作は「薬を飲んだらボタンを押すだけ」のシンプルなUIで服薬状況を家族のLINEに自動通知することで、双方の安心感につながります。

## 主な機能、UI/UXの工夫

1. **シンプルなUI設計**
  - 画面には「現在時刻」と「１つの巨大なボタン」のみを配置。
  - 服薬時間帯（朝・昼・夜など）を自動判定し、必要なボタンだけ表示。
  - 服薬後はボタンを無効化し、次の服薬時間とメッセージを表示。
  - 記録完了時には紙吹雪(`canvas-confetti`)が舞う演出を追加し、毎日のモチベーションを向上。

2. **家族向け管理画面（誤操作の完全排除）**
   - 「朝と夜だけ薬を飲む」といった服薬スケジュールの設定機能は、親の画面からは完全に排除。
   - 家族（管理者）専用の画面を別途用意し、家族が代理でスケジュールを設定・管理する仕組みにすることで、高齢者の誤操作リスクをゼロにしました。

3. **LINE連携による見守り機能**
   - 薬を飲んだら即座に家族のLINEへ通知を送信。

## 技術スタック

* **フロントエンド :** Next.js (App Router), React, Tailwind CSS
* **バックエンド :** Next.js (Route Handlers)
* **データベース / 認証 :** Supabase (PostgreSQL)
* **インフラ / デプロイ :** Vercel
* **外部API :** LINE Messaging API

### 技術選定の理由
UIの作りこみとAPI連携（LINE）というコア機能に開発リソースを集中させるため、インフラ構築の手間が省け、かつNext.jsと親和性の高いSupabaseをBaaSとして選定しました。

## データベース設計

### 1. `user_schedules` (服薬スケジュール設定)
ユーザーごとに「どの時間帯の薬が必要か」を管理するテーブル。（※家族の管理画面から更新される）
* `user_id` (UUID) - 主キー
* `needs_morning` (Boolean) - 朝の薬が必要か
* `needs_noon` (Boolean) - 昼の薬が必要か
* `needs_evening` (Boolean) - 夜の薬が必要か
* `needs_night` (Boolean) - 寝る前の薬が必要か

### 2. `medication_logs` (服薬記録)
いつ、どの時間帯の薬を飲んだかを記録するテーブル。（※利用者のメイン画面から追加される）
* `id` (UUID) - 主キー
* `user_id` (UUID)
* `target_date` (Date) - 服薬対象日（検索高速化のため独立）
* `time_slot` (Text) - 時間帯区分 (morning/noon/evening/night)
* `taken_at` (Timestamp) - 打刻時間

> ** データベース設計の工夫:** 
> `user_id`, `target_date`, `time_slot` の3カラムに**複合ユニーク制約**を設けることで、通信ラグや連打による「二重登録」をデータベースレベルで完全に防いでいます。

## ローカル環境の構築手順

1. リポジトリのクローン
   ```bash
   git clone [https://github.com/DAN-BULL1210/medication-tracker.git](https://github.com/DAN-BULL1210/medication-tracker.git)
   cd medication-tracker