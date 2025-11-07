// fetchMovies.js
import { GoogleSpreadsheet } from "google-spreadsheet";
import fs from "fs";
import "dotenv/config";
import path from "path";

// --- CONFIG ---
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const API_KEY = process.env.GOOGLE_API_KEY;
const OUTPUT_FILE = path.join("src", "content", "movies.json");

// --- HEADERS FROM YOUR SHEET ---
const HEADERS = [
  "ID",
  "Title",
  "release_date",
  "poster",
  "genre",
  "runtime",
  "favorite",
  "overview",
  "backdrop",
  "rating",
];

// Optional: map to clean property names
const HEADERS_MAP = {
  ID: "id",
  Title: "title",
  release_date: "release_date",
  poster: "poster_path",
  genre: "genre",
  runtime: "runtime",
  favorite: "favorite",
  overview: "overview",
  backdrop: "backdrop_path",
  rating: "score",
};

// Base URL for TMDb images (full resolution)
const TMDB_BASE_URL = "https://image.tmdb.org/t/p/original";

// --- MAIN FUNCTION ---
async function fetchMovies() {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID, { apiKey: API_KEY });
    await doc.loadInfo();

    console.log("Spreadsheet title:", doc.title);
    console.log(
      "Sheets available:",
      doc.sheetsByIndex.map((s) => s.title)
    );

    const sheet = doc.sheetsByIndex[0];
    await sheet.loadHeaderRow();
    console.log("Detected headers:", sheet.headerValues);

    const rows = await sheet.getRows();

    // Map _rawData to clean objects with full TMDb URLs
    const movies = rows.map((row) => {
      const obj = {};
      HEADERS.forEach((header, i) => {
        const key = HEADERS_MAP[header] || header;
        obj[key] = row._rawData[i];

        // If poster or backdrop, prepend TMDb base URL
        if (key === "poster_path" && row._rawData[i]) {
          obj[key] = `${TMDB_BASE_URL}${row._rawData[i]}`;
        }
        if (key === "backdrop_path" && row._rawData[i]) {
          obj[key] = `${TMDB_BASE_URL}${row._rawData[i]}`;
        }
      });
      return obj;
    });

    // Write JSON file
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));

    console.log(`Saved ${movies.length} movies to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error("Error fetching movies:", err);
  }
}

// Run the script
fetchMovies();
