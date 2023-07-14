// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
const rawFiles = ["widgetsUpdator.js", "dayCounter.js", "daysLeft.js", "randomQuotes.js", "tsfm.js", "timeTable.js", "wultidly.js"]
var fm = FileManager.iCloud()
var root = fm.documentsDirectory() + '/'
var anyUpdate = false

for (var file of rawFiles) {
  var rq = new Request("https://raw.githubusercontent.com/a-ori-a/Widgets/master/" + file)
  var rawCode = await rq.loadString()
  if (fm.fileExists(root + file)) {
    if (fm.readString(root + file) != rawCode) {
      alt = new Alert()
      alt.addAction("Update")
      alt.addCancelAction("Don't update plz")
      alt.title = "Update found in " + file
      var update = await alt.present()
      if (update == -1) {
      } else {
        anyUpdate = true
        fm.writeString(root + file, rawCode)  // overwrite existing code with (maybe) new one
      }
    }
  } else {
    fm.writeString(root + file, rawCode)
  }
}

if (anyUpdate) {
  alt = new Alert()
  alt.title = "Script updated"
  alt.addAction("ok")
  await alt.present()
} else {
  var alt = new Alert()
  alt.title = "No script was updated"
  alt.addAction("ok")
  await alt.present()
}
