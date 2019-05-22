// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: image;
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

var imagesURL = "https://api.themoviedb.org/3/movie/" + movie["id"] + "/images?api_key=" + tmdbAPI + "&language=en&include_image_language=en,null"
var imageRequest = new Request(imagesURL);
var imagesData = await imageRequest.loadJSON();
var posters = imagesData["posters"];
var backdrops = imagesData["backdrops"];
var posterPathArray = new Array;

let askWhich = new Alert();
askWhich.addAction("Posters");
askWhich.addAction("Backdrops");
askWhich.title = "Tell me whatcha want, whatcha really, really want.";
let which = await askWhich.present();

if (which == 0){
  for (poster in posters){
    var posterPath = posters[poster]["file_path"];
    var posterURL = "https://image.tmdb.org/t/p/original" + posterPath;
    posterPathArray.push(posterURL);
  }
} else {
  for (backdrop in backdrops){
    let bdPath = backdrops[backdrop]["file_path"];
    let bdURL = "https://image.tmdb.org/t/p/original" + bdPath;
    posterPathArray.push(bdURL);
  }
}


posterPathArray.splice(9);

var posterTable = new UITable();
var index = 0;
for (url of posterPathArray){
	let row = new UITableRow();
	let posterCell = row.addImageAtURL(url)
	row.height = 400;
	row.cellSpacing = 10;
    row.onSelect = (number) => {
       Pasteboard.copyString(posterPathArray[number]);
    }
	posterTable.addRow(row);
	index++;
}
await posterTable.present();

let req = new Request(Pasteboard.pasteString());
let img = await req.loadImage();
Pasteboard.copyImage(img);
console.log("Copied to Pasteboard!");