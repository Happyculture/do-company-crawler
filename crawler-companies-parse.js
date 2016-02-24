page_offset = 1;
companies_data = [];
companies_profiles_pages = [];

var casper = require('casper').create({
  //verbose: true,
  //logLevel: "debug"
});

casper.on('remote.message', function(msg) {
  //this.echo('remote message caught: ' + msg);
});

/**
 * Parses a company contributions stats.
 */
function getCompanyData() {
  var company_details = { name: '', total_count: 0, core_contributions: 0, projects: {}};

  // Fetch the company name.
  company_details.name = casper.fetchText('#page-subtitle');
  casper.echo('Crawling ' + company_details.name + ' contributions.');

  // Check the contributions count, if it exists.
  if (casper.exists('#issue-credit')) {
    var contributions_stats = casper.fetchText('#issue-credit');

    // String patterns:
    // Credited on 26 issues fixed in the past 3 months
    // Credited on 1 issue fixed in the past 3 months
    var pattern = /Credited on ([\d, ]+) issues? fixed in the past 3 months/;
    company_details.total_count = contributions_stats.replace(pattern, "$1");
    casper.echo('# contributions: ' + company_details.total_count);

    // Now, extract the projects name that received patches.
    projects_name = casper.evaluate(function () {
      var links = document.querySelectorAll('.view-issue-credit ul li span.views-field-title-1 a');
      return Array.prototype.map.call(links, function(e) {
        return e.innerHTML;
      });
    });

    // Then extract the issues count associated to those projects.
    projects_issues = casper.evaluate(function () {
      var links = document.querySelectorAll('.view-issue-credit ul li span.views-field-nid a');
      var pattern = /([\d, ]+) issues?/;
      return Array.prototype.map.call(links, function(e) {
        return e.innerHTML.replace(pattern, "$1");
      });
    });

    // Identify the core position in this list of contributions.
    var core_contrib_offset = projects_name.indexOf('Drupal core');
    if (core_contrib_offset > -1) {
      company_details.core_contributions = projects_issues[core_contrib_offset];
    }

    // Now build a proper list of projects name and number of contributions for
    // this company.
    projects_name.forEach(function(project_name, offset) {
      if (project_name != 'Drupal core') {
        company_details.projects[project_name] = projects_issues[offset];
      }
    });
  }
  else {
    casper.echo('No contribution found.');
  }
  companies_data.push(company_details);
}

/**
 * Retrieves the list of companies referenced in the marketplace.
 */
function getCompaniesProfilePages(){
  casper.echo('Starting scrapping page ' + page_offset);

  // Fetch the companies profile pages links.
  // Since global variables are not available in the evaluate, we need to carry
  // around our sweet companies_profiles_pages variable.
  companies_profiles_pages = casper.evaluate(function(companies_profiles_pages) {
    var company_page_link = '#block-system-main .view-drupalorg-organizations .view-content > div .field-name-field-logo a';
    var companies = document.querySelectorAll(company_page_link);

    // Enrich the list of links.
    for(var i=0, len = companies.length; i < len; i++) {
      var element = companies[i];
      companies_profiles_pages.push(element.getAttribute('href'));
    }
    return companies_profiles_pages;
  }, companies_profiles_pages);

  // Then we look for a "next page" candidate link to collect all the companies
  // profile pages.
  var nextLink = "#block-system-main .view-drupalorg-organizations ul.pager li.pager-next > a";
  if (casper.visible(nextLink)) {
    page_offset++;

    // For dev limitation mode, stop after the first page parsed.
    if (page_offset > 1) {
      require('utils').dump(companies_profiles_pages);
      casper.echo('STOP');
    }
    else {
      casper.thenClick(nextLink);
      casper.then(getCompaniesProfilePages);
    }
  }
  else {
    casper.echo("END")
  }
}

// 1. Go the the marketplace.
casper.start('https://www.drupal.org/drupal-services');

// 2. Extract all the companies list.
casper.then(getCompaniesProfilePages);

// 3. For each company listed, extract its contribution data.
casper.then(function() {
  companies_profiles_pages.forEach(function(company_link) {
    casper.echo('Now parsing ' + 'https://drupal.org' + company_link + '...');
    casper.thenOpen('https://drupal.org' + company_link, getCompanyData);
  });
});

// 4. Dump the result as a cute JSON.
casper.run(function() {
  require('utils').dump(companies_data);
});

/* JSON generated:

 [
 {
 "name": "Acquia",
 "total_count": "437",
 "core_contributions": "139",
 "projects": {
 "Workbench Moderation": "20",
 "Coffee": "2",
 "Inline Entity Form": "14",
 "BigPipe": "12",
 "Panelizer": "5",
 "Panels": "22",
 "Search API Solr Search": "8",
 "Chaos tool suite (ctools)": "5",
 "Google Currency Converter": "5",
 "Facets": "21",
 "Leaflet": "1",
 "DrupalCamp Organizing Distribution": "1",
 "Acquia Search for Search API": "2",
 "Views Slideshow": "1",
 "Key": "1",
 "Features": "3",
 "Facebook Page Plugin": "2",
 "Page Manager": "14",
 "Search API": "44",
 "ZURB Foundation": "2",
 "BigPipe demo": "1",
 "RoleAssign": "2",
 "Twitter Block": "1",
 "simpleSAMLphp Authentication": "16",
 "CPS": "1",
 "Drupal Community Governance": "2",
 "Search API attachments": "3",
 "Acquia Search Multiple Indexes": "3",
 "Views Timeline JS integration": "1",
 "Drupal Upgrade": "1",
 "Entity Embed": "5",
 "Metatag": "1",
 "ShareThis": "2",
 "File Entity Browser": "2",
 "aGov": "1",
 "Profile": "1",
 "Scheduled Updates": "6",
 "reCAPTCHA": "2",
 "Services": "1",
 "Memcache API and Integration": "1",
 "Media entity Twitter": "1",
 "FileField": "1",
 "Automated Logout": "7",
 "Block Visibility Groups": "1",
 "Moderation State": "1",
 "Field collection": "6",
 "Calendar": "8",
 "Search API Database Search": "1",
 "Braintree Donations": "1",
 "Localization client": "3",
 "Navbar": "3",
 "Workflow": "2",
 "xmlrpc": "1",
 "Embed": "2",
 "Drupal 8 multilingual demo": "2",
 "Localization server": "1",
 "Drupal.org infrastructure": "4",
 "Acquia Lift Connector": "1",
 "Media entity embeddable video": "1",
 "Drupal-to-Drupal data migration": "2",
 "Migrate": "1",
 "Acquia Connector": "1",
 "Views Templates": "1",
 "Upgrade Status": "5",
 "Node clone": "1",
 "Apache Solr Autocomplete": "1",
 "Translation template extractor": "1"
 }
 },
 {
 "name": "MD Systems",
 "total_count": "344",
 "core_contributions": "39",
 "projects": {
 "Translation Management Tool": "90",
 "Entity Reference Revisions": "3",
 "Salsa Entity": "4",
 "Inline Entity Form": "5",
 "Image Widget Crop": "25",
 "Share Message": "17",
 "Entity Browser": "9",
 "Poll (from core)": "8",
 "OneHourTranslation Translator": "15",
 "Pathauto": "5",
 "Shared Content": "1",
 "Paragraphs": "5",
 "JW Player": "4",
 "Page Manager": "8",
 "Entityform block": "1",
 "TMGMT Translator Microsoft": "1",
 "Simplenews": "12",
 "TMGMT Translator Gengo": "2",
 "Crop API": "4",
 "Swift Mailer": "1",
 "Entity Embed": "3",
 "Better Formats": "1",
 "Field Formatter": "4",
 "TMGMT Translator Google": "1",
 "Mail System": "2",
 "Contact Storage": "1",
 "File Entity Browser": "3",
 "Monitoring": "12",
 "Image Effects": "1",
 "Flag": "7",
 "Search API Solr Search": "4",
 "Collect": "2",
 "dropzonejs": "2",
 "Media entity slideshow": "1",
 "Ultimate Cron": "2",
 "Past Log": "5",
 "Token": "6",
 "Chaos tool suite (ctools)": "4",
 "Media entity": "5",
 "Maillog / Mail Developer": "3",
 "Simplenews Scheduler": "1",
 "Search API": "1",
 "Open Graph meta tags": "1",
 "Media entity embeddable video": "1",
 "Embed": "1",
 "Media entity Twitter": "1",
 "Media entity Instagram": "1",
 "Plugin": "2",
 "CAPTCHA": "1",
 "Metatag": "1",
 "Views Custom Cache Tags": "1",
 "Comment Notify": "1",
 "Display Suite": "1",
 "Allowed Formats": "1",
 "Mailmute": "1"
 }
 },
 {
 "name": "Valuebound",
 "total_count": "231",
 "core_contributions": "56",
 "projects": {
 "Secure Login": "1",
 "Entity Reference Revisions": "1",
 "Panels": "2",
 "Link Click Count": "8",
 "Image Effects": "1",
 "Search API": "5",
 "Scheduler": "2",
 "Auto tagging suggestions": "5",
 "ImageMagick": "1",
 "Inline Entity Form": "1",
 "Entity Browser": "1",
 "Search API Solr Search": "2",
 "FortyTwo": "1",
 "Session Limit": "1",
 "Workbench Notifier": "9",
 "Simplenews Scheduler": "1",
 "Olark Chat": "2",
 "Deploy - Content Staging": "1",
 "Account Settings Tab": "5",
 "Crazy Egg Integration": "1",
 "Google Analytics": "4",
 "MathJax: LaTeX for Drupal": "1",
 "Field Group": "1",
 "Translation Management Tool": "1",
 "Drupal Commerce": "1",
 "Ubercart": "6",
 "Juicebox HTML5 Responsive Image Galleries": "1",
 "Views Slideshow": "2",
 "Colorbox": "5",
 "Content Type Dependency": "7",
 "Commerce Instamojo Payment Gateway": "1",
 "footermap: a footer site map": "1",
 "Toolbar Menu": "1",
 "Admin Toolbar": "1",
 "Link icon": "1",
 "Services Menu": "8",
 "Profile": "1",
 "Pagerer": "1",
 "Acquia Mobile Redirect": "1",
 "Simplify": "1",
 "Examples for Developers": "2",
 "Metatag": "3",
 "Entityqueue": "1",
 "Address": "1",
 "Views Infinite Scroll": "1",
 "Responsive Tables Filter": "1",
 "Features": "4",
 "Clinic Appointment Management System": "1",
 "IMCE": "2",
 "Migrate Tools": "1",
 "Migrate Plus": "1",
 "CCK Select Other": "1",
 "Automated Logout": "2",
 "Webcam Snapshot": "1",
 "Term name validation": "11",
 "Markdown filter": "1",
 "Username Policy": "2",
 "Node Title Validation": "5",
 "PHP": "1",
 "DB Maintenance": "1",
 "Views breadcrumb": "1",
 "Breakpoints": "1",
 "Real Name": "1",
 "Vimeo Video Uploader": "1",
 "Raw Formatter [Meta Tag Formatter]": "2",
 "Recurly": "1",
 "Hierarchical Select": "1",
 "Display Suite": "1",
 "Field Collection Views": "2",
 "SendGrid Integration": "1",
 "Registration invite": "1",
 "Permissions Lock": "1",
 "DownloadFile": "1",
 "BigPipe": "1",
 "DB Index": "1",
 "Views Row Cache": "1",
 "Publish Content": "1",
 "Advertisement": "1",
 "Role help": "2",
 "Monitoring": "1",
 "Link checker": "1",
 "Swift Mailer": "1",
 "Chatroom": "1",
 "Entity connect": "2",
 "Sitemap": "1",
 "Unique field": "2",
 "UUID Features Integration": "1",
 "Dialog": "1",
 "Asset": "1",
 "Quick Edit": "1"
 }
 },
 {
 "name": "PreviousNext",
 "total_count": "187",
 "core_contributions": "16",
 "projects": {
 "aGov": "17",
 "Configuration development": "2",
 "AGLS Metadata": "1",
 "Views Infinite Scroll": "11",
 "Video Embed Field": "11",
 "Colorbox": "17",
 "Entity Print": "8",
 "NG Lightbox": "12",
 "Default Content for D8": "3",
 "Migrate API": "3",
 "TableField": "1",
 "Colorbox Load": "3",
 "Contact Storage": "2",
 "Zen": "29",
 "Image Style Quality": "2",
 "Migrate UI": "26",
 "Commerce Coupon": "1",
 "Moderation State": "7",
 "Dashboard Connector": "6",
 "Editor": "1",
 "Video Embed Dailymotion": "1",
 "Metatag": "6",
 "Link icon": "1"
 }
 },
 {
 "name": "Commerce Guys",
 "total_count": "154",
 "core_contributions": "8",
 "projects": {
 "Drupal Commerce": "42",
 "Services API Keys Authentication": "1",
 "Inline Entity Form": "2",
 "Commerce Discount Extra": "5",
 "Commerce Discount": "17",
 "OAuth2 Server": "2",
 "Commerce Price Table": "1",
 "Commerce Kickstart": "5",
 "Commerce Chase": "1",
 "Commerce Message": "7",
 "Search API attachments": "1",
 "Commerce Reorder": "5",
 "Entity API": "2",
 "Commerce Devel": "3",
 "Profile": "26",
 "Commerce BluePay": "8",
 "Address": "2",
 "State Machine": "2",
 "Commerce Affirm Credit Payment Gateway": "4",
 "Address Field": "1",
 "TFA Basic plugins": "1",
 "Commerce Coupon": "4",
 "Inline Conditions": "1",
 "Commerce Shipping": "1",
 "Commerce Migrate": "1",
 "Commerce features": "1"
 }
 },
 {
 "name": "Deeson",
 "total_count": "119",
 "core_contributions": "3",
 "projects": {
 "Warden": "21",
 "Group Admin Views": "3",
 "Session Limit": "18",
 "Group Menu": "26",
 "Group Context": "2",
 "Elastic Email": "21",
 "Group": "7",
 "Automated Logout": "5",
 "Commerce Webform": "8",
 "Publish Content": "5"
 }
 },
 {
 "name": "Chapter Three",
 "total_count": "139",
 "core_contributions": "101",
 "projects": {
 "Json field": "3",
 "Coder": "3",
 "Configuration installer": "8",
 "SMTP Authentication Support": "1",
 "Doubleclick for Publishers (DFP)": "3",
 "PHP": "1",
 "Inline Entity Form": "2",
 "Drupal Module Upgrader": "1",
 "Workbench Moderation": "2",
 "Token": "2",
 "Features": "4",
 "Geolocation Field": "1",
 "Moderation State": "6",
 "Workflow": "1"
 }
 },
 {
 "name": "Mediacurrent",
 "total_count": "115",
 "core_contributions": "1",
 "projects": {
 "Metatag": "58",
 "Entity Reference Count": "1",
 "Fieldable Panels Panes (FPP)": "1",
 "SMTP Authentication Support": "6",
 "Broadstreet Ads": "2",
 "AdvertServe Ads": "2",
 "Rules": "1",
 "Commerce Message": "1",
 "Commerce Checkout Product List": "2",
 "XML sitemap": "1",
 "Code per Node": "2",
 "Third Party Wrappers": "6",
 "Form Builder": "1",
 "OAuth": "1",
 "Twitter": "3",
 "Webform Features": "4",
 "File (Field) Paths": "1",
 "Author Pane": "1",
 "Storage API": "1",
 "Skinr": "1",
 "Commerce Discount": "2",
 "Pardot Integration": "1",
 "Range": "1",
 "Smartling Connector": "2",
 "Panels": "4",
 "Views data export": "1",
 "Automate API": "1",
 "Geocoder": "1",
 "Imagecache Token": "1",
 "Language Groups": "1",
 "Panels Theme Override": "3"
 }
 },
 {
 "name": "Faichi Solutions Pvt Ltd",
 "total_count": "100",
 "core_contributions": "2",
 "projects": {
 "Project Estimation": "20",
 "Dynamic node Importer": "3",
 "drubot": "6",
 "Sentiment Analysis": "5",
 "Wedding Pigeon": "4",
 "AIML Parser": "1",
 "Country Specific Nodes": "4",
 "Lconnect": "1",
 "Share Buttons by AddToAny": "1",
 "Search 404": "1",
 "ime": "1",
 "incroyable": "1",
 "Picassa Tab": "2",
 "Better Content Picker": "3",
 "Commerce PayU India Payment Gateway": "3",
 "Comment bulk action": "6",
 "ERPAL Platform - Flexible business applications": "1",
 "mvaayoo": "2",
 "Remind it": "1",
 "Two Factor Authentication": "28",
 "Business": "1",
 "Field Collection Views": "1",
 "Node and Comments Form Settings": "1",
 "Exclude Node Title": "1"
 }
 },
 {
 "name": "QED42",
 "total_count": "82",
 "core_contributions": "5",
 "projects": {
 "Automated Logout": "6",
 "Commerce Discount First Time Customer": "3",
 "eForm": "1",
 "Automatic Entity Label": "7",
 "Webform Confirmation": "8",
 "Quora - Related Questions / Posts": "3",
 "Time Spent": "10",
 "Frequently Asked Questions": "4",
 "Social Stats": "5",
 "jquery carousel": "2",
 "Country Specific Nodes": "2",
 "Search Engine Referers": "5",
 "Webform References": "1",
 "Token Variable ": "2",
 "Recovery Password (Email New Password) ": "6",
 "Multi-Step Registration": "6",
 "Webform": "1",
 "Select (or other)": "1",
 "Commerce Braintree": "1",
 "Wget Static - Generate HTML and Save To FTP / Webdav": "3"
 }
 },
 {
 "name": "Tag1 Consulting",
 "total_count": "83",
 "core_contributions": "25",
 "projects": {
 "True Crop": "4",
 "BigPipe": "4",
 "Simple hierarchical select": "1",
 "Menu Views": "2",
 "CPS": "17",
 "Aggregate cache": "5",
 "Inline Entity Form": "1",
 "Manual Crop": "3",
 "Drush update modules": "1",
 "Dynamic Entity Reference": "2",
 "Bootstrap": "9",
 "Service Container": "1",
 "File Dropzone": "4",
 "Entity status": "1",
 "Disqus": "1",
 "db remote": "2"
 }
 },
 {
 "name": "DrupalJedi",
 "total_count": "78",
 "core_contributions": "2",
 "projects": {
 "Disqus": "1",
 "jReject": "16",
 "Search API devel": "1",
 "Image URL Formatter": "1",
 "Ajax facets": "12",
 "Writer": "1",
 "Droogle": "2",
 "Bakery Single Sign-On System": "2",
 "Extended Tools for PHP Execute": "9",
 "amoCRM Widget": "5",
 "Trello": "3",
 "amoCRM Contact": "3",
 "X Reference": "2",
 "Yandex.Maps": "3",
 "Internationalization for commerce product": "1",
 "Geocoder": "2",
 "Commit author": "1",
 "Search API": "1",
 "VK CrossPoster": "2",
 "Node.js integration": "1",
 "Asset": "1",
 "amoCRM Form": "1",
 "Feeds": "1",
 "2gis maps": "1",
 "Rules action with node.js": "1",
 "Be sure": "1",
 "Spambot ": "1"
 }
 },
 {
 "name": "Axelerant",
 "total_count": "69",
 "core_contributions": "26",
 "projects": {
 "Views Save": "1",
 "Country Specific Nodes": "1",
 "Token": "29",
 "Geocoder": "2",
 "Google Analytics": "1",
 "Piwik Web Analytics": "1",
 "Mark-a-Spot ": "1",
 "Simplenews Scheduler": "1",
 "Simplenews": "1",
 "Share Message": "1",
 "Pardot Integration": "1",
 "RoleAssign": "1",
 "Taarikh": "2"
 }
 },
 {
 "name": "FFW",
 "total_count": "59",
 "core_contributions": "15",
 "projects": {
 "OAuth2 Server": "1",
 "HybridAuth Social Login": "1",
 "Google Currency Converter": "5",
 "jReject": "1",
 "Admin Toolbar": "1",
 "Workflow": "1",
 "Casper": "1",
 "Facets": "2",
 "Pathauto i18n": "1",
 "Apachesolr Reference": "1",
 "Panels Cache Expiration": "1",
 "User profile comments": "1",
 "Pathauto": "1",
 "Relative Path to Absolute URLs": "1",
 "NetX": "1",
 "Context docket": "1",
 "GMap Module": "1",
 "Views docket": "1",
 "simpleSAMLphp Authentication": "4",
 "Encrypt": "1",
 "Multiple numeric filter for Views": "1",
 "Table Element": "1",
 "Lingotek Translation": "1",
 "Share Message": "1",
 "RELAXed Web Services": "1",
 "Apache Solr Views": "1",
 "Embed": "1",
 "Elasticsearch Connector": "3",
 "Comment Permissions": "1",
 "Quiz": "1",
 "Linkit - Enriched linking experience": "1",
 "Entity Browser": "1",
 "Commerce Smartpay": "1",
 "Serial Field": "1"
 }
 },
 {
 "name": "Wunderkraut",
 "total_count": "54",
 "core_contributions": "18",
 "projects": {
 "Inline Entity Form": "3",
 "Address Field Email": "1",
 "Chaos tool suite (ctools)": "1",
 "Image URL Formatter": "1",
 "Configuration installer": "2",
 "Admin Toolbar": "2",
 "Reference value pair": "1",
 "UseBB2Drupal": "1",
 "Google Map Field": "1",
 "Frequently Asked Questions": "1",
 "Migrate Tools": "1",
 "OpenID Connect": "1",
 "OAuth": "1",
 "Metatag": "1",
 "Image Widget Crop": "1",
 "Field Group": "1",
 "TableField": "1",
 "File Entity (fieldable files)": "1",
 "Views Menu Node Children Filter": "1",
 "IMCE plupload": "1",
 "Token": "1",
 "Media entity embeddable video": "2",
 "Coffee": "2",
 "Flag": "1",
 "MailChimp": "1",
 "Elasticsearch Connector": "1",
 "Webform view": "1",
 "DocBinder": "1",
 "Field collection": "1",
 "Migrate Source CSV": "1"
 }
 },
 {
 "name": "Lullabot",
 "total_count": "50",
 "core_contributions": "6",
 "projects": {
 "Workbench Moderation": "4",
 "Pathauto": "4",
 "XML sitemap": "3",
 "User Guide": "4",
 "Flysystem - S3": "1",
 "TagCloud": "1",
 "OAuth": "2",
 "Field collection": "5",
 "Metatag": "3",
 "Token": "2",
 "Breakpoints": "1",
 "Views Infinite Scroll": "1",
 "Chaos tool suite (ctools)": "1",
 "Liberty": "6",
 "Login Domain": "2",
 "Migrate Source JSON": "2",
 "Respond.js": "1",
 "Migrate Source CSV": "1"
 }
 },
 {
 "name": "Druid",
 "total_count": "49",
 "core_contributions": "16",
 "projects": {
 "Pathauto": "1",
 "Views": "1",
 "Views Entity Reference Filter": "4",
 "Plugin": "15",
 "Address": "2",
 "Search API": "1",
 "Currency": "3",
 "Facets": "1",
 "Payment": "1",
 "Display Suite": "4"
 }
 },
 {
 "name": "Young Globes",
 "total_count": "46",
 "core_contributions": "1",
 "projects": {
 "Outlook Events": "2",
 "Disable Edit": "3",
 "Node Class": "1",
 "Node type class": "2",
 "GitHub": "2",
 "Link Click Count": "1",
 "Taxonomy form block": "12",
 "Comment Anonymizer": "4",
 "Quick Admin Modules": "9",
 "IP address manager": "1",
 "Breakpoints": "1",
 "Entity Bulk Delete UI": "5",
 "Commerce Kickstart": "1",
 "Unique field": "1"
 }
 },
 {
 "name": "ACTO Team",
 "total_count": "45",
 "core_contributions": "1",
 "projects": {
 "Image Widget Crop": "17",
 "Entity Browser": "8",
 "Translation Management Tool": "7",
 "Crop API": "1",
 "Field Formatter": "4",
 "Salsa Entity": "1",
 "Image Effects": "1",
 "Media entity slideshow": "1",
 "Inline Entity Form": "2",
 "Entity Embed": "1",
 "File Entity Browser": "1"
 }
 },
 {
 "name": "Liip AG",
 "total_count": "36",
 "core_contributions": "3",
 "projects": {
 "Commerce CIB": "2",
 "Ajax facets": "1",
 "Search API Entity Translation": "6",
 "Authenticated User Page Caching (Authcache)": "1",
 "Focal Point": "1",
 "Autosave": "1",
 "Field collection tabs widget": "2",
 "Leaflet views AJAX popups": "1",
 "Address": "2",
 "Localization update": "1",
 "Commerce Datatrans": "2",
 "Profile": "2",
 "Feeds Tamper Conditional": "1",
 "Magnific Popup": "1",
 "Commerce Feeds multitype": "2",
 "Drupal Commerce": "4",
 "Picture": "1",
 "Facetapi Select": "1",
 "Search API": "1"
 }
 },
 {
 "name": "CI&T",
 "total_count": "34",
 "core_contributions": "10",
 "projects": {
 "IMCE Tools": "1",
 "Panels": "1",
 "Google Currency Converter": "1",
 "Examples for Developers": "1",
 "Warden": "1",
 "Require Login": "1",
 "Apachesolr Reference": "1",
 "Commerce Currency Settings": "1",
 "Migrate Tools": "1",
 "Webform share": "1",
 "Facets": "1",
 "Any Menu Path": "1",
 "OpenLucius News": "1",
 "Features": "2",
 "bootstrap_carousel": "2",
 "Moderation State": "1",
 "Mobile Detect": "1",
 "Comment RSS": "1",
 "Media entity": "1",
 "Registration transitions": "1",
 "Domain Traversal": "1",
 "Workflow": "1"
 }
 },
 {
 "name": "Palantir.net",
 "total_count": "34",
 "core_contributions": "8",
 "projects": {
 "Workbench Moderation": "21",
 "Inline Entity Form": "1",
 "Doubleclick for Publishers (DFP)": "1",
 "Moderation State": "3"
 }
 },
 {
 "name": "Skilld",
 "total_count": "33",
 "core_contributions": "21",
 "projects": {
 "Default Content for D8": "1",
 "Custom add another": "1",
 "REST UI": "1",
 "Contact Storage": "1",
 "Password Policy": "2",
 "Commerce Free Shipping": "1",
 "Payment for Drupal Commerce": "1",
 "UUID Features Integration": "2",
 "Masquerade": "2"
 }
 },
 {
 "name": "UEBERBIT GmbH",
 "total_count": "31",
 "core_contributions": "13",
 "projects": {
 "Pathauto": "1",
 "Entity Browser": "2",
 "Metatag": "2",
 "Swift Mailer": "7",
 "Leaflet views AJAX popups": "2",
 "Video Embed Field": "1",
 "Migrate Plus": "1",
 "geoPHP": "1",
 "Name Field": "1"
 }
 },
 {
 "name": "Lingotek",
 "total_count": "30",
 "core_contributions": "4",
 "projects": {
 "Lingotek Translation": "26"
 }
 }
 ]


 */