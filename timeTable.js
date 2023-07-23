// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: calendar-times;
// declare variables
let list = new ListWidget()
nextRefresh = Date.now() + 1000
list.refreshAfterDate = new Date(nextRefresh)
let time = new Date()// 
// time = new Date('2023/6/19 12:00')
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
const gradient = new LinearGradient()
let padding = 2  // change this value to gain/reduce padding
const days = ["", "A月", "A火", "A水", "A木", "A金", "A土", "", "B月", "B火", "B水", "B木", "B金", "B土"]

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
  		"bg": "#fc",
  		"lineColor": "#8a91991f",
  		"defaultText": "#5c6166",
  		"title": "#4cbf99",
  		"current": "#55b4d4",
  		"updateTime": "#787b80",
  		"accent": "#f2ae49"
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
  	"theme": "custom",
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
  'next' : classIndex == maxClass ? '放課後' : classIndex > maxClass ? /*'Today\'s class has ended'*/'今日の授業は終了しました' : Schedule[day][classIndex + 1],
  'period' : timeLength[classIndex+1],
  'nextPeriod' : timeLength[classIndex+2],
  'isRestTime' : [2,3].includes(classIndex) ? 45 < mmNow - TimeSplitMinutes[classIndex] && mmNow - TimeSplitMinutes[classIndex] < 70 : 45 < mmNow - TimeSplitMinutes[classIndex] && mmNow - TimeSplitMinutes[classIndex] < 55,
}
// modify data object using its property
{
  data.isAtSchool = !(data.isAfterSchool || data.isBeforeSchool)
  data.minutesLeft = data.isRestTime ? TimeSplitMinutes[classIndex+1] - mmNow : TimeSplitMinutes[classIndex] - mmNow + 45
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

if (config.runsInApp) { // open settings
  let alert = new Alert()
  alert.title = '何をしたいですか？'
  alert.addAction("時間割の登録")
  alert.addAction("設定の変更")
  alert.addAction("対応状況について")
  alert.addCancelAction('Cancel')
  var userChoice = await alert.presentAlert()
  switch (userChoice) {
    case 0:
      registerTimeTable()
      break
    case 1:
      changeConfig()
      break
    case 2:
      showAvailability()
      break
  }
}

// ---- main script ----------- 
if (config.widgetFamily == 'extraLarge') {
  // extraLarge
 	list.backgroundColor = new Color(settings.theme.bg)
	if (data.isAfterSchool || data.isSunday) {
	} else {
		let start = new Color(settings.theme.bg)
		let line = new Color(settings.theme.lineColor)
    if (data.isRestTime) {
      settings.sysLineHeight = 0.005
      settings.sysLineOffset = 0.031
    } else if (data.isBeforeSchool) {
      settings.sysLineHeight = 0.005
      settings.sysLineOffset = 0.03
    }
		let turnPoints = [0, settings.sysColumnStart + (classIndex*settings.sysSpacePerColumn)-settings.sysLineHeight + settings.sysLineOffset, settings.sysColumnStart + (classIndex*settings.sysSpacePerColumn)+settings.sysLineHeight + settings.sysLineOffset, 1]
		gradient.colors = [start, start, line, line, start, start]
		gradient.locations = [turnPoints[0], turnPoints[1], turnPoints[1], turnPoints[2], turnPoints[2], turnPoints[3]]
    list.backgroundGradient = gradient
	}
  list.addSpacer(10)
  // title
  let a = list.addText(text='時間割')
  a.centerAlignText()
  a.font = new Font('Kailasa-Bold', 24)
  a.textColor = new Color(settings.theme.title)
  list.addSpacer(10)
  
  let main = list.addStack()
  main.topAlignContent()
  main.addSpacer()
  for (var i = 0; i < 14; i++) {
    if (i % 7 != 0) {
      var thisLine = main.addStack()
      thisLine.layoutVertically()
      thisLine.topAlignContent()
     thisLine.setPadding(3, padding, 3, padding)
      thisLine.cornerRadius = 7
      if (i == day) {
        thisLine.backgroundColor = new Color(settings.theme.lineColor) // today's line
        var  todayFlag = true
      }
      var currentItem = thisLine.addText(days[i])
      currentItem.centerAlignText()
      currentItem.textColor = new Color(settings.theme.updateTime)
      currentItem.font = new Font('Kailasa-Bold', 16)
      thisLine.addSpacer(8)
      for (var j = 0; j < Schedule[i].length; j++) {
        // center text (in a stack)
        currentItem = thisLine.addText(Schedule[i][j])  // add subject
        currentItem.rightAlignText()
        currentItem.font = new Font('Kailasa', 16)
        if (todayFlag && j == classIndex && j <= maxClass) { // when it is processing the current class (change text color)
          if (!data.isRestTime) {
            currentItem.font = new Font('Kailasa-Bold', 16)
            currentItem.textColor = new Color(settings.theme.current)
          } else {
            currentItem.textColor = new Color(settings.theme.defaultText)
          }
          todayFlag = false
        } else {
          currentItem.textColor = new Color(settings.theme.defaultText)  // default subject text color
        }
      }
    }
		main.addSpacer()
  }
  
  // show class indicators unless it is not Sunday (when it's Sunday, show 'have a nice weekend')
	if (!data.isSunday) {
    list.addSpacer(8)
    // class indicator label stack
    let classLabels = list.addStack()
    var tmp = classLabels.addText('Current Class')
    tmp.textColor = new Color(settings.theme.current)
    tmp.font = new Font('Kailasa-Bold', 13)
    classLabels.addSpacer()
    tmp = classLabels.addText('Next Class')
    tmp.textColor = new Color(settings.theme.current)
    tmp.font = new Font('Kailasa-Bold', 13)
    
    list.addSpacer(5)
    let classNames = list.addStack()
    classNames.layoutHorizontally()
    if (classIndex >= 7) { // index out of range
      tmp = classNames.addText("放課後")
    } else if (!data.isRestTime) { // show current class unless it's break ------- modify here
      tmp = classNames.addText(data.now + ' (' + data.period + ')')
    } else if (data.isRestTime) {
      tmp = classNames.addText('休み時間')
    }
    tmp.textColor = new Color(settings.theme.current)
    tmp.font = new Font('kailasa-Bold', 13)
    
    classNames.addSpacer() // always put spacer
    tmp = classNames.addText((!data.isAfterSchool ? '(' + data.nextPeriod + ')':'') + data.next) // show next class unless it's 7th class
    tmp.textColor = new Color(settings.theme.current)
    tmp.font = new Font('Kailasa-Bold', 13)
  } else { // show have a nice weeknd
    tmp = list.addText('Have a nice weekend')
    tmp.font = new Font('Kailasa-Bold', 20)
    tmp.textColor = new Color(settings.theme.current)
    tmp.centerAlignText()
  }  
  var lastUpdate = list.addText('Last updated : ' + fmt.string(time))
  lastUpdate.textColor = new Color(settings.theme.updateTime)
  lastUpdate.rightAlignText()
  lastUpdate.font = new Font('Kailasa-Bold', 10)
}
else if (config.widgetFamily == 'small')
{
  // small widget (146 x 146)
  list.backgroundColor = new Color(settings.theme.bg)
  let information = list.addStack()
  let current = information.addStack() // left side
	current = current.addStack()
  let smallRight = information.addStack() // right stack
  let next = smallRight.addStack() // top right
  let under = smallRight.addStack() // bottom right
  smallRight.layoutVertically()
  current.centerAlignContent()
  next.centerAlignContent()
	under.centerAlignContent()
  current.size = new Size(53,146)
  current.backgroundColor = new Color(settings.theme.title)
  next.backgroundColor = new Color(settings.theme.bg)
  under.backgroundColor = new Color(settings.theme.accent)
  smallRight.size = new Size(93, 146)
  under.size = new Size(93, 46)
  next.size = new Size(93,100)
	if (data.isSunday) {
    tmp = current.addText('Sunday')
    tmp.font = new Font('Kailasa-Bold', 13)
    tmp.textColor = new Color(settings.theme.updateTime)
    tmp = next.addText('Have a nice weekend')
    tmp.font = new Font('Kailasa_Bold', 13)
    tmp.textColor = new Color(settings.theme.updateTime)
    tmp.centerAlignText()
  } else {
    // left side (current class indicator)
    tmp = current.addText(data.now + '\n\n' + data.period.split(' ~ ').join('\n~\n'))
    tmp.font = new Font('Kailasa-Bold', 13)
    tmp.centerAlignText()
    tmp.textColor = new Color(settings.theme.bg)
    // top-right (next class indicator)
  	tmp = next.addText(data.next + (typeof data.nextPeriod != 'undefined' ? '\n\n' + data.nextPeriod.split(' ~ ').join(' ~ ') : ''))
    tmp.centerAlignText()
    tmp.font = new Font('Kailasa-Bold', 13)
    tmp.textColor = new Color(settings.theme.updateTime)
    if (data.isAtSchool) {
      tmp = under.addText(data.minutesLeft + '\nminutes left')
	    tmp.centerAlignText()
      tmp.font = new Font('Kailasa-Bold', 13)
  	  tmp.textColor = new Color(settings.theme.updateTime)
  }
    }
} 
else if (config.widgetFamily == 'large')
{ // large widget here
  // modify startPoint of the horizontal line
//  padding = 8
	settings.sysColumnStart = 0.32
  settings.sysSpacePerColumn = 0.0605
  settings.sysLineHeight = 0.029
  if (data.isAfterSchool || data.isSunday) {
 	 list.backgroundColor = new Color(settings.theme.bg)
	} else {
		let start = new Color(settings.theme.bg)
		let line = new Color(settings.theme.lineColor)
    if (data.isRestTime) {
      settings.sysLineHeight = 0.003
      settings.sysLineOffset = 0.028
    } else if (data.isBeforeSchool) {
      settings.sysLineHeight = 0.005
      settings.sysLineOffset = 0.025
    }
		let turnPoints = [0, settings.sysColumnStart + (classIndex*settings.sysSpacePerColumn)-settings.sysLineHeight + settings.sysLineOffset, settings.sysColumnStart + (classIndex*settings.sysSpacePerColumn)+settings.sysLineHeight + settings.sysLineOffset, 1]
		gradient.colors = [start, start, line, line, start, start]
		gradient.locations = [turnPoints[0], turnPoints[1], turnPoints[1], turnPoints[2], turnPoints[2], turnPoints[3]]
    list.backgroundGradient = gradient
	}
  
  list.backgroundColor = new Color(settings.theme.bg)
  list.addSpacer(15)
  let title = list.addText('時間割')
  list.addSpacer(7)
  title.centerAlignText()
  title.font = new Font('Kailasa-Bold', 24)
  title.textColor = new Color(settings.theme.title)
  if (data.week == 'A') {
    var startFrom = 0
  } else if (data.week = 'B') {
    var startFrom = 7
  }
  let main = list.addStack()
  main.addSpacer()
  for (var i = startFrom;i<startFrom+7;i++) { // week
    if (i % 7 != 0) { // when it is not Sunday
      var thisLine = main.addStack()
      thisLine.layoutVertically()
      thisLine.topAlignContent()
     thisLine.setPadding(3, padding, 3, padding) // should I use settings.padding? I don't know : I don't know
			thisLine.cornerRadius = 7
      if (i == day) {
        thisLine.backgroundColor = new Color(settings.theme.lineColor) // highlight today's line
				var todayFlag = true
      }
      var currentItem = thisLine.addText(days[i]) // day indicato
			currentItem.font = new Font('Kailasa-Bold', 15)
      currentItem.textColor = new Color(settings.theme.updateTime)
      thisLine.addSpacer(3)
      for (var j = 0; j < Schedule[i].length; j++) {
        currentItem = thisLine.addText(Schedule[i][j]) // add subject
				currentItem.centerAlignText()
        currentItem.font = new Font('Kailasa', 15)
        if (todayFlag && j == classIndex) {
          if (!data.isRestTime) {
            currentItem.font = new Font('Kailasa-Bold', 15)
            currentItem.textColor = new Color(settings.theme.current)
          } else {
            currentItem.textColor = new Color(settings.theme.defaultText)
          }
          todayFlag = false
        } else {
          currentItem.textColor = new Color(settings.theme.defaultText)
        }
      }
    }
    main.addSpacer()
  }
  // all subject filled
	// show horizontal line
  if (!data.isSunday) {
    list.addSpacer()
    // class indicator label stack
    let classLabels = list.addStack()
    var tmp = classLabels.addText('Current Class')
    tmp.textColor = new Color(settings.theme.current)
    tmp.font = new Font('Kailasa-Bold', 13)
    classLabels.addSpacer()
    tmp = classLabels.addText('Next Class')
    tmp.textColor = new Color(settings.theme.current)
    tmp.font = new Font('Kailasa-Bold', 13)
    
    list.addSpacer(5)
    let classNames = list.addStack()
    classNames.layoutHorizontally()
    if (classIndex >= 7) { // index out of range
      tmp = classNames.addText("放課後")
    } else if (!data.isRestTime) { // show current class unless it's break ------- modify here
      tmp = classNames.addText(data.now + ' (' + data.period + ')')
    } else if (data.isRestTime) {
      tmp = classNames.addText('休み時間')
    }
    tmp.textColor = new Color(settings.theme.current)
    tmp.font = new Font('kailasa-Bold', 13)
    
    classNames.addSpacer() // always put spacer
    tmp = classNames.addText((!data.isAfterSchool ? '(' + data.nextPeriod + ')':'') + data.next) // show next class unless it's 7th class
    tmp.textColor = new Color(settings.theme.current)
    tmp.font = new Font('Kailasa-Bold', 13)
  } else { // show have a nice weeknd
		list.addSpacer()
    tmp = list.addText('Have a nice weekend')
    tmp.font = new Font('Kailasa-Bold', 17)
    tmp.textColor = new Color(settings.theme.current)
    tmp.centerAlignText()
  }
}
else if (config.widgetFamily == 'medium')
{
  list.backgroundColor = new Color(settings.theme.accent)
  let main =list.addStack()
  let today = main.addStack()
  today.backgroundColor = new Color(settings.theme.lineColor)
  today.layoutVertically()
  today.size = new Size(70,146)
  today.addSpacer(10)
  if (data.isSunday) {
    day += 1
  }
  for (var i=0;i<Schedule[day].length;i++) {
    let tmpStack = today.addStack()
    tmpStack.addSpacer()
    let subject = tmpStack.addText(Schedule[day][i]+'    ')
    if (i == classIndex && !data.isSunday) {
      subject.textColor = new Color(settings.theme.current)
    } else { 
    	subject.textColor = new Color(settings.theme.defaultText)
    }
    subject.leftAlignText()
    subject.font = new Font('Kailasa-Bold', 14)
  }
  today.addSpacer()
  let rightSide = main.addStack()
  rightSide.layoutVertically()
  rightSide.centerAlignContent()
  let now = rightSide.addStack()
  now.backgroundColor = new Color(settings.theme.bg)
  now.size = new Size(220,73)
  now.layoutVertically()
  now = now.addStack()
  now.addSpacer()
  if (data.isSunday) {
    tmp = now.addText('Have a nice weekend')
  } else {
  	tmp = now.addText(data.now + '\n' + data.period)
  }
  now.addSpacer()
  tmp.centerAlignText()
  tmp.textColor = new Color(settings.theme.current)
  tmp.font = new Font('Kailasa-Bold', 16)
  next = rightSide.addStack()
  next.backgroundColor = new Color(settings.theme.updateTime)
  next.size = new Size(220, 73)
  next.layoutVertically()
  next = next.addStack()
  next.addSpacer()
  if (data.isSunday) {
    tmp = next.addText('<-- get ready for tomorrow')
  } else if (data.isAfterSchool) {
    tmp = next.addText('今日の授業は終了しました')
  } else { 
    tmp = next.addText(data.next + '\n' + data.nextPeriod)
  }
  next.addSpacer()
  tmp.centerAlignText()
  tmp.textColor = new Color(settings.theme.bg)
  tmp.font = new Font('Kailasa-Bold', 16)
}
