// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: tv;
const tmdbURL = Keychain.get("TMDB_URL");
const tmdbUser = "jeremysexton";
const tmdbAPI = Keychain.get("TMDB_API");
const tmdbSession = Keychain.get("TMDB_Session");
const omdb = Keychain.get("OMDB_API");
const omdbURL = "http://www.omdbapi.com/?i=";
const airURL = "https://api.airtable.com/v0/appykEQk3PKmo9whh/Stream%20Scout";
const airAPI = Keychain.get("Airtable_API");
const airAuth = "Bearer " + airAPI;
const br = "%0D";

// Create new alert, asking for a movie
var query = new Alert;
query.addTextField("What movie are you searching for?");
query.addAction("OK");
query.title = "Search for a movie";
// Present Alert, asking for movie. Craft search URL from answer
await query.present();
var answer = query.textFieldValue(0);
var encoded = encodeURI(answer);
var url = tmdbURL + "3/search/movie?api_key=" + tmdbAPI + "&query=" + encoded;
// Hit TMDB and return results for search
var search = new Request(url);
var resultsRaw = await search.loadJSON();
var results = resultsRaw["results"];
var chooseMovie = new Alert();
chooseMovie.title = "Which of these is the film you're looking for?";
for (i in results) {
	var movie = results[i];
	var title = movie["title"];
	var year = movie["release_date"].match(/\d{4}/g);
	var option = title + " (" + year + ")";
	chooseMovie.addAction(option); 
}
var chosen = await chooseMovie.present();
var chosenID = results[chosen]["id"];
var url = tmdbURL + "3/movie/" + chosenID + "?api_key=" + tmdbAPI + "&append_to_response=releases,credits";
var getMovie = new Request(url);
var movie = await getMovie.loadJSON();

var whichLocation = new Alert();
whichLocation.title = "Where should you watch this?";
const locationArray = ["iTunes", "Netflix", "Prime", "Hulu", "HBO", "Showtime", "N/A"];
for (i in locationArray){
	let spot = locationArray[i];
	if (spot != "N/A"){
		whichLocation.addAction(spot);
	} else {
		whichLocation.addDestructiveAction(spot);
	}
}
var location = await whichLocation.present();
location = locationArray[location];
location = [location];

var fourKAsk = new Alert();
fourKAsk.title = "Is this in 4K?";
fourKAsk.addAction("👍 Yep!");
fourKAsk.addDestructiveAction("❌ Nope");
var fourKAnswer = await fourKAsk.present();
if (fourKAnswer == 0){
	var isFourK = true;
} else {
	var isFourK = false;
}

var isShortlist = new Alert();
isShortlist.title = 'Add this to shortlist?';
isShortlist.addAction('✅ Yes!');
isShortlist.addDestructiveAction('❌ Nope'); 
var isShortlistAnswer = await isShortlist.present();
if (isShortlistAnswer == 0){
	var shortlist = true;
} else {
	var shortlist = false;
}

var addAnything = new Alert();
addAnything.title = "Anything to add?";
addAnything.addAction("📝 Yes");
addAnything.addDestructiveAction("❌ No");
var addAnythingAnswer = await addAnything.present();
if (addAnythingAnswer == 0) {
	let addComment = new Alert();
	addComment.title = "What would you like to note?";
	addComment.addAction("OK");
	addComment.addTextField("Thoughts");
	await addComment.present();
	var comment = addComment.textFieldValue(0);
} else {
	var comment = "";
}

let fullURL = omdbURL + movie["imdb_id"] + "&apikey=" + omdb;
let omdbReq = new Request(fullURL);
var omdbRaw = await omdbReq.loadJSON();

//throw new Error("HOLD UP");
var airReq = new Request(airURL);
airReq.headers = {"Authorization": airAuth, "Content-type": "application/json"};
airReq.method = "POST";
var airFields = { "Name": nameYear(movie), "Location": location, "Runtime": movie["runtime"], "Metascore": Number(omdbRaw["Metascore"]), "Genres": getGenres(movie), "TMDB ID": movie["id"].toString(), "IMDB ID": movie["imdb_id"], "4K": isFourK, "Shortlist": shortlist, "Comment": comment };
if (getTomatoes(omdbRaw)){
	airFields["Rotten Tomatoes"] = getTomatoes(omdbRaw);
}
var description = "🎥 " + getDirector(movie) + br + "⭐️ " + getCast(movie) + br + "🔳 " + getRating(movie) + br + br + movie["overview"];
description = decodeURI(description);
airFields["Description"] = description;
var airObj = { "fields": airFields };
airReq.body = JSON.stringify(airObj);
var response = await airReq.loadJSON();
console.log(response);

function getTomatoes(json){
	let ratingsArray = json["Ratings"];
	for (i in ratingsArray){
		if (ratingsArray[i]["Source"] == "Rotten Tomatoes"){
			var rtRaw = ratingsArray[i]["Value"];
			var rtNum = rtRaw.match(/\d+/);
		}
	}
	if (rtNum) {
		return Number(rtNum);
	} else {
		return null;
	}
}

function getGenres(movie){
	let genresArray = movie["genres"];
	let outputArray = [];
	for (i in genresArray){
		let thisGenre = genresArray[i]["name"];
		outputArray.push(thisGenre);
	}
	return outputArray;
}

function nameYear(movie){
	let title = movie["title"];
	let year = movie["release_date"].match(/\d{4}/g);
	
	let output = title + " (" + year + ")" + " " + minutesToHours(movie["runtime"]);
	return output;
}

function getDirector(movie){
	let crew = movie["credits"]["crew"];
	let directorArray = [];
	for (i in crew){
		if (crew[i]["job"] == "Director"){
			directorArray.push(crew[i]["name"]);
		}
	}
	if (directorArray.length > 0){
		var directorString = directorArray.join(", ");
	} else {
		var directorString = directorArray[0];
	}
	return directorString;
}

function getCast(movie){
	let cast = movie["credits"]["cast"];
	let castArray = [];
	for (i = 0; i < 5; i++) {
		if (cast[i]) {
			let thisGuy = cast[i]["name"];
			castArray.push(thisGuy);
		}
	}
	if (castArray != []){
		var castString = castArray.join(", ");
	} else {
		var castString = "";
	}
	return castString;
}

function getRating(movie){
// 	let releases = movie["releases"]["countries"];
// 	for (i in releases){
// 		if (releases[i]["iso_3166_1"] == "US") {
// 			if (releases[i]["certification"] != ""){
// 				var mpaa = releases[i]["certification"];
// 			}
// 		}
// 	}
// 	if (mpaa) {
//       return mpaa;
//     } else {
//       return "Unrated";
//     }
	return omdbRaw["Rated"];
}

function minutesToHours(minutesRaw){
	let hours = Math.floor(minutesRaw / 60);
	let minutes = minutesRaw % 60;
	let timeString = hours + "h" + minutes + "m";
	return timeString;
}