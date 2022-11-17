# GASを使った支払い情報などを取得するスクリプト集
**Sorry, these scripts target only Japanese services, so I am writing this README only in Japanese.**

GAS上で動作するスクレイピングスクリプト集です｡

## 対応サービス
- 楽天カード(ログインの仕様変更につき未対応)
- PiTaPa(関西圏などで使えるホストペイ型交通系ICカード)
- Freee人事労務(給与明細の取得)

### 楽天カード
ログイン後､トップページに表示される金額を取得します｡  
ログイン仕様変更につき動作せず。

### PiTaPa
引数に指定された年月の支払い情報を取得します｡

### Freee人事労務
銀行に振り込まれる給与額を取得します｡
また､指定されたGoogleドライブ上のフォルダへ給与明細PDFを保存します｡(__savePaymentPDF関数を参照)
