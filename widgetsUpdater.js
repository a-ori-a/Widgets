// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: sync-alt;
const rawFiles = ["dayCounter.js", "randomQuotes.js", "tsfm.js", "timeTable.js", "wultidly.js", "Calendar.js", "Reminder.js", "Weather.js"]
var fm = FileManager.iCloud()
var root = fm.documentsDirectory() + '/'
var anyUpdate = false

var rq = new Request('https://raw.githubusercontent.com/a-ori-a/Widgets/master/widgetsUpdater.js')
var updater = await rq.loadString()
if (updater != fm.readString(root+'widgetsUpdater.js')) {
  fm.writeString(root+'widgetsUpdater.js', updater)
  var al = new Alert()
  al.title = 'Update found on widgetsUpdater'
  al.message = 'run this script again'
  al.addAction('OK')
  al.present()
}
for (var file of rawFiles) {
  var rq = new Request("https://raw.githubusercontent.com/a-ori-a/Widgets/master/" + file)
  var rawCode = await rq.loadString()
  if (fm.fileExists(root + file)) {
    if (fm.readString(root + file) != rawCode) {
      alt = new Alert()
      alt.addAction("Update")
      alt.addCancelAction("Don't update plz")
      alt.title = "Update found on " + file
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
  alt.title = "Update complete"
  alt.addAction("ok")
  await alt.present()
} else {
  var alt = new Alert()
  alt.title = "No update found"
  alt.message = "Your scripta are up to date"
  alt.addAction("ok")
  await alt.present()
}
