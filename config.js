/*
 * The only file to edit before publishing (see README.md).
 *
 * downloadUrl   Direct link to the installer. Use a GitHub release asset (free, up to 2 GB per file):
 *               https://github.com/<account>/<repository>/releases/download/v1.0.0/SWAN-GMAO-Student-Setup-1.0.0.exe
 * formProvider  Where the registrations go (all free):
 *               "apps-script"  a Google Sheet filled by a Google Apps Script web app (unlimited, you own the data; see apps-script/Code.gs)
 *               "formspree"    https://formspree.io (free plan: 50 registrations per month)
 *               "web3forms"    https://web3forms.com (free plan: 250 registrations per month, sent to your mailbox)
 * formEndpoint  The URL given by the provider (Apps Script web app URL, Formspree form URL, or https://api.web3forms.com/submit).
 * accessKey     Web3Forms only: the access key of your form.
 */
window.SWAN_LANDING = {
  downloadUrl: "https://github.com/skewexe/swan-downloads/releases/download/1.0.0/SWAN-GMAO-Student-Setup-1.0.0.exe",
  formProvider: "apps-script",
  formEndpoint: "https://script.google.com/macros/s/AKfycbxc6RgHKHKaymhz6ftST-ORtFPSN4Guw-TRQ6Rbjuy0wPixETZFtZsAJrEp2FAU6bY/exec",
  accessKey: "",
  contactEmail: "souanekhaledibnelwalid@gmail.com",
};
