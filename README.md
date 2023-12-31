# Widgets

Widgets for iOS and iPad OS using Scriptable

## インストール方法

1. [Scriptable App](https://scriptable.app/)をApp Storeからインストールします。
2. Scriptableを開き新しいプロジェクトを作ります。
3. 下のコードをプロジェクトにコピペします。
```javascript
fm = FileManager.iCloud();
var rq = new Request("https://raw.githubusercontent.com/a-ori-a/Widgets/master/widgetsUpdater.js");
fm.writeString(fm.documentsDirectory()+"/widgetsUpdater.js", await rq.loadString());
``` 
4. コピペしたコードを実行するとwidgetsUpdaterというスクリプトがダウンロードされます。
5. 最後にこのwigetsUpdaterというスクリプトを実行するとすべてのウィジェットがインストールされます。



## 使い方
1. ホームスクリーンに戻ります。
2. Scriptableのウィジェットを追加します。
3. この[フォーラム](https://talk.automators.fm/t/widget-on-home-screen/9736)を参考にウィジェットのプログラムを選んで設定します。

## それぞれのウィジェットの説明

### サイズごとの対応状況
|               | Small | Medium | Large | Extra Large |
| ------------- | ----- | ------ | ----- | ----------- |
| dayCounter    | o     | o      | x     | x           |
| randomQuotes  | o     | o      | o     | o           |
| timeTable     | o     | o      | o     | o           |
| tsfm          | x     | x      | x     | x           |
| wultidly      | o     | o      | o     | o           |
| wigetsUpdator | x     | x      | x     | x           |

### daysLeft
dayCounterの古いバージョンです。開発は終了しています。


### dayCounter
指定した日付までの日数を表示します。日付の指定の仕方はパラメータに`Evnent Name.Year/Month/Date`です。
ex) `New Year's Day.2024/1/1`

### randomQuotes
その日の格言を25個取得し、その中からランダムに選んだものを表示します。
APIが必要なので聞いてください。

### timeTable
ウィジェットに時間割を表示します。現在と次の授業とその終了、開始時刻もわかります。
Scriptableから実行することで時間割やカラーテーマなどの設定を変更できます。

### tsfm
ターミナル風のファイルマネージャーです。

### wultidly
勉強時間と集中力をかけ算して記録するスクリプトです。

### widgetsUpdator
すべてのスクリプトを最新の状態に更新します。
