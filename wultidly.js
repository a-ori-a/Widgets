// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: stopwatch;
code = `
var canvas = document.querySelector("canvas");
var w = 820;
var h = 820;
canvas.width = w;
canvas.height = h;
var c = canvas.getContext("2d");
c.font = "50px Courier-Bold"
c.lineWidth = 15
c.strokeStyle = "#32de9d"
`
var widget = new ListWidget()
var fm = FileManager.local()
var today = new Date()
const fileName = `/${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.json`
const doc = fm.documentsDirectory() + "/wultidly"
const colors = ["#012345", "#234567", "#456789", "#6789ab", "#89abcd"]
const widgetFamily = config.widgetFamily
const widgetParameter = args.widgetParameter
record = ["", "", 0, 0]

// main code
ui = new UITable()
if (config.runsInApp) {
  createScreen(true)
  await ui.present(0)
}

if (widgetFamily == 'small') {
  if (widgetParameter == 'test') {
  } else if (widgetParameter == 'breakdown') {
    getInfo()
    await createSimpleBreakdown('small')
    widget.presentSmall()
  } else {
    getInfo()
    await createSquareWidget()
    widget.presentSmall()
  }
} else if (widgetFamily == "large") {
  if (widgetParameter == 'test') {

  } else {
    getInfo()
    await createSquareWidget()
    widget.presentLarge()
  }
} else if (widgetFamily == "medium" || widgetFamily == "extraLarge" || config.runsInApp) {
  getInfo()
  await createMediumWidget()
  widget.presentMedium()
}
Script.setWidget(widget)

// useful functions
async function createSquareWidget() {
  widget.backgroundColor = new Color("#fefffd")
  createImage()
  body = widget.addStack()
  body.addSpacer()
  body.addImage(await getImage()).applyFillingContentMode()
  body.addSpacer()
}

async function createMediumWidget() {
  widget.backgroundColor = new Color('#fefffd')
  createImage()
  var container = widget.addStack()
  container.addSpacer()  // left space
  var pie = container.addImage(await getImage())
  container.addSpacer()  // mid space
  var description = container.addStack()
  container.addSpacer()  // right space
  description.addSpacer()
  description.layoutVertically()
  for (var subj of log) {
    var text = description.addText(`${subj.name} : ${subj.hours} H ${subj.minutes} M`)
    text.font = new Font('mono', 10)
    text.textColor = new Color('182929')
  }
  description.addSpacer()
}

function createSimpleBreakdown(size) {
  if (size == 'small') {
    for (var subj of log) {
      var text = `${subj.name} : ${subj.hours} H ${subj.minutes} M`
      widget.addText(text).font = new Font("mono", 13)
    }
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
  c.stroke()
  if ("${title}" != "" && ${end - start > 0.5}) {
    correct = c.measureText('${title}').width
    c.fillStyle = "magenta"
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

function getInfo() {
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

function createImage() {  // generate code to create image
  getInfo()
  now = 0
  for (var subj of log) {
    code += "\n" + circle(400, 2 * Math.PI * now / info.total, 2 * Math.PI * (now + subj.time) / info.total, 'no color', subj.name)
    now += subj.time
  }
  code += `
  c.lineWidth = 30
  ${circle(200, 0, 2 * Math.PI, '#fefffd', "")}
  c.fillStyle="#fefffd"
  c.fill()`

  code += `
  c.fillStyle = "#cdcdcd"
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
  } else if (direction == 1 && from == array.length-1) {
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
  if (!fm.fileExists(setSubjectsPath)) {
    var setSubjects = ['国語', '数学', '英語', '化学', '物理', '地理', 'その他']
    fm.writeString(setSubjectsPath, JSON.stringify(setSubjects))
  } else {
    var setSubjects = JSON.parse(fm.readString(setSubjectsPath))
  }
  console.log(setSubjects)
  ui.removeAllRows()
  var AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
  var title = new UITableRow()
  title.isHeader = true
  title.addText("Recorder").centerAligned()
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
      console.log('tapped')
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

      console.log(count)
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
    console.log(setSubjects)
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
      } else {
        setSubjects.push(alert.textFieldValue(0))
      }

      fm.writeString(setSubjectsPath, JSON.stringify(setSubjects))
      createScreen()
      alert = new Alert()
      alert.title = "Subject added successfully"
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
      console.log(record[0])
      if (searchFlag == -1) {
        log.push({
          name: record[0],
          time: 0,
          raw: 0,
        })
        indexCount = log.length - 1
      }
      console.log(indexCount)
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

Pasteboard.copyString(code)
