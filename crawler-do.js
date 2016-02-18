companies = [];
var casper = require('casper').create({
  //verbose: true,
  //logLevel: "debug"
});

//casper.on('remote.message', function(msg) {
//  this.echo('remote message caught: ' + msg);
//});

casper.start('https://www.drupal.org/happyculture', function() {
  var company_details = { name: '', total_count: 0, core_contributions: 0, projects: {}};

  // Fetch the company name.
  company_details.name = this.fetchText('#page-subtitle');
  this.echo('Crawling ' + company_details.name + ' contributions.');

  // Check the contributions count, if it exists.
  if (this.exists('#issue-credit')) {
    var contributions_stats = this.fetchText('#issue-credit');
    this.echo(contributions_stats);

    // String patterns:
    // Credited on 26 issues fixed in the past 3 months
    // Credited on 1 issue fixed in the past 3 months
    var pattern = /Credited on ([\d, ]+) issues? fixed in the past 3 months/;
    company_details.total_count = contributions_stats.replace(pattern, "$1");
    this.echo('# contributions: ' + company_details.total_count);

    // Now, extract the projects name that received patches.
    projects_name = this.evaluate(function () {
      var links = document.querySelectorAll('.view-issue-credit ul li span.views-field-title-1 a');
      return Array.prototype.map.call(links, function(e) {
        return e.innerHTML;
      });
    });

    // Then extract the issues count associated to those projects.
    projects_issues = this.evaluate(function () {
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
    this.echo('No contribution found.');
  }
  companies.push(company_details);
});

casper.run(function() {
  require('utils').dump(companies);
});
