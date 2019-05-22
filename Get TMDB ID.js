// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: fingerprint;
const tmdbURL = Keychain.get("TMDB_URL");
const tmdbUser = "jeremysexton";
const tmdbAPI = Keychain.get("TMDB_API");
const tmdbSession = Keychain.get("TMDB_Session");
const tmdbImgFront = Keychain.get("TMDB_IMG");
const omdb = Keychain.get("OMDB_API");
const omdbURL = "http://www.omdbapi.com/?i=";
const airURL = "https://api.airtable.com/v0/appykEQk3PKmo9whh/Movies";
const airAPI = Keychain.get("Airtable_API");
const airAuth = "Bearer " + airAPI;

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

let show = new Alert;
show.title = 'The id for ' + results[chosen].title + ' is';
show.message = chosenID.toString();
show.addTextField(chosenID.toString(), chosenID.toString());
show.addAction("OK");
await show.present();