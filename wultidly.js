// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: stopwatch;
var code = ''
var widget = new ListWidget()
var fm = FileManager.local()
var today = new Date()
var fileName = `/${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.json`
const doc = fm.documentsDirectory() + "/wultidly"
const colorTheme = {
  light: {
    background: new Color('#fdf6e3'),
    foreground: new Color('#657b83'),
    subBackground: new Color('#eee8d5'),
    subForeground: new Color('#93a1a1'),
    accent: new Color('#268bd2')
  },
  dark: {
    background: '#657b83',
    foreground: '#fdf6e3',
    subBackground: '#93a1a1',
    subForeground: '#eee8d5',
    accent: '#268bd2'
  }
}
var colors = colorTheme.light

// this code dowsn't work in a widget on homescreen due to the bug.
// var colors = {
//   background: Color.dynamic(new Color(colorTheme.light.background), new Color(colorTheme.dark.background)),
//   foreground: Color.dynamic(new Color(colorTheme.light.foreground), new Color(colorTheme.dark.foreground)),
//   subBackground: Color.dynamic(new Color(colorTheme.light.subBackground), new Color(colorTheme.dark.subBackground)),
//   subForeground: Color.dynamic(new Color(colorTheme.light.subForeground), new Color(colorTheme.dark.subForeground)),
//   accent: Color.dynamic(new Color(colorTheme.light.accent), new Color(colorTheme.dark.accent))
// }
widget.backgroundColor = colors.background
var widgetFamily = config.widgetFamily
var widgetParameter = args.widgetParameter
if (config.runsInApp) {
  var widgetFamily = "medium"
  var widgetParameter = "breakdown"
}
record = ["", "", 0, 0]

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
  },
  highlight: (stack) => {
    var center = tools.center(stack)
    center.size = new Size(120, 120)
    center.backgroundColor = colors.subBackground
    center.cornerRadius = 10
    return center
  }
}

const modules = {
  pieChart: async (stack) => {
    code = `
    var canvas = document.querySelector("canvas");
    var w = 820;
    var h = 820;
    canvas.width = w;
    canvas.height = h;
    var c = canvas.getContext("2d");
    c.font = "50px Courier-Bold"
    c.lineWidth = 15
    c.strokeStyle = "${colors.foreground.hex}"
    `
    createImage()
    {
      stack.addSpacer()
      var body = stack.addStack()
      stack.addSpacer()
    }
    body.layoutVertically()
    body.addSpacer()
    body.addImage(await getImage()).applyFillingContentMode()
    body.addSpacer()
    return stack
  },
  breakdown: async (stack) => {
    tools.modular(stack)
    var breakdownList = tools.highlight(stack)
    breakdownList.layoutVertically()
    breakdownList.addSpacer()
    var count = 0
    for (var subj of log) {
      var line = breakdownList.addStack()
      var text = `${subj.name} : ${subj.hours} H ${subj.minutes} M`
      line.addSpacer()
      var text = line.addText(text)
      line.addSpacer()
      text.font = new Font("mono", 13)
      text.textColor = new Color(colors.subForeground.hex)
      switch (count) {
        case 0:
          text.textColor = new Color(colors.accent.hex)
          break
        case 1:
          text.textColor = new Color(colors.foreground.hex)
          break
        default:
          break
      }
      count++
    }
    breakdownList.addSpacer()
  },
  recordButton: async (stack) => {
    stack.addSpacer() // left spacer
    var buttonContainer = stack.addStack()
    stack.addSpacer()  // right spacer
    buttonContainer.layoutVertically()
    buttonContainer.addSpacer()  // top spacer
    var button = buttonContainer.addStack()
    button.layoutVertically()
    buttonContainer.addSpacer()  // bottom spacer
    button.size = new Size(120, 120)
    button.backgroundColor = colors.subBackground
    button.cornerRadius = 10
    button.url = 'scriptable:///run/wultidly'
    button.addSpacer()  // top spacer of the text

    var recordContainer = button.addStack()
    recordContainer.addSpacer()
    var text = recordContainer.addText('Record')
    text.font = new Font('futura', 13)
    text.textColor = colors.foreground
    recordContainer.addSpacer()

    var studyTimeContainer = button.addStack()
    studyTimeContainer.addSpacer()
    var text = studyTimeContainer.addText('Study Time')
    text.font = new Font('futura', 13)
    text.textColor = colors.foreground
    studyTimeContainer.addSpacer()

    button.addSpacer()  // bottom spacer of the text
  },
  calender: async (stack) => {
    try {
      stack.layoutVertically()
    } catch { }
    stack.addSpacer()
    var horizontal = stack.addStack()
    stack.addSpacer()
    horizontal.addSpacer()
    var today = new Date()
    var text = `${today.getMonth() + 1} / ${today.getDate()}`
    var text = horizontal.addText(text)
    text.font = new Font("futura", 40)
    text.textColor = colors.foreground
    text.minimumScaleFactor = 0.05
    text.lineLimit = 1
    horizontal.addSpacer()
    return stack
  },
  yesterday: async (stack) => {
    code = `
    var canvas = document.querySelector("canvas");
    var w = 820;
    var h = 820;
    canvas.width = w;
    canvas.height = h;
    var c = canvas.getContext("2d");
    c.font = "50px Courier-Bold"
    c.lineWidth = 15
    c.strokeStyle = "${colors.foreground.hex}"
    `
    createImage(1)
    {
      stack.addSpacer()
      var body = stack.addStack()
      stack.addSpacer()
    }
    body.layoutVertically()
    body.addSpacer()
    body.addImage(await getImage()).applyFillingContentMode()
    body.addSpacer()
    return stack
  }
}

// main code
ui = new UITable()
if (config.runsInApp) {
  createScreen(true)
  await ui.present(1)
}

if (widgetFamily == "small") {
  await createSmallWidget(widgetParameter)
} else if (widgetFamily == "medium") {
  await createMediumWidget(widgetParameter)
} else if (widgetFamily == "large") {
  await createSmallWidget(widgetParameter)
} else if (widgetFamily == "extraLarge") {
  await createExtraLargeWidget(widgetParameter)
} else {
  console.log("Not a valid widget family")
}

if (config.runsInApp) {
  if (widgetFamily == "small") {
    widget.presentSmall()
  } else if (widgetFamily == "medium") {
    widget.presentMedium()
  } else if (widgetFamily == "large") {
    widget.presentLarge()
  } else if (widgetFamily == "extraLarge") {
    widget.presentExtraLarge()
  }
}
Script.setWidget(widget)

// useful functions
// async function createSquareWidget() {
//   widget.backgroundColor = new Color("#fefffd")
//   modules.pieChart(widget)
// }

async function createSmallWidget(type) {
  getInfo()
  if (type === null) {
    await modules.pieChart(widget)
  } else if (type == 'breakdown') {
    await modules.breakdown(widget)
  } else if (type == "record") {
    await modules.recordButton(widget)
  } else if (type == "calender") {
    modules.calender(widget)
  } else if (type == "yesterday") {
    await modules.yesterday(widget)
  } else {
    var failtext = widget.addText(type + 'failed to create widget')
    failtext.textColor = colors.foreground
    console.log("fail")
  }
}

async function createMediumWidget(type) {
  {   // construct base
    var container = widget.addStack()
    container.addSpacer()  // left space
    var left = container.addStack()
    container.addSpacer(20)  // mid space
    var right = container.addStack()
    container.addSpacer()  // right space

    left.size = new Size(144, 144)
    right.size = new Size(144, 144)
  }
  if (type === null || type == 'breakdown') {
    right.size = new Size(140, 100)
    await modules.pieChart(left)
    modules.breakdown(right)
  } else if (type == 'record') {
    await modules.pieChart(left)
    modules.recordButton(right)
  } else {
    widget.addText(type+" is not supported")
    console.log(type)
  }
}

async function createExtraLargeWidget(type) {
  {  // construct base
    var container = widget.addStack()
    container.addSpacer()  // left spacer
    var left = container.addStack()
    container.addSpacer(40)  // mid spacer(twice as big as the space of medium widget)
    var right = container.addStack()
    container.addSpacer()  // right spacer

    {  // construct base in the right stack
      right.layoutVertically()
      var top = right.addStack()
      var bottom = right.addStack()
      {  // construct base in the top stack
        top.addSpacer()
        var topLeft = top.addStack()
        top.addSpacer(20)
        var topRight = top.addStack()
        top.addSpacer()
      }
      {  // construct base in the bottom stack
        bottom.addSpacer()
        var bottomLeft = bottom.addStack()
        bottom.addSpacer(20)
        var bottomRight = bottom.addStack()
        bottom.addSpacer()
      }
    }
    {  // modular stacks
      tools.modular(topLeft)
      tools.modular(topRight)
      tools.modular(bottomLeft)
      tools.modular(bottomRight)
    }
  }  // base construction finished
  if (type == "" || true) {
    await modules.pieChart(left)
    modules.breakdown(topLeft)
    modules.calender(topRight)
    await modules.yesterday(bottomLeft)
    modules.recordButton(bottomRight)
  }
}

function circle(radius, start, end, color, title) {
  start -= 0.5 * Math.PI
  end -= 0.5 * Math.PI
  var midAngle = (start + end) / 2
  const script = `
  c.beginPath()
  c.arc(w/2,h/2, ${radius}, ${start}, ${end})
  c.lineTo(w/2, h/2)
  c.strokeStyle = "${colors.foreground.hex}"
  c.stroke()
  if ("${title}" != "" && ${end - start > 0.5}) {
    correct = c.measureText('${title}').width
    c.fillStyle = "${colors.accent.hex}"
    c.fillText("${title}", ${radius}/1.3*Math.cos(${midAngle})+w/2-correct/2, ${radius}/1.3*Math.sin(${midAngle})+h/2+15)
  }`
  return script
}

async function getImage() {  // load html
  let html = `<canvas>`
  var view = new WebView()
  await view.loadHTML(html)
  code += "\ncanvas.toDataURL();"
  let image = await view.evaluateJavaScript(code)
  let data = Data.fromBase64String(image.slice(image.indexOf(",") + 1))
  return Image.fromData(data)
}

function getInfo(daysDelta = 0) {
  var today = new Date()
  today.setDate(today.getDate() - daysDelta)
  var fileName = `/${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.json`
  if (fm.fileExists(doc + fileName)) {
    log = JSON.parse(fm.readString(doc + fileName))
  } else {
    log = []
    info = {
      total: 0,
      total_int: 0,
      raw: 0,
      efficiency: 0
    }
    return
  }
  log.sort(compare)
  totalTime = rawTime = 0
  for (var subj of log) {
    totalTime += subj.time
    rawTime += subj.raw
  }

  info = {
    total: totalTime,
    total_int: Math.floor(totalTime),
    raw: rawTime,
    efficiency: Math.floor(totalTime / rawTime * 100)
  }
}

function createImage(daysDelta = 0) {  // generate code to create image
  getInfo(daysDelta)
  now = 0
  for (var subj of log) {
    code += "\n" + circle(400, 2 * Math.PI * now / info.total, 2 * Math.PI * (now + subj.time) / info.total, 'no color', subj.name)
    now += subj.time
  }
  code += `
  c.lineWidth = 30
  ${circle(200, 0, 2 * Math.PI, '#fefffd', "")}
  c.fillStyle="${colors.background.hex}"
  c.fill()`

  code += `
  c.fillStyle = "${colors.subForeground.hex}"
  c.font="80px futura"
  c.fillText("${Math.floor(info.total_int / 60)} Hrs", w/2-c.measureText("${Math.floor(info.total_int / 60)} Hrs").width/2, h/2-10)
  c.fillText("${info.total_int - 60 * Math.floor(info.total / 60)} min", w/2-c.measureText("${info.total_int - 60 * Math.floor(info.total / 60)} min").width/2, h/2+70)`
}

function compare(a, b) {
  var r = 0
  if (a.time < b.time) {
    r = 1
  } else if (a.time > b.time) {
    r = -1
  }
  return r
}

function moveTo(array, from, direction) {
  if (direction == -1 && from == 0) {
    return array
  } else if (direction == 1 && from == array.length - 1) {
    return array
  }
  var value = array[from]
  array.splice(from, 1)
  array.splice(from + direction, 0, value)
  return array
}

function createScreen(loadFiles = false) {
  fm = FileManager.local()
  var setSubjectsPath = fm.documentsDirectory() + '/wultidly/setSubjects'
  if (!fm.fileExists(fm.documentsDirectory() + '/wultidly')) {
    fm.createDirectory(fm.documentsDirectory() + '/wultidly')
  }
  if (!fm.fileExists(setSubjectsPath)) {
    var setSubjects = ['国語', '数学', '英語', '化学', '物理', '地理', 'その他']
    fm.writeString(setSubjectsPath, JSON.stringify(setSubjects))
  } else {
    var setSubjects = JSON.parse(fm.readString(setSubjectsPath))
  }
  ui.removeAllRows()
  var AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
  var title = new UITableRow()
  title.isHeader = true
  var text = title.addText("Recorder")
  text.centerAligned()
  ui.addRow(title)

  if (record[0] == "" || record[1] == "") {
    title = new UITableRow()
    title.addText("[Select subject]").centerAligned()
    ui.addRow(title)
    var count = 0
    for (var i of setSubjects) {
      var sbj = new UITableRow()
      var txt = sbj.addText(i)
      txt.centerAligned()
      txt.widthWeight = 100
      sbj.dismissOnSelect = false
      sbj.height = 44
      sbj.code = `
      ${moveTo}
      ${createScreen}
      record[0] = "${i}"
      createScreen()
      `
      sbj.onSelect = new Function(sbj.code)

      var up = sbj.addButton('▲')
      up.widthWeight = 10
      up.code = `
      ${moveTo}
      ${createScreen}
      var fm = FileManager.local()
      var setSubjectsPath =  fm.documentsDirectory() + '/wultidly/setSubjects'
      var setSubjects = JSON.parse(fm.readString(setSubjectsPath))
      setSubjects = moveTo(setSubjects, ${count}, -1)
      fm.writeString(setSubjectsPath, JSON.stringify(setSubjects))
      createScreen()`
      up.onTap = new Function(up.code)

      var down = sbj.addButton('▼')
      down.widthWeight = 10
      down.code = `
      ${moveTo}
      ${createScreen}
      var fm = FileManager.local()
      var setSubjectsPath =  fm.documentsDirectory() + '/wultidly/setSubjects'
      var setSubjects = JSON.parse(fm.readString(setSubjectsPath))
      setSubjects = moveTo(setSubjects, ${count}, 1)
      fm.writeString(setSubjectsPath, JSON.stringify(setSubjects))
      createScreen()`
      down.onTap = new Function(down.code)
      count++

      if (record[0] == i) { sbj.backgroundColor = Color.yellow() }
      ui.addRow(sbj)
    }
    var sbj = new UITableRow()
    sbj.dismissOnSelect = false
    sbj.height = 44
    sbj.addText('Edit subject').centerAligned()
    sbj.code = `
    ${createScreen}
    ${moveTo}
    var fm = FileManager.local()
    var setSubjectsPath = fm.documentsDirectory() + '/wultidly/setSubjects'
    var setSubjects = JSON.parse(fm.readString(setSubjectsPath))
    var alert = new Alert()
    alert.title = 'Enter the name of new subject'
    alert.message = "If you want to delete an existing subject, enter its name"
    alert.addAction('OK')
    alert.addAction('Cancel')
    alert.addTextField()
    var result = await alert.present()
    if (result == 0 && alert.textFieldValue(0) != '') {
      if (setSubjects.includes(alert.textFieldValue(0))) {
        setSubjects.splice(setSubjects.indexOf(alert.textFieldValue(0)), 1)
        var action = "deleted"
      } else {
        setSubjects.push(alert.textFieldValue(0))
        var action = "added"
      }

      fm.writeString(setSubjectsPath, JSON.stringify(setSubjects))
      createScreen()
      alert = new Alert()
      alert.title = "Subject "+action+" successfully"
      alert.addAction("OK")
      var result = await alert.present()
    } else {
      alert = new Alert()
      alert.title = "Subject addition canceled"
      alert.addAction("OK")
      var result = await alert.present()
    }
    `
    sbj.onSelect = new AsyncFunction(sbj.code)

    ui.addRow(sbj)

    title = new UITableRow()
    title.addText("[Rate your concentration]").centerAligned()
    title.height = 60
    title.dismissOnSelect = false
    ui.addRow(title)
    var rate = new UITableRow()
    for (var i of ['worst', 'bad', 'normal', 'good', 'best']) {
      string = UITableCell.button(i)
      string.centerAligned()
      string.titleColor = Color.brown()
      string.code = `
      ${createScreen}
      record[1] = "${i}"
      createScreen()`
      string.onTap = new Function(string.code)
      rate.addCell(string)
    }
    ui.addRow(rate)
  } else {
    title = new UITableRow()
    title.addText("[Enter the time you studied]").centerAligned()
    ui.addRow(title)
    title = new UITableRow()
    title.addText("Hours studied").centerAligned()
    ui.addRow(title)
    for (var i = 0; i < 5; i += 1) {
      var hours = new UITableRow()
      hours.dismissOnSelect = false
      hours.addText(i + " H").centerAligned()
      hours.addText("")
      hours.code = `
      ${createScreen}
      record[2] = ${i}
      createScreen()`
      hours.onSelect = new Function(hours.code)
      if (record[2] == "" + i) {
        hours.backgroundColor = Color.green()
      }
      ui.addRow(hours)
    }
    title = new UITableRow()
    title.addText("Minutes studied").centerAligned()
    ui.addRow(title)
    for (var i = 0; i < 60; i += 5) {
      var minutes = new UITableRow()
      minutes.dismissOnSelect = false
      minutes.addText(i + " M").centerAligned()
      minutes.addText("")
      minutes.code = `
      ${createScreen}
      record[3] = ${i}
      createScreen()`
      minutes.onSelect = new Function(minutes.code)
      if (record[3] == "" + i) {
        minutes.backgroundColor = Color.purple()
      }
      ui.addRow(minutes)
    }

    var info = new UITableRow()
    info.addText(`Subject : ${record[0]}`).centerAligned()
    info.addText(`Rate : ${record[1]}`).centerAligned()
    info.addText(`Time : ${record[2]} H ${record[3]} M`).centerAligned()
    var confirm = new UITableRow()
    confirm.addText("Submit").centerAligned()
    confirm.backgroundColor = Color.blue()
    confirm.onSelect = () => {  // record info / write json
      var fm = FileManager.local()
      const doc = fm.documentsDirectory() + "/wultidly"
      var today = new Date()
      const fileName = `/${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.json`
      if (fm.fileExists(doc + fileName)) {
        var log = JSON.parse(fm.readString(doc + fileName))
      } else {
        var log = []
      }
      var searchFlag = -1
      var indexCount = 0
      for (var subj of log) {
        if (subj.name == record[0]) {
          searchFlag = indexCount
          break
        }
        indexCount++
      }
      if (searchFlag == -1) {
        log.push({
          name: record[0],
          time: 0,
          raw: 0,
        })
        indexCount = log.length - 1
      }
      var gain = {
        "worst": 0.5,
        "bad": 0.75,
        "normal": 1.0,
        "good": 1.25,
        "best": 1.5
      }
      log[indexCount].name = record[0]
      log[indexCount].time += (60 * record[2] + record[3]) * gain[record[1]]
      log[indexCount].raw += 60 * record[2] + record[3]
      log[indexCount].wultidly = log[indexCount].time / log[indexCount].raw * 100
      log[indexCount].hours = Math.floor(log[indexCount].time / 60)
      log[indexCount].minutes = Math.floor(log[indexCount].time - 60 * log[indexCount].hours)
      fm.writeString(doc + fileName, JSON.stringify(log))
    }
    ui.addRow(info)
    ui.addRow(confirm)
  }
  ui.reload()
}
