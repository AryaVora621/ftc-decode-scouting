/**
 * FTC Scout – Google Sheets backend
 *
 * This Apps Script expects a spreadsheet with two sheets:
 *  - "Matches" for match scouting data
 *  - "Pits" for pit scouting data
 *
 * Deploy as a Web App and set access to "Anyone with the link".
 *
 * API shape (JSON):
 *  - POST /?type=match : { ...MatchEntry without id/timestamp }  -> appends row
 *  - POST /?type=pit   : { ...PitEntry without id/timestamp }    -> appends row
 *  - GET  /?type=match : returns all match rows as JSON
 *  - GET  /?type=pit   : returns all pit rows as JSON
 */

const MATCH_SHEET_NAME = "Matches";
const PIT_SHEET_NAME = "Pits";

/**
 * Handle GET – return all rows for a given type.
 */
function doGet(e) {
  const type = (e && e.parameter && e.parameter.type) || "match";
  const sheet = getSheetForType(type);
  if (!sheet) {
    return jsonResponse({ error: "Invalid type" }, 400);
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return jsonResponse([]);
  }

  const headers = values[0];
  const rows = values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });

  return jsonResponse(rows);
}

/**
 * Handle POST – append a new row to the appropriate sheet.
 */
function doPost(e) {
  const type = (e && e.parameter && e.parameter.type) || "match";
  const sheet = getSheetForType(type);
  if (!sheet) {
    return jsonResponse({ error: "Invalid type" }, 400);
  }

  if (!e || !e.postData || !e.postData.contents) {
    return jsonResponse({ error: "Missing body" }, 400);
  }

  const body = JSON.parse(e.postData.contents);

  const nowIso = new Date().toISOString();
  const headers = getOrInitHeaders(sheet, type);

  const row = headers.map(h => {
    if (h === "timestamp") return nowIso;
    if (h === "id") return Utilities.getUuid();
    return body[h] !== undefined ? body[h] : "";
  });

  sheet.appendRow(row);

  return jsonResponse({ success: true });
}

/**
 * Return the correct sheet for a given type.
 */
function getSheetForType(type) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (type === "pit") {
    return ss.getSheetByName(PIT_SHEET_NAME);
  }
  return ss.getSheetByName(MATCH_SHEET_NAME);
}

/**
 * Ensure headers exist and return them.
 */
function getOrInitHeaders(sheet, type) {
  const existing = sheet.getDataRange().getValues();
  if (existing.length > 0) {
    return existing[0];
  }

  // Minimal headers matching your data model (can be extended later)
  const headers =
    type === "pit"
      ? [
          "id",
          "teamNumber",
          "timestamp",
          "autoCapacity",
          "teleopCapacity",
          "parkStatus",
          "autoReliability",
          "patternGood",
          "cycleStyle",
          "humanPlayerNotes",
          "generalNotes",
        ]
      : [
          "id",
          "teamNumber",
          "matchNumber",
          "allianceColor",
          "scoutName",
          "timestamp",
          "autoScore",
          "autoLeave",
          "autoReliability",
          "patternGood",
          "teleopScore",
          "cycleStyle",
          "parkStatus",
          "endgameScore",
          "generalNotes",
          "totalScore",
          "humanPlayerNotes",
        ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return headers;
}

/**
 * Helper to return JSON responses.
 * We ignore the statusCode argument because Web Apps always return 200,
 * but we keep it in the signature so existing calls remain valid.
 */
function jsonResponse(payload, statusCode) {
  return ContentService.createTextOutput(
    JSON.stringify(payload, null, 2)
  ).setMimeType(ContentService.MimeType.JSON);
}

