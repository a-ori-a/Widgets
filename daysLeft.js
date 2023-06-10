// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;
const widget = new ListWidget()

if (args.widgetParameter == null | args.widgetParameter == '') {
  parameter = "EIKEN.2023/6/4"
} else {
  parameter = args.widgetParameter
}
var split = parameter.split('.')
var event = split[0]
var goal = new Date(split[1]).getTime()
var now = new Date().getTime()
var diffDate = Math.ceil((goal - now) / (1000 * 3600 * 24))
if (split.length == 4) {
  var bgColor = split[2]
  var fgColor = split[3]
} else {
  var fgColor = 'dfdfdf'
  var bgColor = '2f2f2f'
}

widget.backgroundColor = new Color(bgColor)

widget.addSpacer()

var event = widget.addText(event)
event.textColor = new Color(fgColor)
event.font = Font.boldSystemFont(14)
event.centerAlignText()

widget.addSpacer()

var youhave = widget.addText('You have')
youhave.textColor = new Color(fgColor)
youhave.font = Font.systemFont(12)

var days = widget.addText('' + diffDate)
days.centerAlignText()
days.textColor = new Color(fgColor)
days.font = Font.systemFont(50)

var daysleft = widget.addText('days')
daysleft.textColor = new Color(fgColor)
daysleft.font = Font.systemFont(12)
daysleft.rightAlignText()

widget.addSpacer()

widget.presentSmall()
