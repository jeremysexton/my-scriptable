// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: sort-numeric-down;
// Get data from Pastboard
var dataRaw = Pasteboard.paste();
// Parse data as JSON
var obj = JSON.parse(dataRaw);
// Extract the actual data
var data = obj["data"];
// Discern the sort field
var sortField = obj["sort"];

// Do the sort
data.sort(function(a,b) {
  return a[sortField] < b[sortField];
});

// Turn sorted fields back into a string for export into Shortcuts
var stringy = JSON.stringify(data);
// Copy data string back to Pasteboard
Pasteboard.copy(stringy);
// Speeds up the end of the script, tells system to stop listening to Scriptable
Script.complete();