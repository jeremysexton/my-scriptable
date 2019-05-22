// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: beer;
let rateBeer = Keychain.get("RateBeer_API");

let ask = new Alert();
ask.title = "Search Beer";
ask.message = "What beer are you looking for?";
ask.addAction("OK");
ask.addTextField("Beer Name");
await ask.present();

let req = new Request('https://api.ratebeer.com/v1/api/graphql');
req.method = 'POST';
req.headers = {"Content-type": "application/json", "Accept": "application/json", "x-api-key": rateBeer};
let graphQL = `
query {
  beerSearch(query: \"${ask.textFieldValue(0)}\") {
    items {
      name
      description
      overallScore
      styleScore
      ratingCount
      averageRating
      abv
      ibu
      calories
      style {
        name
        description
      }
      brewer {
        name
        city
        state {
          name
        }
        country {
          name
        }
      }
    }
  }
}
`;
let reqBody = {"query": graphQL, "variables": "{}", "operationName": "" };
req.body = JSON.stringify(reqBody);
let data = await req.loadJSON();
let results = data["data"]["beerSearch"]["items"];

var beerPick = new UITable();
var tableHeaders = new UITableRow();
tableHeaders.isHeader = true;
tableHeaders.addText("Beer");
beerPick.addRow(tableHeaders);
var selectedBeer = new Object();
for (i in results) {
  let beerName = results[i]["name"];
  let brewery = results[i]["brewer"]["name"];
  let newRow = new UITableRow();
  newRow.addText(beerName, brewery);
  newRow.height = 60;
  newRow.onSelect = (number) => {
    let numberFix = number - 1;
    theBeer = results[numberFix];
  }
  beerPick.addRow(newRow);
}
await beerPick.present();

var beerPresent = new UITable();

var beerName = new UITableRow();
beerName.addText(theBeer["name"], theBeer["style"]["name"]);
beerPresent.addRow(beerName);

var beerBrewer = new UITableRow();
beerBrewer.addText(theBeer["brewer"]["name"], theBeer["brewer"]["state"]["name"] + ", " + theBeer["brewer"]["country"]["name"]);
beerBrewer.height = 60;
beerPresent.addRow(beerBrewer);

var beerVitals = new UITableRow();
if (theBeer["abv"]) {
    beerVitals.addText(String(theBeer["abv"].toFixed(2)), "ABV");
}
if (theBeer["ibu"]) {
    beerVitals.addText(String(theBeer["ibu"].toFixed(2)), "IBU");
}
if (theBeer["calories"]) {
    beerVitals.addText(String(theBeer["calories"].toFixed(2)), "Cals");
}
beerVitals.height = 60;
beerPresent.addRow(beerVitals);

var beerRatings = new UITableRow();
beerRatings.addText(String(theBeer["overallScore"].toFixed(2)), "Overall");
beerRatings.addText(String(theBeer["styleScore"].toFixed(2)), "Style");
beerRatings.addText(String(theBeer["averageRating"].toFixed(2)) + " (" + String(theBeer["ratingCount"]) + ")", "RateBeer");
beerRatings.height = 60;
beerPresent.addRow(beerRatings);

await beerPresent.present();
