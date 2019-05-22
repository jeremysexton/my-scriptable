// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: dharmachakra;
// Set up API Keys
const tmdbURL = "https://api.themoviedb.org/";
const tmdbUser = "jeremysexton";
const tmdbAPI = "670ec5dae3672a9f47f8b6c315ad9ef9";
const tmdbSession = "6886ecbfdc4c0ca0fa8063fb676b0f58843c4c63"
const omdb = "37f1c6bf";

const watchURL = tmdbURL + "3/account/jeremysexton/watchlist/movies?api_key=" + tmdbAPI + "&session_id=" + tmdbSession + "&sort_by=created_at.desc";
var page1URL = watchURL + "&page=1";
var page1Req = new Request(page1URL);
var page1 = await page1Req.loadJSON();

var totalPages = page1["total_pages"];
var movies = page1["results"];

for (i = totalPages; i > 1; i--) {
	let pageURL = watchURL + "&page=" + i;
	let pageReq = new Request(pageURL);
	let theseMoviesRaw = await pageReq.loadJSON();
	let theseMovies = theseMoviesRaw["results"];
	for (e in theseMovies) {
		movies.push(theseMovies[e]);
	}
}

randomI = getRandomIntInclusive(0, movies.length);
randomMovie = movies[randomI];
if (config.runsWithSiri) {
	Speech.speak(randomMovie["title"] + ": " + randomMovie["overview"]);
} else {
	console.log(randomMovie["title"] + ": " + randomMovie["overview"]);
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}