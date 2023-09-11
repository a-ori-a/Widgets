// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: list-ul;
var cd = await Calendar.forReminders()
var widget = new ListWidget()
var today = new Date()
var standard = new Date(today.getFullYear(), today.getMonth(),today.getDate())
var cmark = SFSymbol.named("checkmark.square")
var xmark = SFSymbol.named("xmark.square")
var play = SFSymbol.named("play.square")
cmark.applyRegularWeight()
xmark.applyRegularWeight()
play.applyRegularWeight()
cmark.applyFont(new Font("Futura", 12))
xmark.applyFont(new Font("Futura", 12))
play.applyFont(new Font("Futura", 12))

widget.addSpacer()

const colors = {
    background: new Color('#fdf6e3'),
    foreground: new Color('#657b83'),
    subBackground: new Color('#eee8d5'),
    subForeground: new Color('#93a1a1'),
    accent: new Color('#268bd2')
}
const Month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function compare(a, b) {
  var r = 0
  if (a.dueDate < b.dueDate) {
    r = 1
  } else if (a.dueDate > b.dueDate) {
    r = -1
  }
  return r
}

const tools = {
  center: (stack) => {
    var vc = stack.addStack()  // vc stands for vertical container
    vc.layoutVertically()
    vc.addSpacer()
    var hc = vc.addStack()
    vc.addSpacer()
    hc.addSpacer()
    var center = hc.addStack()
    hc.addSpacer()
    return center
  },
  modular: (stack) => {
    stack.size = new Size(144, 144)
    return stack
  },
  highlight: (stack) => {
    var center = tools.center(stack)
    center.size = new Size(120, 120)
    center.backgroundColor = colors.subBackground
    center.cornerRadius = 10
    return center
  },
  centerText: (stack,text) => {
    var line = stack.addStack()
    line.addSpacer()
    var result = line.addText(String(text))
    line.addSpacer()
    return result
  }
}

var tasks = await Reminder.all(cd) // not completed
tasks.sort(compare)
var overs = []
var comps = []
var workings = []
var notNows = []
for (var i of tasks) {
    if (!i.isCompleted) {
        if (i.isOverdue) {
            overs.push(i)
        } else if (i.dueDate.getTime() == standard.getTime()) {
            workings.push(i)
        } else {
            notNows.push(i)
        }
    } else {
        if (0 <= i.completionDate - standard && i.completionDate - standard <= 3600*1000*24) {
            comps.push(i)
        }
    }
}


widget.backgroundColor = colors.background
var body = widget.addStack()
var info = body.addStack()
body.addSpacer(20)
var taskView = body.addStack()
info.layoutVertically()
taskView.layoutVertically()
info.size = new Size(80,120)
info.backgroundColor = colors.subBackground
info.cornerRadius= 10


info.spacing = -23
var top = info.addStack()
var bottom = info.addStack()
var top = tools.center(top)
var bottom = tools.center(bottom)
top.layoutVertically()
top.spacing = -8
bottom.layoutVertically()

// calendar on the info section
var topCal = tools.centerText(top, day[today.getDay()])
topCal.textColor = colors.foreground
topCal.font = new Font("Futura", 12)
topCal = tools.centerText(top, today.getDate())
topCal.font = new Font("Futura", 40)
topCal.textColor = colors.foreground

// task counter on the info section
const taskCount = [comps.length, workings.length, overs.length] // [complete, working, incomplete]
for (var i of [0, 1, 2]) {
    var countHolder = bottom.addStack()
    var imgHolder = countHolder.addStack()
    imgHolder.layoutVertically()
    imgHolder.addSpacer(2)
    image = imgHolder.addImage([cmark, play, xmark][i].image)
    image.resizable = false
    if (i == 0) {
        image.tintColor = Color.green()
    } else if (i == 1) {
        image.tintColor = colors.accent
    }
    text = countHolder.addText(" : " + taskCount[i])// 考えてからコーディングしろバカ
    text.font = new Font("Futura", 14)
    text.textColor = colors.foreground
}
tasks = (workings.concat(notNows.concat(overs))).sort(compare)
if (tasks.length > 5) {
    tasks = tasks.slice(tasks.length-5, tasks.length)
}

var counter = 1
for (var i of tasks) {
  if (counter > 5) {
    break
  } else {
    counter++
  }
  var task = taskView.addStack()
  taskView.addSpacer()
  var left = task.addStack()
  left.layoutVertically()
  task.addSpacer()
  var right = task.addStack()
  right.layoutVertically()
  var line = left.addText(i.title.padEnd(20, " "))
  line.lineLimit = 1
  line.minimumScaleFactor = 1
  line.font = Font.regularMonospacedSystemFont(13)// new Font("AppleSDGothicNeo-Regular", 14)
  line.textColor = colors.foreground
  var time
  if (i.dueDateIncludesTime && i.dueDate !== null) {
    time = `${Month[i.dueDate.getMonth()]}  ${String(i.dueDate.getDate()).padStart(2, "0")}  ${i.dueDate.getHours()}:${i.dueDate.getMinutes()}`
  } else if (i.dueDate !== null) {
    time = `${Month[i.dueDate.getMonth()]}  ${String(i.dueDate.getDate()).padStart(2, "0")}`
  } else {
    time = ""
  }
  var line = right.addText(time)
  line.lineLimit = 1
  line.minimumScaleFactor = 1
  line.font = Font.regularMonospacedSystemFont(13)// new Font("AppleSDGothicNeo-Light", 12)
  line.textColor = colors.accent
  if (today - i.dueDate > 3600*1000*24) {
    line.textColor = new Color("#dc322f")
  } else if (today - i.dueDate < 0) {
    line.textColor = colors.foreground
}
  
}

widget.presentMedium()
