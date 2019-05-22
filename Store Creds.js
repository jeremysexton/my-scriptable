// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: unlock-alt;
// Movie Keys
Keychain.set("TMDB_API", "670ec5dae3672a9f47f8b6c315ad9ef9");
Keychain.set("TMDB_Session", "6886ecbfdc4c0ca0fa8063fb676b0f58843c4c63");
Keychain.set("TMDB_Access", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NzBlYzVkYWUzNjcyYTlmNDdmOGI2YzMxNWFkOWVmOSIsInN1YiI6IjU2YzQzMDBkOTI1MTQxNmJhOTAwMThlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sp3eiTg6zxGIU6x-kqmj6i-fh75DglRBul1-JXRYilo");
Keychain.set("TMDB_Request", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE1MzkyNDU3NTIsInNjb3BlcyI6WyJwZW5kaW5nX3JlcXVlc3RfdG9rZW4iXSwiZXhwIjoxNTM5MjQ2NjUyLCJqdGkiOjEwMDI5NTAsImF1ZCI6IjY3MGVjNWRhZTM2NzJhOWY0N2Y4YjZjMzE1YWQ5ZWY5IiwicmVkaXJlY3RfdG8iOm51bGwsInZlcnNpb24iOjF9.QIZDw-jAAcyRRFkItWQaTVGUAyBDIlJ8mainnffSzsQ");
Keychain.set("TMDB_URL", "https://api.themoviedb.org/");
Keychain.set("TMDB_IMG", "https://image.tmdb.org/t/p/original");
Keychain.set("OMDB_API", "37f1c6bf");
Keychain.set("Airtable_API", "keyfZz1jybPTxHhm5");

// Beer Keys
Keychain.set("RateBeer_API", "HtlhIrcTdK4WapRJCjcTx1jDb129lWoM4EssdOWt");

// Say heeeeeeeeey
let alt = new Alert();
alt.title = "Success!";
alt.message = "We have stashed the credentials!";
alt.present();