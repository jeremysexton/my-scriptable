// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: broom;
const airURL = "https://api.airtable.com/v0/appykEQk3PKmo9whh/Movies";
const airAPI = Keychain.get("Airtable_API");
const airAuth = "Bearer " + airAPI;

var formula = "{Watched} = 1";
var url = `${airURL}?filterByFormula=${encodeURI(formula)}`;
var req = new Request(url);
req.headers = { "Authorization": airAuth };
var answer = await req.loadJSON();

var movies = answer["records"];

for (movie of movies) {
	let id = movie["id"];
	console.log(`${movie["id"]}: ${movie["fields"]["Name"]}`);
	let delUrl = `${airURL}/${id}`;
	let delReq = new Request(delUrl);
	delReq.headers = {"Authorization": airAuth};
	delReq.method = "DELETE";
	let axe = await delReq.loadJSON();
	console.log(axe);
}