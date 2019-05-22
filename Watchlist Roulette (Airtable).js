// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: random;
const tmdbURL = Keychain.get("TMDB_URL");
const tmdbUser = "jeremysexton";
const tmdbAPI = Keychain.get("TMDB_API");;
const tmdbSession = Keychain.get("TMDB_Session");
const tmdbImgFront = Keychain.get("TMDB_IMG");
const omdb = Keychain.get("OMDB_API");
const omdbURL = "http://www.omdbapi.com/?i=";
const airURL = "https://api.airtable.com/v0/appykEQk3PKmo9whh/Movies?view=Grid%20view&pageSize=50&maxRecords=200";
const airAPI = Keychain.get("Airtable_API");
const airAuth = "Bearer " + airAPI;
const br = "%0D";

var initReq = new Request(airURL);
initReq.headers = { "Authorization": airAuth };
var airData = await initReq.loadJSON();
var airRecords = airData["records"];

if (airData["offset"]) {
	let newURL = airURL + "&offset=" + airData["offset"];
	let newReq = new Request(newURL);
	newReq.headers = { "Authorization": airAuth };
	var moreData = await newReq.loadJSON();
	var moreRecords = moreData["records"];
}

for (i in moreRecords){
	airRecords.push(moreRecords[i]);
}

var rInt = getRandomIntInclusive(0, airRecords.length)
var rMovie = airRecords[rInt];
console.log(rMovie);

var tmdbMovieURL = tmdbURL + "3/movie/" + rMovie["fields"]["TMDB ID"] + "?api_key=" + tmdbAPI;
var tmdbReq = new Request(tmdbMovieURL);
var tmdbData = await tmdbReq.loadJSON();
var posterURL = tmdbImgFront + tmdbData["poster_path"];
var year = tmdbData["release_date"].match(/\d{4}/g);

var table = new UITable();
var titleRow = new UITableRow();
titleRow.isHeader;
titleRow.addText(tmdbData["title"] + " (" + year + ")").centerAligned();
var posterRow = new UITableRow();
posterRow.addImageAtURL(posterURL).centerAligned();
posterRow.height = 400;
var runLocRow = new UITableRow();
runLocRow.addText("⏱ " + minutesToHours(rMovie["fields"]["Runtime"])).leftAligned();
runLocRow.addText("☁️ " + rMovie["fields"]["Location"].join(", ")).rightAligned();
var genRow = new UITableRow();
genRow.addText("🗂 " + rMovie["fields"]["Genres"].join(", ")).centerAligned();
var ratRow = new UITableRow();
ratRow.addText(getRTIcon(rMovie["fields"]["Rotten Tomatoes"])).leftAligned();
ratRow.addText("🔸 " + rMovie["fields"]["Metascore"]).rightAligned();
var desRow = new UITableRow();
desRow.addText(rMovie["fields"]["Description"]);
desRow.height = 325;

table.addRow(titleRow);
table.addRow(posterRow);
table.addRow(runLocRow);
table.addRow(genRow);
table.addRow(ratRow);
table.addRow(desRow);

table.present();

if (config.runsWithSiri){
	Speech.speak("You should watch " + tmdbData["title"] + ". " + tmdbData["overview"]);
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function minutesToHours(minutesRaw){
	var hours = Math.floor(minutesRaw / 60);
	var minutes = minutesRaw % 60;
	if (hours == 1) {
		var hourText = "hour";
	} else {
		var hourText = "hours";
	}
	if (minutes == 1) {
		var minuteText = "minute";
	} else {
		var minuteText = "minutes";
	}
	var timeString = hours + "h" + minutes + "m";
	return timeString;
}

function getRTIcon(score){
	if (score > 59) {
		return "🍅 " + score + "%";
	} else {
		return "🤮 " + score + "%";
	}
}