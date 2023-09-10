// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: cloud;
var widget = new ListWidget();
var now = new Date();
var tomorrowM = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1, 0)
var tomorrowN = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1, 9)
var h = now.getHours();
var API = "24534a4a2532273caecb4a7385e19039";
var lat = 34.34;
var lon = 134.14;
var url = `https://www.jma.go.jp/bosai/forecast/data/forecast/370000.json`;
var sun = `https://labs.bitmeister.jp/ohakon/json/?year=${now.getFullYear()}&month=${now.getMonth()+1}&day=${now.getDate()}&lat=${lat}&lng=${lon}`
var warningURL = 'https://www.jma.go.jp/bosai/warning/data/warning/370000.json'
var fm = FileManager.local()
var doc = fm.documentsDirectory()
var dirPath = doc + '/weather'
var tPath = dirPath+'/today.txt'
var nPath =dirPath+'/tomorrow.txt'
var uPath = dirPath+'/update.txt'
var iott = Math.ceil(now.getHours()/6) // index of the time
const warning_code = {33:{name1:"大雨",name2:"特別警報",elem:"rain",level:50},"03":{name1:"大雨",name2:"警報",elem:"rain",level:30},10:{name1:"大雨",name2:"注意報",elem:"rain",level:20},"04":{name1:"洪水",name2:"警報",elem:"flood",level:30},18:{name1:"洪水",name2:"注意報",elem:"flood",level:20},35:{name1:"暴風",name2:"特別警報",elem:"wind",level:40},"05":{name1:"暴風",name2:"警報",elem:"wind",level:30},15:{name1:"強風",name2:"注意報",elem:"wind",level:20},32:{name1:"暴風雪",name2:"特別警報",elem:"wind_snow",level:40},"02":{name1:"暴風雪",name2:"警報",elem:"wind_snow",level:30},13:{name1:"風雪",name2:"注意報",elem:"wind_snow",level:20},36:{name1:"大雪",name2:"特別警報",elem:"snow",level:40},"06":{name1:"大雪",name2:"警報",elem:"snow",level:30},12:{name1:"大雪",name2:"注意報",elem:"snow",level:20},37:{name1:"波浪",name2:"特別警報",elem:"wave",level:40},"07":{name1:"波浪",name2:"警報",elem:"wave",level:30},16:{name1:"波浪",name2:"注意報",elem:"wave",level:20},38:{name1:"高潮",name2:"特別警報",elem:"tide",level:40},"08":{name1:"高潮",name2:"警報",elem:"tide",level:40},19:{name1:"高潮",name2:"注意報",elem:"tide",level:20},"19+":{name1:"高潮",name2:"注意報",elem:"tide",level:30},14:{name1:"雷",name2:"注意報",elem:"thunder",level:20},17:{name1:"融雪",name2:"注意報",elem:"snow_melting",level:20},20:{name1:"濃霧",name2:"注意報",elem:"fog",level:20},21:{name1:"乾燥",name2:"注意報",elem:"dry",level:20},22:{name1:"なだれ",name2:"注意報",elem:"avalanche",level:20},23:{name1:"低温",name2:"注意報",elem:"cold",level:20},24:{name1:"霜",name2:"注意報",elem:"frost",level:20},25:{name1:"着氷",name2:"注意報",elem:"ice_accretion",level:20},26:{name1:"着雪",name2:"注意報",elem:"snow_accretion",level:20}}

if (!fm.fileExists(dirPath)) {
	fm.createDirectory(dirPath)
	fm.writeString(tPath, '?,?')
	fm.writeString(nPath, '?,?')
	fm.writeString(uPath, '')
}


const colors = {
	background: new Color("#fdf6e3"),
	foreground: new Color("#657b83"),
	subBackground: new Color("#eee8d5"),
	subForeground: new Color("#93a1a1"),
	accent: new Color("#268bd2"),
};
var symbols = {
	Thunderstorm: SFSymbol.named("cloud.bolt.rain.fill"),
	Drizzle: SFSymbol.named("cloud.drizzle.fill"),
	Ra: SFSymbol.named("cloud.rain.fill"),
	Sn: SFSymbol.named("cloud.snow.fill"),
	Atmosphere: SFSymbol.named("cloud.fog.fill"),
	Cl: SFSymbol.named("cloud.fill"),
	Su: SFSymbol.named(isSun? "sun.max.fill":"moon.stars.fill"),
	Bar: SFSymbol.named("poweron"),
	Less: SFSymbol.named("lessthan")
};

var iconSize = 45
for (var i in symbols) {
	symbols[i].applyFont(Font.systemFont(iconSize))
	if (i == "Less") {
		symbols[i].applyFont(Font.systemFont(11))
	}
}

var r = new Request(url);
try {
	var json = await r.loadJSON();
} catch(e) {
	var holder = widget.addStack()
	var v = holder.addStack()
	v.layoutVertically()
	var title = v.addStack()
	title.size = new Size(146, 18)
	title.addSpacer();var titleText = title.addText("Weather");title.addSpacer()
	titleText.font = new Font('Futura', 16)
	titleText.textColor = colors.foreground
	widget.backgroundColor = colors.background
	var iconHolder = v.addStack()
	iconHolder.size = new Size(146, 55)
	var icon = SFSymbol.named("wifi.slash")
	icon.applyFont(Font.mediumMonospacedSystemFont(50))
	iconHolder.addSpacer();var image=iconHolder.addImage(icon.image);iconHolder.addSpacer();
	image.resizable = false
	image.tintColor = colors.foreground
	v.addSpacer(20)
	var il = v.addStack()
	il.size = new Size(146, 20)
	il.addSpacer()
	var icons = ["ipad.and.iphone", "exclamationmark.square", "network"]
	for (var i of icons) {
		icon = SFSymbol.named(i)
		icon.applyFont(Font.mediumMonospacedSystemFont(18))
		image = il.addImage(icon.image)
		image.resizable = false
		image.tintColor = colors.foreground
		if (i == "exclamationmark.square") {
			image.tintColor = Color.red()
		}
		il.addSpacer()
	}
	
	widget.presentSmall()
	return
}

var indexBox = []
for (var i of json[0].timeSeries[2].timeDefines) {
	indexBox.push(new Date(i).getTime())
}

var tempIndex = [indexBox.indexOf(tomorrowM.getTime()),indexBox.indexOf(tomorrowN.getTime())]

if (fm.readString(uPath) != now.getDate()) {
	fm.writeString(tPath, fm.readString(nPath))
	fm.writeString(uPath, String(now.getDate()))
}

fm.writeString(nPath, json[0].timeSeries[2].areas[0].temps[tempIndex[0]]+','+json[0].timeSeries[2].areas[0].temps[tempIndex[1]])
var temp = fm.readString(tPath).split(',')

r = new Request(sun)
var sun_rise_set = await r.loadJSON()
var t = [sun_rise_set.rise_and_set.sunrise_hm.split(':'), sun_rise_set.rise_and_set.sunset_hm.split(':')]
var isSun = (t[0][0] < now.getHours() && t[0][1] < now.getMinutes()) && (t[1][0] > now.getHours() && t[1][1] > now.getMinutes())

var report = weatherCodes(json[0].timeSeries[0].areas[0].weatherCodes[0])
var body = widget.addStack()
body.size = new Size(146,146)
body.layoutVertically()
widget.backgroundColor = colors.background

var titleHolder = body.addStack()
titleHolder.addSpacer()
var title = titleHolder.addText("Weather")
titleHolder.addSpacer()
title.font = new Font("Futura", 15)
title.textColor = colors.foreground

var iconHolder = body.addStack()
iconHolder.size = new Size(146, 70)
iconHolder.centerAlignContent()
iconHolder.addSpacer(7)
if (report.length == 1) {
	var icon =iconHolder.addImage(symbols[report[0]].image)
	icon.tintColor = colors.foreground
	icon.resizable = false
} else if (report[1] == 'Af') {
	var licon = iconHolder.addImage(symbols[report[0]].image)
	licon.resizable = false
	licon.tintColor = colors.foreground
	var bar = iconHolder.addImage(symbols['Bar'].image)
	bar.resizable = false
	bar.tintColor = colors.foreground
	var ricon = iconHolder.addImage(symbols[report[2]].image)
	ricon.resizable = false
	ricon.tintColor = colors.foreground
} else if (report[1] == 'Oc') {
	symbols[report[2]].applyFont(Font.systemFont(22))
	iconHolder.spacing = -7
	var licon = iconHolder.addImage(symbols[report[0]].image)
	licon.resizable = false
	licon.tintColor = colors.foreground
	var ricon = iconHolder.addStack()
	ricon.layoutVertically()
	ricon.addSpacer(35)
	ricon = ricon.addImage(symbols[report[2]].image)
	ricon.resizable = false
	ricon.tintColor = colors.subForeground
} else {
	console.log('no match')
	console.log(json[1].timeSeries[0].areas[0].weatherCodes[2])
	console.log(report)
}


// create temp bar
var adjust = body.addStack()
var tempHolder = adjust.addStack()
tempHolder.size = new Size(146,20)
tempHolder.centerAlignContent()

var tempText = tempHolder.addText('   '+String(temp[0]).padEnd(4, ' '))
tempText.font = Font.mediumMonospacedSystemFont(13)
tempText.minimumScaleFactor = 1
tempText.textColor = colors.foreground

tempHolder.addSpacer()
var tempIcon = SFSymbol.named('thermometer')
tempIcon.applyFont(Font.mediumMonospacedSystemFont(13))
tempIcon = tempHolder.addImage(tempIcon.image)
tempIcon.resizable = false
tempIcon.tintColor = new Color("#dc322f")
tempHolder.addSpacer()

var tempText = tempHolder.addText(String(temp[1]).padStart(4, ' ')+'   ')
tempText.font = Font.mediumMonospacedSystemFont(13)
tempText.minimumScaleFactor = 1
tempText.textColor = colors.foreground

var pops = (json[0].timeSeries[1].areas[0].pops).slice(0,2)

// create possibility of precipitation bar
var adjust = body.addStack()
var popHolder = adjust.addStack()
popHolder.size = new Size(146,20)
popHolder.centerAlignContent()

var popText = popHolder.addText('   '+pops[0].padEnd(4, ' '))
popText.font = Font.mediumMonospacedSystemFont(13)
popText.minimumScaleFactor = 1
popText.textColor = colors.foreground

popHolder.addSpacer()
var popIcon = SFSymbol.named('humidity.fill')
popIcon.applyFont(Font.mediumMonospacedSystemFont(13))
popIcon = popHolder.addImage(popIcon.image)
popIcon.resizable = false
popIcon.tintColor = colors.accent
popHolder.addSpacer()

var popText = popHolder.addText(pops[1].padStart(4, ' ')+'   ')
popText.font = Font.mediumMonospacedSystemFont(13)
popText.minimumScaleFactor = 1
popText.textColor = colors.foreground

r = new Request(warningURL)
code = await r.loadJSON()
code = code.areaTypes[1].areas[0].warnings

// create warnig bar (never show up unless there is any warning)
var adjust = body.addStack()
var warningHolder = adjust.addStack()
warningHolder.centerAlignContent()
warningHolder.addSpacer()
for (var i of code) {
    if (i.status != '解除'){
    	putWarningIcon(warningHolder, interpretWarning(i.code))
    }
		warningHolder.addSpacer()
}

function putWarningIcon(stack, info) {
	if (typeof(info[1]) == 'string') {
	    var txt = stack.addText(info[1])
	    txt.textColor = info[2] == 1? Color.orange() : info[2] == 2 ? Color.red() : Color.black()
	    txt.font = Font.boldMonospacedSystemFont(13)
	} else {
	    var img = stack.addImage(info[1].image)
	    img.tintColor = info[2] == 1? Color.orange() : info[2] == 2 ? Color.red() : Color.black()
	}
}

function interpretWarning(code) {
    var w = warning_code[code]
    var n
    switch (w.elem) {
        case "rain":
        	n = 'cloud.heavyrain.fill'
        	break
        case "flood":
        	n = '洪水'
        	break
        case "wind":
        	n = 'wind'
        	break
        case "wind_snow":
        	n = 'wind.snow'
        	break
        case "snow":
        	n = 'snowflake'
        	break
        case "wave":
        	n = '浪'
        	break
        case "tide":
        	n = '潮'
        	break
        case "thunder":
        	n = 'bolt.fill'
        	break
        case "snow_melting":
        	n = '融雪'
        	break
        case "fog":
        	n = 'cloud.fog.fill'
        	break
        case "dry":
        	n = '乾'
        	break
        case "avalanche":
        	n = '崩'
        	break
        case "cold":
        	n = 'thermometer.snowflake'
        	break
        case "frost":
        	n = 'snowflake'
        	break
        case "ice_accretion":
        	n = '着氷'
        	break
        case "snow_accretion":
        	n = '着雪'
        	break
    }
    var icon = SFSymbol.named(n)
    if (icon === null) {
        icon = n
    } else {
			icon.applyFont(Font.mediumMonospacedSystemFont(13))
		}
    var name = w.name1
    var level = w.name2 == "注意報" ? 1 : w.name2 == "警報" ? 2 : 3
    return [name, icon, level]
}

function weatherCodes(code) {
	code = Number(code)
	var string = ''
	switch (code) {
		//--------Clear（Su）-----------------
		case 100:
		case 123:
		case 124:
		case 130:
		case 131:
			string += "Su";
			break;

		//--------SuOc（一時）Cl----------------
		case 101:
		case 132:
			string += "SuOcCl";
			break;

		//--------SuOc（一時）Ra----------------
		case 102:
		case 103:
		case 106:
		case 107:
		case 108:
		case 120:
		case 121:
		case 140:
			string += "SuOcRa";
			break;

		//--------SuOc（一時）Sn----------------
		case 104:
		case 105:
		case 160:
		case 170:
			string += "SuOcSn";
			break;

		//--------SuAfCl----------------
		case 110:
		case 111:
			string += "SuAfCl";
			break;

		//--------SuAfRa----------------
		case 112:
		case 113:
		case 114:
		case 118:
		case 119:
		case 122:
		case 125:
		case 126:
		case 127:
		case 128:
			string += "SuAfRa";
			break;

		//--------SuAfSn----------------
		case 115:
		case 116:
		case 117:
		case 181:
			string += "SuAfSn";
			break;

		//--------Cl-----------------
		case 200:
		case 209:
		case 231:
			string += "Cl";
			break;

		//--------ClOcSu-----------------
		case 201:
		case 223:
			string += "ClOcSu";
			break;

		//--------ClOcRa-----------------
		case 202:
		case 203:
		case 206:
		case 207:
		case 208:
		case 220:
		case 221:
		case 240:
			string += "ClOcRa";
			break;

		//--------Cl一時Sn-----------------
		case 204:
		case 205:
		case 250:
		case 260:
		case 270:
			string += "ClOcSn";
			break;

		//--------ClAfSu-----------------
		case 210:
		case 211:
			string += "ClAfSu";
			break;

		//--------ClAfRa-----------------
		case 212:
		case 213:
		case 214:
		case 218:
		case 219:
		case 222:
		case 224:
		case 225:
		case 226:
			string += "ClAfRa";
			break;

		//--------ClAfSn-----------------
		case 215:
		case 216:
		case 217:
		case 228:
		case 229:
		case 230:
		case 281:
			string += "ClAfSn";
			break;

		//--------Ra-----------------
		case 300:
		case 304:
		case 306:
		case 328:
		case 329:
		case 350:
			string += "Ra";
			break;

		//--------RaOcSu-----------------
		case 301:
			string += "RaOcSu";
			break;

		//--------RaOcCl-----------------
		case 302:
			string += "RaOcCl";
			break;

		//--------RaOcSn-----------------
		case 303:
		case 309:
		case 322:
			string += "RaOcSn";
			break;

		//--------暴風Ra-----------------
		case 308:
			return ["Rainstorm"]
			break;

		//--------RaAfSu-----------------
		case 311:
		case 316:
		case 320:
		case 323:
		case 324:
		case 325:
			string += "RaAfSu";
			break;

		//--------RaAfCl-----------------
		case 313:
		case 317:
		case 321:
			string += "RaAfCl";
			break;

		//--------RaAfSn-----------------
		case 314:
		case 315:
		case 326:
		case 327:
			string += "RaAfSn";
			break;

		//--------Sn-----------------
		case 340:
		case 400:
		case 405:
		case 425:
		case 426:
		case 427:
		case 450:
			string += "Sn";
			break;

		//--------SnOcSu-----------------
		case 401:
			string += "SnOcSu";
			break;

		//--------SnOcCl-----------------
		case 402:
			string += "SnOcCl";
			break;

		//--------SnOcRa-----------------
		case 403:
		case 409:
			string += "SnOcRa";
			break;

		//--------暴風Sn-----------------
		case 406:
		case 407:
			return ["blizzard"]
			break;

		//--------SnAfSu-----------------
		case 361:
		case 411:
		case 420:
			string += "SnAfSu";
			break;

		//--------SnAfCl-----------------
		case 371:
		case 413:
		case 421:
			string += "SnAfCl";
			break;

		//--------SnAfRa-----------------
		case 414:
		case 422:
		case 423:
			string += "SnAfRa";
			break;

		default:
			break;
	}
	if (string.length == 2) {
		return [string]
	} else {
		return [string.slice(0, 2), string.slice(2, 4), string.slice(4, 6)]
	}
}
Script.setWidget(widget)
widget.presentSmall()