// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: binoculars;
const tmdbURL = Keychain.get("TMDB_URL");
const tmdbUser = "jeremysexton";
const tmdbAPI = Keychain.get("TMDB_API");
const tmdbSession = Keychain.get("TMDB_Session");
const tmdbImgFront = Keychain.get("TMDB_IMG");

// Ask for first person
var askPeople = new Alert;
askPeople.title = "Who ya looking for?";
askPeople.addTextField('Person 1');
askPeople.addTextField('Person 2');
askPeople.addAction("OK");
askPeople.addCancelAction('Cancel');
await askPeople.presentAlert();
var ansPersonOne = askPeople.textFieldValue(0);
var ansPersonTwo = askPeople.textFieldValue(1);

var searchOneURL = tmdbURL + "3/search/person?api_key=" + tmdbAPI + "&query=" + encodeURI(ansPersonOne);
var searchTwoURL = tmdbURL + "3/search/person?api_key=" + tmdbAPI + "&query=" + encodeURI(ansPersonTwo);

var searchOne = new Request(searchOneURL);
var resultsRawOne = await searchOne.loadJSON();
var resultsOne = resultsRawOne.results;
var searchTwo = new Request(searchTwoURL);
var resultsRawTwo = await searchTwo.loadJSON();
var resultsTwo = resultsRawTwo.results;

// Make a table to choose the right actor
var chooseOne = new UITable();
for (r in resultsOne) {
	let knownFor = [];
	resultsOne[r]["known_for"].forEach(movie => {
		let releaseDate = movie["release_date"];
		let releaseYear = '';
		if (releaseDate !== undefined) {
			releaseYear = releaseDate.match(/\d{4}/g);
		}
		knownFor.push(`${movie.title} (${releaseYear})`);
	});
	let row = new UITableRow();
	row.height= 100;
	row.cellSpacing = 10;
	let imageCell = row.addImageAtURL(`${tmdbImgFront}${resultsOne[r]["profile_path"]}`);
	imageCell.widthWeight = 10;
	let cell = row.addText(resultsOne[r].name, knownFor.join(', '));
	cell.widthWeight = 90;
	row.onSelect = (number) => {
		Pasteboard.copyString(resultsOne[number].id.toString());
	}
	chooseOne.addRow(row);
}
await chooseOne.present();
var chosenOneID = Pasteboard.pasteString();

// Table Picker for Person 2
var chooseTwo = new UITable();
for (r in resultsTwo) {
	let knownFor = [];
	resultsTwo[r]["known_for"].forEach(movie => {
		let releaseDate = movie["release_date"];
		let releaseYear = '';
		if (releaseDate !== undefined) {
			releaseYear = releaseDate.match(/\d{4}/g);
		}
		knownFor.push(`${movie.title} (${releaseYear})`);
	});
	let row = new UITableRow();
	row.height= 100;
	row.cellSpacing = 10;
	let imageCell = row.addImageAtURL(`${tmdbImgFront}${resultsTwo[r]["profile_path"]}`);
	imageCell.widthWeight = 10;
	let cell = row.addText(resultsTwo[r].name, knownFor.join(', '));
	cell.widthWeight = 90;
	row.onSelect = (number) => {
		Pasteboard.copyString(resultsTwo[number].id.toString());
	}
	chooseTwo.addRow(row);
}
await chooseTwo.present();
var chosenTwoID = Pasteboard.pasteString();

// Get info and credits from first person
var personOneURL = tmdbURL + "3/person/" + chosenOneID + "?api_key=" + tmdbAPI + "&append_to_response=credits";
var personOneReq = new Request(personOneURL);
var personOneRaw = await personOneReq.loadJSON();
var personOneCreds = personOneRaw.credits.cast.concat(personOneRaw.credits.crew)
var personOneIDs = personOneCreds.map(movie => movie.id);
var personOneUniqueIDs = arrayUnique(personOneIDs);
// Get info and credits from second person
var personTwoURL = tmdbURL + "3/person/" + chosenTwoID + "?api_key=" + tmdbAPI + "&append_to_response=credits";
var personTwoReq = new Request(personTwoURL);
var personTwoRaw = await personTwoReq.loadJSON();
var personTwoCreds = personTwoRaw.credits.cast.concat(personTwoRaw.credits.crew)
var personTwoIDs = personTwoCreds.map(movie => movie.id);
var personTwoUniqueIDs = arrayUnique(personTwoIDs);
// Find IDs for movies that the two have in common
var matches = personOneUniqueIDs.filter(value => personTwoUniqueIDs.includes(value));

var matchDetails = [];
var movieArray = [];
for (match of matches) {
	let creditInfoOne = personOneCreds.filter(credit => credit.id == match)[0];
	let roleOne = '';
	if (creditInfoOne.character) {
		roleOne = creditInfoOne.character;
	} else {
		roleOne = creditInfoOne.job;
	}
	let creditInfoTwo = personTwoCreds.filter(credit => credit.id == match)[0];
	let roleTwo = '';
	if (creditInfoTwo.character) {
		roleTwo = creditInfoTwo.character;	
	} else {
		roleTwo = creditInfoTwo.job;
	}
	let poster = creditInfoOne["poster_path"];
	let output = {"title": `${creditInfoOne.title} (${creditInfoOne["release_date"].match(/\d{4}/g)})`, "poster": poster, "year": ''};
	output.year = creditInfoOne["release_date"].match(/\d{4}/g).toString();
	output[personOneRaw.name] = roleOne;
	output[personTwoRaw.name] = roleTwo;
	movieArray.push(output);
}

movieArray.sort(function(a,b) {
  return a["year"] > b["year"];
});

var finalTable = new UITable();
for (movie of movieArray) {
	let posterRow = new UITableRow();
	let posterCell = posterRow.addImageAtURL(`${tmdbImgFront}${movie.poster}`);
	posterCell.widthWeight = 100;
	posterCell.centerAligned();
	posterRow.height = 150;
	posterRow.cellSpacing = 10;
	let titleRow = new UITableRow();
	let titleCell = titleRow.addText(movie.title);
	titleCell.centerAligned();
	titleRow.cellSpacing = 10;
	let peopleRow = new UITableRow();
	let cellOne = peopleRow.addText(personOneRaw.name, movie[personOneRaw.name]);
	let cellTwo = peopleRow.addText(personTwoRaw.name, movie[personTwoRaw.name]);
	peopleRow.cellSpacing = 10;
    let blankRow = new UITableRow();
    blankRow.addText('');
	finalTable.addRow(posterRow);
	finalTable.addRow(titleRow);
	finalTable.addRow(peopleRow);
    finalTable.addRow(blankRow);
}
await finalTable.present();


function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}