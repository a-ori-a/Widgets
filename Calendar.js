// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: calendar-alt;
var today = new Date()
var widget = new ListWidget()
var first = new Date()
first.setDate(1)
var firstDay = first.getDay()
// Sun : 0, Mon : 1, ~ ~ ~, Fri : 5, Sat : 6

const Month = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]
const Day = ["S", "M", "T", "W", "T", "F", "S"]
const colors = {
    background: new Color('#fdf6e3'),
    foreground: new Color('#657b83'),
    subBackground: new Color('#eee8d5'),
    subForeground: new Color('#93a1a1'),
    accent: new Color('#268bd2')
}

widget.backgroundColor = colors.background
var title = widget.addText(Month[today.getMonth()])
title.font = new Font("Futura", 12)
title.centerAlignText()
title.textColor = colors.accent
widget.addSpacer(6)
var body = widget.addStack()

body.layoutVertically()
body.spacing =-2
var dayIndicator = body.addStack()
dayIndicator.setPadding(0, 0, 0, 0)
var lines = []
for (var i=0;i<7;i++) {
    var line = body.addStack()
    lines.push(line)
}

for (var i=0;i<7;i++) {
    var box = dayIndicator.addStack()
    box.size = new Size(16,16)
    box.centerAlignContent()
    var dayText = box.addText(Day[i])
    dayText.font = new Font("Futura", 10)
    dayText.textColor = colors.foreground
}
var position = firstDay
for (var i=0;i<position;i++) {
    var box = lines[0].addStack()
    box.size = new Size(16,16)
    box.centerAlignContent()
    var date = box.addText("")
    date.font = new Font("Futura", 10)
    date.textColor = colors.foreground
}
var index = 0
for (var i = 1;i<32;i++) {
    var box = lines[index].addStack()
    box.size = new Size(16,16)
    box.centerAlignContent()
    var date = box.addText(i+"")
    date.font = new Font("Futura", 10)
    date.textColor = colors.foreground
    if (position == 0) {
        date.textColor = colors.subForeground
    }
    if (i == today.getDate()) {
        date.textColor = colors.accent
        date.font = new Font("Futura Bold", 10)
    }
    if (position == 6) {
        position = 0
        index++
    } else {
        position++
    }
}

widget.presentSmall()
Script.setWidget(widget)
