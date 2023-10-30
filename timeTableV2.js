// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: calendar-plus;
// declare variables
let list = new ListWidget()
nextRefresh = Date.now() + 1000
list.refreshAfterDate = new Date(nextRefresh)
let time = new Date()// 
time = new Date('2023/10/31 13:00')
let day = time.getDay() // index of today's day
let hmNow = time.getHours()*100 + time.getMinutes()
let mmNow = minutize(hmNow)
let fm = FileManager.local()
const docPath = fm.documentsDirectory()
const dataDir = docPath + '/schedule'
const confPath = dataDir + '/settings'
const timeTablePath = dataDir + '/classes'
const fmt = new DateFormatter()
const base_day = new Date('5 March 2023') // standard day for week judgement
const SatCheck = [6, 13].includes(day)
const maxClass = SatCheck ? 3:6
const url = "https://api.open-meteo.com/v1/jma?latitude=34.3333&longitude=134.05&hourly=weathercode&forecast_days=1"
var weather = new Request(url)
// forecast = await weather.readJSON()
forecast = {"hourly":{"time":["2023-10-30T00:00","2023-10-30T01:00","2023-10-30T02:00","2023-10-30T03:00","2023-10-30T04:00","2023-10-30T05:00","2023-10-30T06:00","2023-10-30T07:00","2023-10-30T08:00","2023-10-30T09:00","2023-10-30T10:00","2023-10-30T11:00","2023-10-30T12:00","2023-10-30T13:00","2023-10-30T14:00","2023-10-30T15:00","2023-10-30T16:00","2023-10-30T17:00","2023-10-30T18:00","2023-10-30T19:00","2023-10-30T20:00","2023-10-30T21:00","2023-10-30T22:00","2023-10-30T23:00"],"weathercode":[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,1,0,0,1,1,1,1]},"generationtime_ms":0.03993511199951172,"longitude":134.0625,"utc_offset_seconds":0,"elevation":12,"hourly_units":{"time":"iso8601","weathercode":"wmo code"},"timezone":"GMT","latitude":34.35,"timezone_abbreviation":"GMT"}

const days = ["", "A月", "A火", "A水", "A木", "A金", "A土", "", "B月", "B火", "B水", "B木", "B金", "B土"]

const colors = {
    background: new Color('#fdf6e3'),
    foreground: new Color('#657b83'),
    subBackground: new Color('#eee8d5'),
    subForeground: new Color('#93a1a1'),
    accent: new Color('#268bd2'),
    green: new Color("#859900"),
    yellow: new Color("#d79921"),
    red: new Color("#dc322f")
}

function centralize(stack) {
    t = stack.addStack()
    t.addSpacer()
    result = t.addStack()
    t.addSpacer()
    return result
}

if (!fm.fileExists(dataDir)) {
  fm.createDirectory(dataDir)
  let defaultTimeTable = [[],["物理","現文","化学","地理","体育","コ英","数①"],
    ["世A","数②","数①","地理","情報","化学","古典"],
    ["コ英","体育","現文","物理","英表","数①","LHR"],
    ["英表","世A","化学","コ英","古典","数①","数②"],
    ["物理","情報","体育","探究","コ英","数②","数①"],
    ["数学","数学","化学","化学","　　","　　","　　"],
    [],["物理","情報","世A","古典","体育","化学","コ英"],
    ["世A","数②","英表","化学","情報","数①","地理"],
    ["数②","体育","地理","現文","物理","コ英","LHR"],
    ["地理","英表","コ英","古典","数②","数①","化学"],
    ["物理","現文","体育","探究","コ英","数①","地理"],
    ["物理","物理","国語","国語","　　","　　","　　"]]
  let defaultConfig = {
    "light": {
      "bg":"#fdf6e3",
      "lineColor":"#eee8d5",
      "defaultText":"#586e75",
      "title":"#2aa198",
      "current":"#d33682",
      "updateTime":"#93a1a1",
      "accent":"#dc322f"
    },
  	"dark": {
  		"bg": "#3c",
  		"lineColor": "#6d6d6daf",
  		"defaultText": "#df",
  		"title": "#7fffd4",
  		"current": "#23abef",
  		"updateTime": "#df",
  		"accent": "#848f72"
  		},
  	"toast": {
  		"bg": "#fffcd4",
  		"lineColor": "#fef787af",
  		"defaultText": "#807e6a",
  		"title": "#d5b77a",
  		"current": "#6e5735",
  		"updateTime": "#8c764a",
  		"accent": "#cdff94"
  		},
  	"custom": {
  		"bg": "#282a36",
  		"lineColor": "#44475ab0",
  		"defaultText": "#f8f8f2",
  		"title": "#bd93f9",
  		"current": "#8be9fd",
  		"updateTime": "#50fa7b",
  		"accent": "#6272a4"
  		},
  	"theme": "light",
  	"sysColumnStart": 0.323,
  	"sysSpacePerColumn": 0.066,
  	"sysLineHeight": 0.03,
  	"sysLineOffset": 0,
  	"bg": "12abef",
  	"lineColor": "12abef"
  }
  fm.writeString(timeTablePath, JSON.stringify(defaultTimeTable))
  console.log(confPath)
  fm.writeString(confPath, JSON.stringify(defaultConfig))
}

const Schedule = JSON.parse(fm.readString(timeTablePath))

const settings = JSON.parse(fm.readString(confPath))
const timeLength = [6,13].includes(day) ?
  [' ~ 8:40',
  '8:50 ~ 9:35',
  '9:45 ~ 10:30',
  '10:40 ~ 11:25',
  '11:35 ~ 12:20',
  '12:20 ~ '
  ] :
  [' ~ 8:40',
  '8:50 ~ 9:35',
  '9:45 ~ 10:30',
  '10:40 ~ 11:25',
  '11:50 ~ 12:35',
  '13:00 ~ 13:45',
  '13:55 ~ 14:40',
  '14:50 ~ 15:35',
  '15:45 ~ '
  ]
settings.theme = settings[settings.theme]

let TimeSplit = SatCheck ? [850, 945, 1040, 1135, 1220] : [850, 945, 1040, 1150, 1300, 1355, 1450, 1545]  // reversed timestamp of classes
let TimeSplitMinutes = SatCheck ? [530, 585, 640, 695, 750] : [530,585,640,710,780,835,890,945]

if (hmNow < 850) {
  var classIndex = -1
} else {
  for (var i of TimeSplit.slice().reverse()) {
    if (hmNow >= i) {
      var classIndex = TimeSplit.indexOf(i)  // number of classes before the current class
      break
    }
  }
}

// basic settings
fmt.dateFormat = 'M/d (eee) HH:mm:ss'

if (parseInt((time.getTime() - base_day) / 86400000 % 14) > 6){
  day += 7
}

const data = {
  'isAfterSchool' : classIndex > maxClass,
  'isBeforeSchool' : hmNow < 850,
  'isSunday' : [0, 7].includes(day),
  'week' : [1,2,3,4,5,6,7].includes(day) ? 'A':'B', // if day < 6, set A else B (when week is B, day ranges from 7~13) (Sunday is0 or 7, and we should reagard Sunday as next week to see Monday's class)
  'now' : hmNow < 850 ? '始業前' : hmNow >= TimeSplit[maxClass+1] ? '放課後' : Schedule[day][classIndex],
  'next' : classIndex == maxClass ? '放課後' : classIndex > maxClass ? /*'Today\'s class has ended''今日の授業は終了しました'*/'' : Schedule[day][classIndex + 1],
  'period' : timeLength[classIndex+1],
  'nextPeriod' : timeLength[classIndex+2],
  'isRestTime' : [2,3].includes(classIndex) ? 45 < mmNow - TimeSplitMinutes[classIndex] && mmNow - TimeSplitMinutes[classIndex] < 70 : 45 < mmNow - TimeSplitMinutes[classIndex] && mmNow - TimeSplitMinutes[classIndex] < 55,
}
// modify data object using its property
{
  data.isAtSchool = !(data.isAfterSchool || data.isBeforeSchool)
  data.minutesLeft = data.isRestTime ? TimeSplitMinutes[classIndex+1] - mmNow : TimeSplitMinutes[classIndex] - mmNow + 45
  if (classIndex > maxClass || data.isSunday) {
    day = (day+1)%7
  }
}

// define functions
function minutize(n) {
  n = String(n)
  return 60 * (n.length == 3 ? n[0]:n.slice(0,2)) + Number(n.slice(-2))
}

async function registerTimeTable() {
  let alert = new Alert()
  alert.title = "時間割をコピーしていますか"
  alert.addAction("Yes")
  alert.addAction("No")
  var isNotCopied = await alert.presentAlert()
  if (isNotCopied) {
    Safari.open("https://a-ori-a.github.io/class-schedule-editor/")
  }
  alert = new Alert()
  alert.title = "コピーした時間割を下にペーストしてください"
  alert.addTextField()
  alert.addAction('OK')
  await alert.presentAlert()
  let newTimeTable = alert.textFieldValue(0)
  let validFlag = true
  try {
    JSON.parse(newTimeTable)
  } catch (e) {
    validFlag = false
    alert = new Alert()
    alert.title = 'Error'
    alert.message = 'Invalid time table'
    alert.addAction('OK')
    alert.presentAlert()
  }
  if (validFlag) {
    fm.writeString(timeTablePath, newTimeTable)
    alert = new Alert()
    alert.message = 'New timetable registered'
    alert.addAction('OK')
    alert.presentAlert()
  }
}

async function changeConfig() {
  let newConfig = JSON.parse(fm.readString(confPath)) // this is old config which gonna be a new config
  let alert = new Alert()
  alert.title = '変更する設定を選択してください'
  let elements = Object.keys(settings)
  elements = ['カラーテーマの変更', 'カスタムテーマの設定', '横線の位置の変更']
  for (let i of elements) {
    alert.addAction(i)
  }
  let configToChange = await alert.presentAlert()
  switch (configToChange) {
    case 0: // color scheme
      alert = new Alert()
      alert.title = 'どのカラーテーマにしますか(default: custom)'
      for (let i of ['light', 'dark', 'toast', 'custom']) {
        alert.addAction(i)
      }
      let newTheme = await alert.present()
      newConfig.theme = ['light', 'dark', 'toast', 'custom'][newTheme]
      alert = new Alert()
      alert.title = 'カラーテーマが'+newConfig.theme+'に変更されました'
      alert.addCancelAction('OK')
      alert.presentAlert()
      break
    case 1:
    	alert = new Alert()
      for (let i of ['背景色','線の色','教科の文字の色', '「時間割」の色', '現在の授業の色', '更新時刻、曜日の色', '小さめのウィジェットでのアクセントカラー']) {
        alert.addAction(i)
      }
      alert.title = '色を変更する項目を選択してください'
      alert.addCancelAction('Cancel')
      let newProperty = await alert.presentAlert()
      if (newProperty != -1) {
        alert = new Alert()
        alert.title = '色のカラーコードを入力して下さい。#はあってもなくても構いません。カラーコードが正しいかの確認は取っていないのでうまく行かなかったら入力し直して見て下さい。'
        alert.addTextField()
        alert.addCancelAction('Cancel')
        alert.addAction('OK')
        let newColor = await alert.presentAlert()
        newConfig.custom[(['bg','lineColor','defaultText', 'title', 'current', 'updateTime', 'accent'][newProperty])] = alert.textFieldValue(0)
      }
    	break
    case 2:
      console.log('horizontal line')
      break
  }
  fm.writeString(confPath ,JSON.stringify(newConfig))
}

async function showAvailability() {
  let alert = new Alert()
  alert.title = '対応状況'
  alert.message = '基本的に無印のiPadのみに対応しています。iPad ProやiPad Airなどでは画面サイズが違うため表示が崩れる可能性が高いです。今後もProやAirに対応する予定はないので適宜追加して下さい。'
  alert.addAction('OK')
  await alert.presentAlert()
}

weatherCodes = {
  "0": "Sunny",
  "1": "Sunny",
  "2": "Cloudy",
  "3": "Cloudy",
  "45": "Foggy",
  "48": "Foggy",
  "51": "Drizzle",
  "53": "Drizzle",
  "55": "Drizzle",
  "56": "Drizzle",
  "57": "Drizzle",
  "61": "Rain",
  "63": "Rain",
  "65": "Rain",
  "66": "Rain",
  "67": "Rain",
  "71": "Snow",
  "73": "Snow",
  "75": "Snow",
  "77": "Snow",
  "80": "Showers",
  "81": "Showers",
  "82": "Showers",
  "85": "Snow Showers",
  "86": "Snow Showers",
  "95": "Thunderstorm",
  "96": "Thunderstorm with Hail",
  "99": "Thunderstorm with Hail",
}

list.backgroundColor = colors.background
body = list.addStack()
left = body.addStack()
right = body.addStack()
left.layoutVertically()
right.layoutVertically()
right.setPadding(0, 15, 0, 0)  // top leading bottom trailing
left.setPadding(0, 17, 0, 0)
title = left.addStack()
battery = left.addStack()
dayProgress = left.addStack()
left.addSpacer(7)
//volume = left.addStack()
table = left.addStack()
classInfo = right.addStack()
classInfo.spacing = 5
weatherInfo = right.addStack()
dayCount = right.addStack()
right.spacing = 10
left.spacing = 3
side = 90
body.size = new Size(320, 320)
left.size = new Size(200, 320)
right.size = new Size(120, 320)

// title.size = new Size(180, 60)
battery.size = new Size(180, 12)
dayProgress.size = new Size(180, 12)
//volume.size = new Size(180, 12)
table.size = new Size(180, 244)
table.layoutVertically()
table.spacing = 8
classInfo.size = new Size(side, side)
weatherInfo.size = new Size(side, side)
weatherInfo.spacing = 10
dayCount.size = new Size(side, side)
for (var i of [title, battery, dayProgress, classInfo, table, weatherInfo, dayCount]) {
    i.cornerRadius = 10
    i.backgroundColor = colors.subBackground
    i.layoutVertically()
}
battery.backgroundColor = colors.subBackground
classInfo.backgroundColor = colors.subBackground
table.backgroundColor = colors.subBackground
weatherInfo.backgroundColor = colors.subBackground
dayCount.backgroundColor = colors.subBackground

g = new LinearGradient()
g.colors = [colors.green, colors.green, colors.subBackground, colors.subBackground]
g.locations = [0, Device.batteryLevel(), Device.batteryLevel(), 1]
g.startPoint = new Point(0, 1)
g.endPoint = new Point(1, 0)
battery.backgroundGradient = g
g = new LinearGradient()
g.colors = [colors.yellow, colors.yellow, colors.subBackground, colors.subBackground]
g.locations = [0, (time.getHours()*3600+60*time.getMinutes()+time.getSeconds())/ (3600*24), (time.getHours()*3600+60*time.getMinutes()+time.getSeconds())/ (3600*24), 1]
g.startPoint = new Point(0, 1)
g.endPoint = new Point(1, 0)
dayProgress.backgroundGradient= g
// log((time.getHours()*3600+60*time.getMinutes()+time.getSeconds())/ (3600*24))

text = centralize(table).addText("Week "+(data.isSunday ? data.week == "A"? "B":"A" :data.week))
text.textColor = colors.foreground
text.font = new Font("Futura", 13)

for (var i of Schedule[day]) {
    subject = table.addStack()
    subject.addSpacer()
    text = subject.addText(i)
    subject.addSpacer()
    if (i == data.now) {
        text.textColor = colors.accent
    } else if (classIndex > maxClass || data.isSunday) {
        text.textColor = colors.subForeground
    } else {
        text.textColor = colors.foreground
    }
}


classText = centralize(classInfo).addText("Next Class")
classText.textColor = colors.foreground
classText.font = new Font("Arial", 10)
if (data.next !== undefined) {
    classText = centralize(classInfo).addText(data.next)
	classText.textColor = colors.foreground
	classText.font = new Font("Arial Bold", 15)
    if (data.nextPeriod !== undefined) {
        classText = centralize(classInfo).addText(data.nextPeriod)
    	classText.textColor = colors.foreground
    	classText.font = new Font("Arial", 10)
	}
}

// title.addText("BAT : "+Math.floor(Device.batteryLevel()*100)+"%")
weatherText = centralize(weatherInfo).addText("Weather")
weatherText.textColor = colors.foreground
weatherText.font = new Font("Futura", 10)
weatherText = centralize(weatherInfo).addText(weatherCodes[forecast.hourly.weathercode[time.getHours()]])
weatherText.textColor = colors.foreground
weatherText.font = new Font("Arial", 15)


list.presentLarge()
