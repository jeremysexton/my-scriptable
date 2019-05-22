// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: film;
// Set up API Keys
const tmdbURL = Keychain.get("TMDB_URL");
const tmdbUser = "jeremysexton";
const tmdbAPI = Keychain.get("TMDB_API");
const tmdbSession = Keychain.get("TMDB_Session");
const omdb = Keychain.get("OMDB_API");

const br = "%0D";
const hr = "***";
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

const omdbURL = "http://www.omdbapi.com/?i=" + movie["imdb_id"] + "&apikey=" + omdb;
var omdbRequest = new Request(omdbURL);
var omdbData = await omdbRequest.loadJSON();

// Get MPAA rating of film
//var releases = movie["releases"]["countries"];
//for (i in releases) {
//	var release = releases[i];
//	if (release["iso_3166_1"] == "US"){
//		if (release["certification"] != ""){
//			var rating = release["certification"];
//		}
//	}
//}
var rating = omdbData["Rated"];

var askRating = new Alert;
askRating.title = "What would you rate this film?";
var ratingChoices = ["★★★★★", "★★★★☆", "★★★☆☆", "★★☆☆☆", "★☆☆☆☆", "💩"]
for (i in ratingChoices) {
	askRating.addAction(ratingChoices[i]);
}
var ratingChoice = await askRating.present();
var myRating = ratingChoices[ratingChoice];

// Ask if I want to update TMDB, if yes, then like, do that stuff, mang.
var yesRate = new Alert;
yesRate.title = "Shall we update TMDB?";
yesRate.addAction("👍 Yes!");
yesRate.addDestructiveAction("❌ Nah, dawg");
var goRate = await yesRate.present();
if (goRate == 0) {
	// Rate movie for TMDB
	var tmdbRate = new Alert;
	tmdbRate.title = "TMDB Rating (0.5 to 10)";
	tmdbRate.addTextField("5");
	tmdbRate.addAction("OK");
	await tmdbRate.present();
	var tmdbRating = tmdbRate.textFieldValue(0);
	// Send rating
	var rateURL = tmdbURL + "3/movie/" + movie["id"] + "/rating?api_key=" + tmdbAPI + "&session_id=" + tmdbSession;
	var tmdbRate = new Request(rateURL);
	var tmdbObj = new Object;
	tmdbObj.value = Number(tmdbRating);
	tmdbJSON = JSON.stringify(tmdbObj);
	tmdbRate.body = tmdbJSON;
	tmdbRate.method = "POST";
	tmdbRate.headers = {"Content-type": "application/json;charset=utf-8"}
	var rateResponse = await tmdbRate.loadJSON();
	console.log(rateResponse);
	
	// Is this a favorite?
	var tmdbFav = new Alert;
	tmdbFav.title = "Mark as favorite?";
	tmdbFav.addAction("👍 Yes");
	tmdbFav.addDestructiveAction("❌ No");
	var isFav = await tmdbFav.present();
	if (isFav == 0) {
		let favURL = tmdbURL + "3/account/" + tmdbUser + "/favorite?api_key=" + tmdbAPI + "&session_id=" + tmdbSession;
		let favReq = new Request(favURL);
		favReq.method = "POST";
		favReq.headers = {"Content-type": "application/json;charset=utf-8"}
		favObj = new Object;
		favObj.media_type = "movie";
		favObj.media_id = Number(movie["id"]);
		favObj.favorite = true;
		favJSON = JSON.stringify(favObj);
		favReq.body = favJSON;
		var favResponse = await favReq.loadJSON();
		console.log(favResponse);
	}
}

var post = "# " + movie["title"] + br + br +  "**Year:** " + movie["release_date"].match(/\d{4}/g) + br + "**Rating:** " + rating + br + "**Runtime:** " + minutesToHours(movie["runtime"]) + br + "**Genres:** " + genresToString(movie["genres"]) + br + hr + br + "**Cast:** " + castToString(movie["credits"]["cast"]) + br + retrieveCrew(movie["credits"]["crew"]) + br + hr + br + "**Rotten Tomatoes:** " + getRTScore(omdbData["Ratings"]) + br + "**Metascore:** " + omdbData["Metascore"] + br + "**My Rating:** " + myRating + br + hr + br + "> " + movie["overview"];

// This errors out before the script actually goes to Day One
// throw new Error("Let's not go to DayOne, shall we?");
// Copy the ID of the movie to the Pasteboard to potentially use to grab images
// Pasteboard.copyString(movie["id"].toString());

var dayOne = new CallbackURL("dayone://post");
dayOne.addParameter("entry", decodeURI(post));
dayOne.addParameter("journal", "Log");
dayOne.addParameter("tags", "movie");
dayOne.getURL();
dayOne.open();


function getRTScore(ratings){
	var rtClean = "";
	var rtRaw = "";
	var rtScore = "";
	for (i in ratings) {
		if (ratings[i]["Source"] == "Rotten Tomatoes"){
			rtRaw = ratings[i]["Value"];	
		}
	}
	
	if (rtRaw != ""){
		rtClean = rtRaw.match(/\d+/g)[0];
		if (rtClean > 59) {
			rtScore = "🍅 " + rtClean + "%";
		} else {
			rtScore = "🤮 " + rtClean + "%";
		}
	} else {
		rtScore = "N/A";
	}
	
	return encodeURI(rtScore);
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
	var timeString = hours + " " + hourText + ", " + minutes + " " + minuteText;
	return timeString;
}

function genresToString(genresRaw){
	var genreArray = [];
	for (i in genresRaw){
		var thisGenre = genresRaw[i]["name"];
		genreArray.push(thisGenre);
	}
	return genreArray.join(", ");
}

function castToString(castRaw){
	var castArray = [];
    if (castRaw != '') {
      for (i = 0; i < 5; i++) {
		castArray.push(castRaw[i]["name"]);
      }
    }
	
	return castArray.join(", ");
}

function retrieveCrew(crewRaw){
	var crewArray = [];
	var directorArray = [];
	var writerArray = [];
	var crewOutput = [];
	var dp = "";
	for (i in crewRaw){
		var thisGuy = crewRaw[i]["name"];
		if (crewRaw[i]["job"] == "Director"){
			directorArray.push(thisGuy);
		} else if (crewRaw[i]["job"] == "Writer"){
			writerArray.push(thisGuy);
		} else if (crewRaw[i]["job"] ==  "Screenplay"){
			writerArray.push(thisGuy);
		} else if (crewRaw[i]["job"] == "Director of Photography"){
			var dp = thisGuy;
		}
	}
	
	if (directorArray.length > 1) {
		var directorString = "**Directors:** " + directorArray.join(", ");
	} else {
		var directorString = "**Director:** " + directorArray[0];
	}
	
	crewOutput.push(directorString);
	
	if (writerArray.length > 1) {
		var writerString = "**Writers:** " + writerArray.join(", ");
		crewOutput.push(writerString);
	} else if (writerArray.length == 1) {
		var writerString = "**Writer:** " + writerArray[0];
		crewOutput.push(writerString);
	}
	
	if (dp.length > 1) {
		var dpString = "**Director of Photography:** " + dp;
		crewOutput.push(dpString);
	}
	
	return crewOutput.join(br);
}