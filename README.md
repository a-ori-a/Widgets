# Widgets

Widgets for iOS and iPad OS using Scriptable

## How to install

1. Install [Scriptable App](https://scriptable.app/) from the App Store.
2. Create new scriptable project.
3. Paste the code below.
```javascript
fm = new FileManager.iCloud();
var rq = new Request("https://raw.githubusercontent.com/a-ori-a/Widgets/master/widgetsUpdator.js");
fm.writeString(fm.documentsDirectory()+"/widgetsUpodator.js", await rq.loadString());
``` 
4. Run the script and reopen Scriptable
5. Run widgetsUpdator script

## How to use
1. Return to the home screen.
2. Add Scriptable widget
3. Select the widget you want from the list with reference to [this forum](https://talk.automators.fm/t/widget-on-home-screen/9736).