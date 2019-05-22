// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: film;
const tmdbURL = Keychain.get("TMDB_URL");
const tmdbUser = "jeremysexton";
const tmdbAPI = Keychain.get("TMDB_API");
const tmdbSession = Keychain.get("TMDB_Session");
const omdb = Keychain.get("OMDB_API");
const omdbURL = "http://www.omdbapi.com/?i=";
const airURL = "https://api.airtable.com/v0/appR4mmLtIemga8oE/Movies";
const airAPI = Keychain.get("Airtable_API");
const airAuth = "Bearer " + airAPI;

// Create new alert, asking for a movie
var query = new Alert;
query.addTextField("Movie Title");
query.addAction("OK");
query.title = "What movie are you adding?";
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

// Get Rotten Tomatoes and Metascore from OMDB
let omdbReq = new Request(omdbURL + movie.imdb_id + "&apikey=" + omdb);
let omdbRaw = await omdbReq.loadJSON();
let metascore = Number(omdbRaw["Metascore"]);
let ratings = omdbRaw.Ratings;
let rotten = null;
for (let rating of ratings) {
	if (rating.Source === "Rotten Tomatoes") {
		rotten = Number(rating.Value.match(/\d+/));
	}
}

// Ask Where the Movie Is
let locationAsk = new Alert();
let locationArray = ["Plex", "iTunes", "VUDU"];
for (location of locationArray) {
	locationAsk.addAction(location);
}
locationAsk.title = "Where is this film?";
let locationAnswer = await locationAsk.present();
let location = [locationArray[locationAnswer]];

// Ask quality
let qualityAsk = new Alert();
qualityAsk.title = "What quality is this copy in?";
let qualityArray = ["4K","HD","SD"];
for (quality of qualityArray) {
	qualityAsk.addAction(quality);
}
let qualityAnswer = await qualityAsk.present();
let quality = qualityArray[qualityAnswer];

// Ask if it's in HDR
let hdr = false;
let hdrAsk = new Alert();
hdrAsk.title = "Is this in HDR?"
hdrAsk.addAction('Yes');
hdrAsk.addAction('No');
if (qualityArray[qualityAnswer] === "4K") {
	let hdrAnswer = await hdrAsk.present();
	if (hdrAnswer === 0) {
		hdr = true;
	}
}

// Have I seen it?
let seenAsk = new Alert();
seenAsk.title = "Have you seen " + getTitle(movie) + "?";
seenAsk.addAction('Yes');
seenAsk.addAction('No');
let seenAnswer = await seenAsk.present();
let seen = true;
if (seenAnswer === 1) {
	seen = false;
}

// Set up post to Airtable
let postMovie = new Request(airURL);
postMovie.headers = {"Authorization": airAuth, "Content-type": "application/json"};
postMovie.method = "POST";
let airFields = {"Title": getTitle(movie), "Director": getDirector(movie), "Cast": getCast(movie), "Genres": getGenres(movie), "Runtime (mins)": getRuntime(movie), "MPAA": getMPAA(movie), "Locations": location, "Best": locationArray[locationAnswer], "HDR": hdr, "Best Quality": quality, "Year": getYear(movie), "Runtime": runtimeString(movie), "Jeremy Seen": seen, "TMDB ID": movie.id.toString(), "Overview": movie.overview, "Rotten Tomatoes": rotten, "Metascore": metascore};
let airObj = {"fields": airFields};
postMovie.body = JSON.stringify(airObj);
let response = await postMovie.loadJSON();
console.log(response);

// Functions
function getTitle(movie) {
	return movie.title;
}

function getDirector(movie) {
	let directorArray = [];
	let crew = movie.credits.crew;
	for (let person of crew) {
		if (person.job === 'Director') {
			directorArray.push(person.name);
		}
	}
	return directorArray.join(', ');
}

function getCast(movie) {
	let castArray = [];
	let cast = movie.credits.cast;
	if (cast == "") {
		return "";
	}
	for (let i = 0; i <= 4; i++) {
		if (cast[i]) {
			castArray.push(cast[i].name);
		}
	}
	return castArray.join(', ');
}

function getGenres(movie) {
	let genreArray = [];
	let genres = movie.genres;
	for (let genre of genres) {
		genreArray.push(genre.name);
	}
	return genreArray;
}

function getRuntime(movie) {
	return movie.runtime;
}

function getMPAA(movie) {
// 	let releases = movie.releases.countries;
// 	for (let release of releases) {
// 		if (release.iso_3166_1 === "US") {
// 			if (release.certification != "") {
// 				return release.certification;
// 			}
// 		}
// 	}
  return omdbRaw["Rated"];
}

function getYear(movie) {
	let year = movie.release_date.match(/\d{4}/g);
	return parseInt(year);
}

function runtimeString(movie) {
	let runtime = movie.runtime;
	let hours = Math.floor(runtime / 60);
	let minutes = runtime % 60;
	return hours + "h" + minutes + "m";
}