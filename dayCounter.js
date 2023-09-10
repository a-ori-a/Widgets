// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: business-time;
const base = new ListWidget()

var sunday = false
if (args.widgetParameter == null | args.widgetParameter == '') {
  parameter = "共通テスト.2024/1/13"
} else if (args.widgetParameter == "Sunday") {
  var today = new Date()
  today.setDate(today.getDate() + 7 - today.getDay())
  parameter = "Next Sunday." + today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate()
} else if (args.widgetParameter == "22nd Century") {
  parameter = "22nd Century." + "2101/1/1"
} else if (args.widgetParameter == "Today") {
  var today = new Date()
  parameter = "Today." + today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate()
} else if (args.widgetParameter == "Tomorrow") {
  var today = new Date()
  today.setDate(today.getDate() + 1)
  parameter = "Tomorrow." + today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate()
} else {
  parameter = args.widgetParameter
}

const colors = {
    background: new Color('#fdf6e3'),
    foreground: new Color('#657b83'),
    subBackground: new Color('#eee8d5'),
    subForeground: new Color('#93a1a1'),
    accent: new Color('#268bd2')
}

base.backgroundColor = colors.background

var split = parameter.split('.')
var event = split[0]
var eventDateString = split[1]
var goal = new Date(split[1]).getTime()
var now = new Date().getTime()
var diffDate = String(Math.ceil((goal - now) / (1000 * 3600 * 24)))

var font = /^[A-Za-z0-9\-\ ]*$/.test(event) ? "Futura" : "Futura-Bold"

if (config.runsInAccessoryWidget) {
  var widget = base.addStack()
  widget.layoutHorizontally()

  var eventInfo = widget.addStack()
  eventInfo.layoutVertically()
  var title = eventInfo.addText(event)
  title.textColor = colors.foreground
  eventInfo.addSpacer(5)
  var eventDate = eventInfo.addText(eventDateString)
  eventDate.textColor = colors.foreground

  widget.addSpacer()

  var counter = widget.addText(diffDate)

} else if (config.widgetFamily == "small") {
  var title = base.addText(event)
  title.textColor = colors.foreground

  var eventDate = base.addText(eventDateString)
  eventDate.textColor = colors.foreground

  var counter = base.addText("" + diffDate)
  counter.textColor = colors.foreground
} else if (config.widgetFamily == "medium") {
  base.addSpacer()

  var body = base.addStack()  // body contains both eventinfo and counter
  body.layoutHorizontally()
  //  body.addSpacer()
  {
    var leftSide = body.addStack()
    leftSide.size = new Size(120, 120)
    leftSide.cornerRadius = 10
    //     leftSide.backgroundColor = new Color("ddffdd", 0.1)
    leftSide.backgroundColor = colors.subBackground
    leftSide.layoutVertically()
    {
      var titleHolder = leftSide.addStack()
      titleHolder.addSpacer()
      var title = titleHolder.addText(event)
      title.textColor = colors.foreground
      titleHolder.addSpacer()
    }
    //   var title = leftSide.addText(event
    {
      var dateHolder = leftSide.addStack()
      dateHolder.addSpacer()

      var eventDate = dateHolder.addText(eventDateString)
      eventDate.textColor = colors.foreground
      dateHolder.addSpacer()
    }
  }
  body.addSpacer()
  {
    var counterHolder = body.addStack()
    counterHolder.cornerRadius = 10
    counterHolder.size = new Size(140, 120)
    counterHolder.layoutVertically()
    counterHolder.addSpacer()

    var counterHorizontalHolder = counterHolder.addStack()
    counterHorizontalHolder.addSpacer()
    var counter = counterHorizontalHolder.addText(diffDate)
    counter.textColor = colors.foreground
    counterHorizontalHolder.addSpacer()

    counterHolder.addSpacer()
  }
  base.addSpacer()

  //  body.addSpacer()
} else {
  var title = base.addText(config.widgetFamily + ' widget is not supported')
  var eventDate
  var counter
}
try {
  title.font = new Font(font, 10)
  title.centerAlignText()
  title.minimumScaleFactor = 0
  eventDate.font = new Font("Futura", 10)
  eventDate.centerAlignText()
  eventDate.minimalScaleFactor = 0
  counter.centerAlignText()
  counter.font = new Font("Futura-Medium", 40)
  counter.minimalScaleFactor = 0
  //   counter.shadowColor = new Color("#7f7f7f")
  //   counter.shadowRadius = 10
  //   counter.shadowOffset = new Point(0,30)
} catch { }
// base.presentAccessoryRectangular()
base.presentMedium()
