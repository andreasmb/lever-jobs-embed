window.loadLeverJobs = function (options) {

  //Checking for potential Lever source or origin parameters
  var pageUrl = window.location.href;
  var leverParameter = '';
  var trackingPrefix = '?lever-';
  // Define the container where we will put the content (or put in the body)
  var jobsContainer = document.getElementById("lever-jobs-container") || document.body;

  if( pageUrl.indexOf(trackingPrefix) >= 0){
    // Found Lever parameter
    var pageUrlSplit = pageUrl.split(trackingPrefix);
    leverParameter = '?lever-'+pageUrlSplit[1];
  }

  var htmlTagsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
  };

  var attributeTagsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
  };

  function replaceTag(tag) {
      return htmlTagsToReplace[tag] || tag;
  }

  function sanitizeHTML(str) {
      return str.replace(/[&<>]/g, replaceTag);
  }

  //Functions for checking if the variable is unspecified and removing script tags + null check
  function sanitizeAttribute(string) {
    if (string == '' || typeof string == 'undefined' ) {
      return 'uncategorized';
    }
    string = sanitizeHTML(string);
    return string.replace(/\s+/ig, "");
  }

  // Adding the account name to the API URL
  var url = 'https://api.lever.co/v0/postings/' + options.accountName + '?group=team&mode=json';

  //Create an object ordered by department and team
  function createJobs(_data) {
    if (!_data) return;

    var content = "";
    var groupedPostings = [];

    for(var i = 0; i < _data.length; i++) {
      if (!_data[i]) continue;
      if (!_data[i].postings) continue;
      if (!(_data[i].postings.length > 0)) continue;

      var title = sanitizeHTML(_data[i].title || 'Uncategorized');
      var titlesanitizeAttribute = sanitizeAttribute(title);


      for (j = 0; j < _data[i].postings.length; j ++) {
        var posting = _data[i].postings[j];
        var team = (posting.categories.team || 'Uncategorized' );
        var teamsanitizeAttribute = sanitizeAttribute(team);
        var department = (posting.categories.department || 'Uncategorized' );
        var departmentsanitizeAttribute = sanitizeAttribute(department);
        var link = posting.hostedUrl+leverParameter;

        function findDepartment(element) {
          return element.department == departmentsanitizeAttribute;
        }

        if (groupedPostings.findIndex(findDepartment) === -1) {

          newDepartmentToAdd = {department : departmentsanitizeAttribute, departmentTitle: department, teams : [ {team: teamsanitizeAttribute, teamTitle: team, postings : []} ] };
          groupedPostings.push(newDepartmentToAdd);
        }
        else {

          departmentIndex = groupedPostings.findIndex(findDepartment);
          newTeamToAdd = {team: teamsanitizeAttribute, teamTitle: team, postings : []};

          if (groupedPostings[departmentIndex].teams.map(function(o) { return o.team; }).indexOf(teamsanitizeAttribute) === -1) {
            groupedPostings[departmentIndex].teams.push(newTeamToAdd);
          }
        }
        function findTeam(element) {
          return element.team == teamsanitizeAttribute;
        }
        departmentIndex = groupedPostings.findIndex(findDepartment);
        teamIndex = groupedPostings[departmentIndex].teams.findIndex(findTeam);
        groupedPostings[departmentIndex].teams[teamIndex].postings.push(posting);

      }

    }

    // Sort by department
    groupedPostings.sort(function(a, b) {
      var departmentA=a.department.toLowerCase(), departmentB=b.department.toLowerCase()
      if (departmentA < departmentB)
          return -1
      if (departmentA > departmentB)
          return 1
      return 0
    });

    for(var i = 0; i < groupedPostings.length; i++) {

      // If there are no departments used, there is only one "unspecified" department, and we don't have to render that.
      if (groupedPostings.length >= 2) {
        var haveDepartments = true;
      };

      if (haveDepartments) {
        content += '<section class="lever-department" data-department-title="' + groupedPostings[i].department + '"><h3 class="lever-department-title">' + sanitizeHTML(groupedPostings[i].departmentTitle) + '</h3>';
      };

      for (j = 0; j < groupedPostings[i].teams.length; j ++) {

        content += '<ul class="lever-team" data-team="' + groupedPostings[i].teams[j].team + '"><li><h4 class="lever-team-title">' + sanitizeHTML(groupedPostings[i].teams[j].teamTitle) + '</h4><ul>';

        for (var k = 0; k < groupedPostings[i].teams[j].postings.length; k ++) {
          content += '<li class="lever-job" data-team="' + groupedPostings[i].teams[j].postings[k].categories.team + '" data-location="' + groupedPostings[i].teams[j].postings[k].categories.location) + '"data-work-type="' + sanitizeAttribute(groupedPostings[i].teams[j].postings[k].categories.commitment) + '">' +
          '<a class="lever-job-title" href="' + groupedPostings[i].teams[j].postings[k].hostedUrl + '"">' + sanitizeHTML(groupedPostings[i].teams[j].postings[k].text) + '</a><span class="lever-job-tag">' + (sanitizeHTML(groupedPostings[i].teams[j].postings[k].categories.location || '')) + '</span></li>';
        }

        content += '</ul></li></ul>';

      }
      if (haveDepartments) {
        content += '</section>';
      };
    }

    content += '</ul>';
    jobsContainer.innerHTML = content;
  }

  if (options.includeCss) {
    function addCss(fileName) {
      var head = document.head
        , link = document.createElement('link');

      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = fileName;

      head.appendChild(link);
    }
    addCss('https://andreasmb.github.io/lever-jobs-embed/embed-css/style.css');
  }

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = "json";

  request.onload = function() {
    if (request.status == 200) {
      createJobs(request.response);
    } else {
      console.log("Error fetching jobs.");
      jobsContainer.innerHTML = "<p class='lever-error'>Error fetching jobs.</p>";
    }
  };

  request.onerror = function() {
    console.log("Error fetching jobs.");
    jobsContainer.innerHTML = "<p class='lever-error'>Error fetching jobs.</p>";
  };

  request.send();


};

window.loadLeverJobs(window.leverJobsOptions);
