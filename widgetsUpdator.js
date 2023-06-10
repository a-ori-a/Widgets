// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
const rawFiles = ["dayCounter.js", "daysLeft.js", "randomQuotes.js","widgetsUpdator.js"]
var fm = FileManager.iCloud()
var root = fm.documentsDirectory()+'/'

for (var file of rawFiles) {
  var rq = new Request("https://raw.githubusercontent.com/a-ori-a/Widgets/master" + file)
  var rawCode = await rq.loadString()
  fm.writeString(root+file, rawCode)  // overwrite existing code with (maybe) new one
}