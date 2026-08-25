/*
  Site configuration — one per customer, uploaded to GitHub along with the
  other files (unlike before, this file holds no secrets, so it's safe to
  commit). Fill in repoOwner, repoName, and siteUrl for this customer
  before uploading. publishProxyUrl is the same for every customer — it's
  the one shared publish proxy set up once (see SETUP-GUIDE-FOR-YOU).

  The real GitHub token is never in this file, or anywhere else this page
  loads — it lives only on the publish proxy server, matched to a publish
  password that's given to the customer separately (never written down in
  any file on GitHub).
*/
window.MENU_SITE_CONFIG = {
  repoOwner: "YOUR-GITHUB-USERNAME",
  repoName: "customer-name-menu",
  branch: "main",
  filePath: "menu-data.js",
  siteUrl: "https://YOUR-GITHUB-USERNAME.github.io/customer-name-menu/",
  publishProxyUrl: "https://menu-publish-proxy.YOUR-SUBDOMAIN.workers.dev/publish"
};
