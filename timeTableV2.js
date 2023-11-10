// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: calendar-plus;
var widget = new ListWidget()
var fm = FileManager.local()
const schedulePATH = fm.documentsDirectory()+"/schedule/classes"
var today = new Date()
const base_day = new Date('5 March 2023') // standard day for week judgement
// today = new Date('2023/11/11 18:00')
var classInfo
var fore15 = [], fore12 = [], fore15b = [], fore12b = [], fore10 = [],sfore15 = [],sfore15b = [], sfore12 = [], sfore10b = [],sfore10 = [], em15 = [], futura = []
// (maybe) better solution?
var normal = [], em = [],ems = [], bold = [], light = [], small = [], bolds = [], lights = []

var stackBG = [], stackSubBG = []

// let r = new Request("https://api.waifu.pics/sfw/waifu")
// r = new Request((await r.loadJSON()).url)
let r = new Request("https://picsum.photos/150/370")
// let pic = await Photos.latestScreenshot()
// pic = await r.loadImage()

const info = {
    "isSunday": today.getDay() == 0,
    "isSaturday": today.getDay() == 6,
    "day": today.getDay(),
    "date": today.getDate(),
    "month": today.getMonth()+1,
    "dateString": (today.getMonth()+1)+"/"+today.getDate(),
    "timeString": String(today.getHours()).padStart(2, "0")+String(today.getMinutes()).padStart(2, "0"),
    "hours": today.getHours(),
    "minutes": today.getMinutes(),
    "maxClass": today.getDay() == 6 ? 4:7,
    "week": parseInt((today.getTime() - base_day) / 86400000 % 14) > 6 ? "B": "A"
}
var dayNumber = info.week == "A" ? info.day:info.day+7
const startTime = info.isSaturday ? ["0850", "0945", "1040", "1135", "1220"] : ["0850", "0945", "1040", "1150", "1300", "1355", "1450", "1535"]
const timezone = info.isSaturday ? [' ~ 8:40','8:50 ~ 9:35','9:45 ~ 10:30','10:40 ~ 11:25','11:35 ~ 12:20','12:20 ~ '] :[' ~ 8:40','8:50 ~ 9:35','9:45 ~ 10:30','10:40 ~ 11:25','11:50 ~ 12:35','13:00 ~ 13:45','13:55 ~ 14:40','14:50 ~ 15:35','15:45 ~ ']

let timeTable = [
["", "", "", "", "", "", ""],
["物理","現文","化学","地理","体育","コ英","数①"],
["世A","数②","数①","地理","情報","化学","古典"],
["コ英","体育","現文","物理","英表","数①","LHR"],
["英表","世A","化学","コ英","古典","数①","数②"],
["物理","情報","体育","探究","コ英","数②","数①"],
["数学","数学","化学","化学","  ","  ","  "],
["", "", "", "", "", "", ""],
["物理","情報","世A","古典","体育","化学","コ英"],
["世A","数②","英表","化学","情報","数①","地理"],
["数②","体育","地理","現文","物理","コ英","LHR"],
["地理","英表","コ英","古典","数②","数①","化学"],
["物理","現文","体育","探究","コ英","数①","地理"],
["物理","物理","国語","国語","  ","  ","  "]]
timeTable = JSON.parse(fm.readString(schedulePATH))
let colors = {
    background: new Color('#fbf1c7'),
    foreground: new Color('#504945'),
    subBackground: new Color('#f2e5bc'),
    subForeground: new Color('#504945'),
    red: new Color('#9d0006'),
    green: new Color("#79740e"),
    yellow: new Color("#b57614"),
    blue: new Color("#076678"),
    purple: new Color("#8f3f71"),
    aqua: new Color("#427b58"),
    orange: new Color('#af3a03'),
    gray: new Color('#928374')
}

colors = {
    background: new Color('#fdf6e3'),
    foreground: new Color('#657b83'),
    subBackground: new Color('#eee8d5'),
    subForeground: new Color('#93a1a1'),
    blue: new Color('#268bd2'),
    green: new Color("#859900"),
    yellow: new Color("#d79921"),
    red: new Color("#dc322f")
}
function convertDay(day) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]
}
function getClasses(dayNumber) {
  return timeTable[dayNumber%14]
}
function toMinutes(string) {
    return Number(string.slice(0,2))*60+Number(string.slice(2,4))
}
function isBetween(num, min, max) {
    return min <= num && num <= max
}
function getClassIndex() {
    let counter = 0
    while (toMinutes(startTime[counter]) <= toMinutes(info.timeString)) {
        counter ++
        if (counter > info.maxClass) {5
            break
        }
    }
    return counter--
}
function centralize(stack) {
    t = stack.addStack()
    t.addSpacer()
    result = t.addStack()
    t.addSpacer()
    return result
}

function applyFont(group, font, size, color) {
    if (font == "default") {
        for (var i of group) {
            i.font = Font.regularMonospacedSystemFont(size)
            i.textColor = color
            i.minimumScaleFactor = 0.1
            i.lineLimit = 1
        }
    } else if (font == "bold") {
        for (var i of group) {
            i.font = Font.boldMonospacedSystemFont(size)
            i.textColor = color
            i.minimumScaleFactor = 0.1
            i.lineLimit = 1
        }
    } else {
        for (var i of group) {
            i.font = new Font(font, size)
            i.textColor = color
            i.minimumScaleFactor = 0.1
            i.lineLimit = 1
        }
    }
}
function applyBG(group, color) {
    for (var i of group) {
        i.backgroundColor =  color
    }
}
function findNext(subject = undefined) {
    if (subject === undefined) {
        subject = classInfo.now
    }
    let tmp = dayNumber
    while (true) {
        tmp += 1
        if (timeTable[tmp%14].includes(subject)) {
            break
        } else if (tmp>=dayNumber+14) {
            return [0,0]
        }
    }
    let point = new Date()
    point.setDate(point.getDate() + (tmp-dayNumber))
    return [tmp-dayNumber, point, timeTable[tmp%14].indexOf(subject)+1]
}
function counters(num) {
    if (0+num == 1) {
        return num + "st"
    } else if (0+num == 2) {
        return num + "nd"
    } else if (0+num == 3) {
        return num + "rd"
    } else {
        return num + "th"
    }
}
function print(string) {
    let a = new Alert()
    a.message = ""+string
    a.present()
}

if (!info.isSunday) {
    let classIndex = getClassIndex()
    let isBeforeSchool = classIndex == 0
    let isAfterSchool = classIndex == info.maxClass+1
    let isLastClass = classIndex == info.maxClass
    var classInfo = {
        "classes": getClasses(dayNumber),
        "classIndex": classIndex,
        "isBeforeSchool":  isBeforeSchool,
        "isAfterSchool": isAfterSchool,
        "now": isBeforeSchool ? "始業前": isAfterSchool ? "放課後" : timeTable[dayNumber][classIndex-1],
        "next": isAfterSchool ? "" : isLastClass ? "放課後" : timeTable[dayNumber][classIndex],
        "zone": timezone[classIndex],
        "nextZone": isAfterSchool ? timezone[classIndex] : timezone[classIndex+1]
    }
} else {
    var classInfo = {
        "classes": [],
        "classIndex": "",
        "isBeforeSchool": false,
        "isAfterSchool": true,
        "now": "",
        "next": "",
        "zone": "",
        "nextZone": "",
    }
}

components = {
    "now" : (stack) => {
        sfore10.push(centralize(stack).addText("Now"))
        fore15b.push(centralize(stack).addText(classInfo.now))
        sfore10.push(centralize(stack).addText(classInfo.zone))
    },
    "next" : (stack) => {
        sfore10.push(centralize(stack).addText("Next"))
        fore15b.push(centralize(stack).addText(classInfo.next))
        sfore10.push(centralize(stack).addText(classInfo.nextZone))
    },
    "table" : (stack) => {
        if (info.isSunday) {
            for (var i of getClasses(dayNumber+1)) {
                fore15.push(centralize(stack).addText(i))
            }
        } else if (classInfo.isAfterSchool && stack.size.width >= 130) {
            var line = stack.addStack()
            ems.push(line.addText("Today"))
            line.addSpacer()
            ems.push(line.addText(info.isSaturday? "Monday":"Tomorrow"))
            stack.addSpacer(8)
            for (var i=0;i<7;i++) {
                var line = stack.addStack()
                light.push(line.addText(classInfo.classes[i]))
                line.addSpacer()
                light.push(line.addText(getClasses(dayNumber + 1 + Number(info.isSaturday))[i]))
            }
            for (var i=0; i<7;i++) {
                try {
                    lights.push(centralize(leftClass).addText(classInfo.classes[i]))
                } catch {}
                try {
                    lights.push(centralize(rightClass).addText(getClasses(dayNumber+1+Number(info.isSaturday))[i]))
                } catch {}
            }
        }else if (classInfo.isAfterSchool) {
            ems.push(centralize(stack).addText(info.isSaturday?"Monday":"Tomorrow"))
            stack.addSpacer(8)
            for (var i=0;i<7;i++) {
                light.push(centralize(stack).addText(getClasses(dayNumber+1+Number(info.isSaturday))[i]))
            }
        }else {  // not Sunday
            futura.push(centralize(stack).addText("Week "+info.week))
            stack.addSpacer(3)
            let counter = 0
            for (var i of classInfo.classes) {
                if (i == classInfo.now) {
                    em15.push(centralize(stack).addText(i))
                } else {
                    fore15.push(centralize(stack).addText(i))
                }
            }
        }
    },
    "battery": (stack) => {
        let gradient = new LinearGradient()
        gradient.colors = [colors.green, colors.green, colors.subBackground, colors.subBackground]
        gradient.locations = [0, Device.batteryLevel(), Device.batteryLevel(), 1]
        gradient.startPoint = new Point(0, 0)
        gradient.endPoint = new Point(1, 0)
        stack.backgroundGradient = gradient
    },
    "dayProgress": (stack) => {
        let gradient = new LinearGradient()
        gradient.colors = [colors.yellow, colors.yellow, colors.subBackground, colors.subBackground]
        gradient.locations = [0, (today.getHours()*3600+60*today.getMinutes()+today.getSeconds())/ (3600*24), (today.getHours()*3600+60*today.getMinutes()+today.getSeconds())/ (3600*24), 1]
        gradient.startPoint = new Point(0, 0)
        gradient.endPoint = new Point(1, 0)
        stack.backgroundGradient = gradient
    },
    "pic": async (stack) => {
        let url = `https://picsum.photos/${stack.size.width*4}/${stack.size.height*4}`
        let re = new Request(url)
        let pic = await re.loadImage()
        stack.layoutHorizontally()
        let a = (centralize(stack)).addImage(pic)
        a.imageSize = stack.size
    },
    "again": (stack) => {
        let nextInfo = findNext(classInfo.now)
        if (nextInfo[0] != 0) {
            arrow = SFSymbol.named("return.right")
            arrow.applyFont(new Font("Arial Bold", 13))
            image = centralize(stack).addImage(arrow.image)
            image.tintColor = colors.subForeground
            image.resizable = false
            bold.push(centralize(stack).addText( (nextInfo[1].getMonth()+1)+"/"+nextInfo[1].getDate()))
            bolds.push(centralize(stack).addText(counters(nextInfo[2])))
        }
    },
    "weather": async (stack) => {
        let weatherCodes = {
            "0": "Sunny","1": "Sunny","2": "Cloudy","3": "Cloudy","45": "Foggy","48": "Foggy","51": "Drizzle","53": "Drizzle","55": "Drizzle","56": "Drizzle","57": "Drizzle","61": "Rain","63": "Rain","65": "Rain","66": "Rain","67": "Rain","71": "Snow","73": "Snow","75": "Snow","77": "Snow","80": "Showers","81": "Showers","82": "Showers","85": "Snow Showers","86": "Snow Showers","95": "Thunderstorm","96": "Thunderstorm with Hail","99": "Thunderstorm with Hail",}
        let url = "https://api.open-meteo.com/v1/jma?latitude=34.3333&longitude=134.05&hourly=weathercode&forecast_days=1"
        let weather = new Request(url)
        try {
            let forecast = await weather.loadJSON()
            lights.push(centralize(stack).addText("Weather"))
            stack.addSpacer(5)
            let time = new Date()
            bold.push(centralize(stack).addText(weatherCodes[forecast.hourly.weathercode[time.getHours()]]))
        } catch {
            lights.push(centralize(stack).addText("Weather"))
            stack.addSpacer(5)
            let wifi = SFSymbol.named("wifi.slash")
            wifi.applyFont(new Font("Arial", 30))
            let image = centralize(stack).addImage(wifi.image)
            image.tintColor = colors.red
            image.resizable = false
        }

    },
    "waifu": async (stack) => {
        let url = "https://api.waifu.im/search?included_tags=waifu"
        let r = new Request(url)
        let imurl = new Request((await r.loadJSON()).images[0].url)
        im = await imurl.loadImage()
        let image = stack.addImage(im)
        image.size = stack.size
    }
}

// build widget
var body = widget.addStack()
var left = body.addStack()
var right = body.addStack()
var topBar1 = left.addStack()
var topBar2 = left.addStack()
var mainCover = left.addStack()
var main = mainCover.addStack()
var some = mainCover.addStack()
var bottom = left.addStack()
var sub1 = right.addStack()
var sub2 = right.addStack()
var sub3 = right.addStack()
var sub4 = right.addStack()
mainCover.spacing = 5
some.layoutVertically()
some.cornerRadius = 15
some.size = new Size(75, 185)
some.backgroundColor = colors.subBackground

// set style
{  // body
    body.size = new Size(320, 320)
    body.spacing = 0
    body.setPadding(0, 0, 0, 0)
}
{  // left
    left.size = new Size(230, 320)
    left.layoutVertically()
    left.spacing = 6
    left.setPadding(3, 8, 0, 0)
}
{  // right
    right.size = new Size(90, 320)
    right.layoutVertically()
    right.spacing = 4
    right.setPadding(0, 0, 0, 0)
}
{  // bar
    stackSubBG.push(topBar1)
    stackSubBG.push(topBar2)
    topBar1.size = new Size(210, 12)
    topBar2.size = new Size(210, 12)
    topBar1.cornerRadius = topBar2.cornerRadius = 6
}
{  // 4 square area
    let width = 80, height = 73
    stackSubBG.push(sub1)
    stackSubBG.push(sub2)
    stackSubBG.push(sub3)
    stackSubBG.push(sub4)
    sub1.layoutVertically()
    sub2.layoutVertically()
    sub3.layoutVertically()
    sub4.layoutVertically()
    sub1.size = sub2.size = sub3.size = sub4.size = new Size(width, height)
    sub1.cornerRadius = sub2.cornerRadius = sub3.cornerRadius = sub4.cornerRadius =15
}
{  // main & bottom
    stackSubBG.push(main)
    stackSubBG.push(bottom)
    main.layoutVertically()
    bottom.layoutVertically()
    main.size = new Size(130, 185)
    bottom.size = new Size(210, 75)
    main.cornerRadius = 15
    bottom.cornerRadius = 15
    main.setPadding(0, 10, 0, 10)
}

// construct widget
const stacks = [main, some, sub1, sub2, sub3, sub4, bottom]
if (config.runsInWidget) {
    if (args.widgetParameter !== null) {
        let parameter = args.widgetParameter
        parameter = parameter.split(",")
        for (var i in parameter) {
            await components[parameter[i].trim()](stacks[i])
        }
    }
} else {
    components.table(main)
    await components.pic(some)
    components.now(sub1)
    components.next(sub2)
    components.again(sub3)
    await components.weather(sub4)
}

stackBG.push(widget)
components.battery(topBar1)
components.dayProgress(topBar2)
applyFont(fore15, "default", 15, colors.foreground)
applyFont(fore10, "default", 10, colors.foreground)
applyFont(sfore10, "default", 10, colors.subForeground)
applyFont(fore15b, "bold", 15, colors.foreground)
applyFont(em15, "bold", 15, colors.blue)

applyFont(small, "default", 10, colors.foreground)
applyFont(bold, "bold", 15, colors.foreground)
applyFont(bolds, "bold", 10, colors.subForeground)
applyFont(ems, "bold", 10, colors.blue)// 
applyFont(em, "bold", 10, colors.blue)
applyFont(normal, "default", 15, colors.foreground)
applyFont(lights, "default", 10, colors.subForeground)
applyFont(light, "default", 15, colors.subForeground)
applyFont(futura, "Futura", 15, colors.foreground)

applyBG(stackBG, colors.background)
applyBG(stackSubBG, colors.subBackground)
widget.presentLarge()
Script.setWidget(widget)
