/**
 * Registration endpoint for the SWAN GMAO Student landing page: a free Google Apps Script web app that writes one row per registration
 * into the Google Sheet it is attached to. Free, no quota that matters here, and the data stays in your own Google account.
 *
 * Setup (5 minutes), also described in README.md:
 *  1. Create a Google Sheet (any name), then Extensions > Apps Script, and paste this whole file.
 *  2. Deploy > New deployment > type "Web app": run as "Me", who has access "Anyone". Authorise when asked.
 *  3. Copy the "Web app" URL into formEndpoint in config.js (formProvider stays "apps-script").
 *  After each edit of this file, use Deploy > Manage deployments > Edit > New version.
 */

var SHEET_NAME = "Inscriptions";
var NOTIFY_EMAIL = ""; // optional: an e-mail address that receives one message per registration (Google allows about 100 per day)
var HEADERS = ["Date", "Nom et prénom", "E-mail", "Université", "Filière", "Niveau", "Langue", "Version", "Page"];

function text_(v, max) {
  var s = String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max || 200);
  // a value that a spreadsheet would run as a formula is stored as plain text
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // the landing page sends a form submission (parameters); a JSON body is accepted too
    var d = (e && e.parameter && (e.parameter.email || e.parameter.name)) ? e.parameter : JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var name = text_(d.name || d.fullName, 120), email = text_(d.email, 160), uni = text_(d.university, 160), major = text_(d.specialty || d.major, 160), level = text_(d.level, 40);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !uni || !major || !level) return out_({ ok: false, error: "invalid" });
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold"); }
    sh.appendRow([new Date(), name, email, uni, major, level, text_(d.language, 20), text_(d.version, 20), text_(d.page, 200)]);
    if (NOTIFY_EMAIL) MailApp.sendEmail(NOTIFY_EMAIL, "Nouvelle inscription SWAN GMAO Student", name + "\n" + email + "\n" + uni + "\n" + major + "\n" + level);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) { /* lock not held */ }
  }
}

function doGet() { return out_({ ok: true, service: "SWAN GMAO Student registrations" }); }

function out_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
