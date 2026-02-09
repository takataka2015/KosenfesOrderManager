# 高専祭2025E4焼うどん会計アプリ
## 使用言語・ライブラリ・フォントと開発環境
### 注文受付・タイムカード
- Next.js
  - TypeScript
  
### 注文一覧表示
- Unity
  - [Version](https://unity.com/ja/releases/editor/whats-new/6000.0.41f1)

### 注文消し込み用マクロ
- Auto Hot Key

## 概要
- Next.jsによりサーバーを立ち上げることで模擬店の注文管理システムを立ち上げることができます。
※localhostによる実行にも対応しています。

### 注文管理
- 内部でjsonを読み書きすることによって、Next.jsとUnity間で通信を行います。
- 注文受付で注文一覧に注文内容を追加し、Unity側に表示します。
- 商品が完成したら対応する注文をUnity側で選択し、注文の消し込みを行います。
- その注文が呼び出し状態になります。  
※Auto Hot Keyを導入している場合、[このファイル](/Controller/autoHotKey/DisplayControl.ahk)を読み込ませると、数字キーが対応した注文表の場所の消し込みを行うようになります。

### タイムカード機能
- ```↑↑↓↓←→←→BA```とコマンドを打つことでタイムカードの画面に遷移できます。
- 内部でjsonを読み書きすることによって、ログを記録します。
- 対応する出席番号を入力し、勤怠を入力します。

## 画面一覧
- VSCode上で```npm run dev```などを実行しサーバーを立ち上げます。
![screenshot of run](/ReadmeImage/run_view.png)

### 注文受付
- 注文内容を入力します。
- 注文番号や支払い方法を選択します。
![screenshot of cashier](/ReadmeImage/cashier_view.png)

### 注文一覧表示
- Requireにトッピングの合計量が表示されます。
- 対応する注文表を選択することで消し込みを行います。
- 呼び出し中に直前に消し込んだ注文の番号が表示されます。
- 呼び出し中の番号を選択し、提供済みの状態にできます。
![screenshot of oderList](/ReadmeImage/oderList_view.jpg)

### タイムカード
- 注文受付の画面で```↑↑↓↓←→←→BA```と入力することでタイムカードの画面に遷移できます。
- 出席番号を入力できます。
- 出勤ボタンを押すと出勤、退勤ボタンを押すと退勤したことになります。
- 出席番号確認を押すことで勤務時間の確認もできます。
- また現在出勤していることになっている従業員の一覧も確認できます。
![screenshot of attendance](/ReadmeImage/attendance_view.jpg)

## 開発者
- 注文一覧表示・全体設計： @stonekiln
- 注文表示・Webページ制御： @mochirow
- タイムカード： @massi-428
