// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
// Set up API Keys
const tmdbURL = Keychain.get("TMDB_URL");
const tmdbUser = "jeremysexton";
const tmdbAPI = Keychain.get("TMDB_API");
const tmdbIMG = Keychain.get("TMDB_IMG");
const tmdbSession = Keychain.get("TMDB_Session");
const omdb = Keychain.get("OMDB_API");

const br = "%0D";
const hr = "***";

// Create new alert, asking for a show
var query = new Alert;
query.addTextField("What show are you searching for?");
query.addAction("OK");
query.title = "Search for a show";
// Present Alert, asking for show. Craft search URL from answer
await query.present();
var answer = query.textFieldValue(0);
var encoded = encodeURI(answer);
var url = `${tmdbURL}3/search/tv?api_key=${tmdbAPI}&query=${encoded}`

// Hit TMDB and return results for search
let search = new Request(url);
let resultsRaw = await search.loadJSON();
let results = resultsRaw["results"];

// Choose correct show
let chooseShow = new Alert();
chooseShow.title = "Which of these is the show you're looking for?";
results.forEach(function(value, key) {
	let show = results[key];
	let date = show["first_air_date"].match(/\d{4}/g);
	let title = show["name"];
	let option = `${title} (${date})`
	chooseShow.addAction(option);
});
var chosen = await chooseShow.present();
var chosenID = results[chosen]["id"];
var url = `${tmdbURL}3/tv/${chosenID}?api_key=${tmdbAPI}`;
var getShow = new Request(url);
var show = await getShow.loadJSON();

var showSeasons = show["seasons"];
var chooseSeason = new Alert();
chooseSeason.title = "Which season is this episode from?";
showSeasons.forEach(function(season, key) {
	let name = season["name"];
	let number = season["season_number"];
	let option = `#${number}: ${name}`;
	chooseSeason.addAction(option);
});
var chosenSeasonIndex = await chooseSeason.present();
var chosenSeason = showSeasons[chosenSeasonIndex];

var url = `${tmdbURL}3/tv/${chosenID}/season/${chosenSeason["season_number"]}?api_key=${tmdbAPI}`;
var getSeason = new Request(url);
var season = await getSeason.loadJSON();

var seasonEpisodes = season["episodes"];


// Ask for rating
var askRating = new Alert;
askRating.title = "What would you rate this episode?";
var ratingChoices = ["★★★★★", "★★★★☆", "★★★☆☆", "★★☆☆☆", "★☆☆☆☆", "💩"]
for (i in ratingChoices) {
	askRating.addAction(ratingChoices[i]);
}
var ratingChoice = await askRating.present();
var myRating = ratingChoices[ratingChoice];

// Get still URL and save still image to clipboard
var posterURL = `${tmdbIMG}${chosenEpisode["still_path"]}`;
let req = new Request(posterURL);
let img = await req.loadImage();
Pasteboard.copyImage(img);

// Create post and save it to Day One
var post = `# ${chosenEpisode["name"]}

**Show:** ${show["name"]}
**Season:** ${chosenSeason["season_number"]}
**Episode:** ${chosenEpisode["episode_number"]}
${retrieveCrew(chosenEpisode["crew"])}
**Air Date:** ${chosenEpisode["air_date"]}
**My Rating:** ${myRating}

> ${chosenEpisode["overview"]}
***

`;
var dayOne = new CallbackURL("dayone://post");
dayOne.addParameter("entry", post);
dayOne.addParameter("journal", "Log");
dayOne.addParameter("tags", "tv");
dayOne.addParameter("imageClipboard", "1");
dayOne.getURL();
dayOne.open();

//var addCrew = postTop + br + retrieveCrew(chosenEpisode["crew"]);
console.log(post);

function retrieveCrew(crewRaw) {
	let crewArray = [];
	let directorArray = [];
	let writerArray = [];	
	let crewOutput = [];
	crewRaw.forEach((person) => {
		let name = person["name"];
		if (person["job"] == "Director") {
			directorArray.push(name);	
		} else if (person["job"] == "Writer") {
			writerArray.push(name);
		} else if (person["job"] == "Teleplay") {
			writerArray.push(name);	
		}
	});
	
	if (directorArray.length > 0) {
		if (directorArray.length > 1) {
			var directorString = `**Directors:** ${directorArray.join(', ')}`;
		} else {
			var directorString = `**Director:** ${directorArray[0]}`;
		}
		crewOutput.push(directorString);	
	}
	
	if (writerArray.length > 0) {
		if (writerArray.length > 1) {
			var writerString = `**Writers:** ${writerArray.join(', ')}`;
		} else {
			var writerString = `**Writer:** ${writerArray[0]}`;
		}
		crewOutput.push(writerString);
	}
	return crewOutput.join(`
	`);
}