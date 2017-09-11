window.loadLeverJobs = function (options) {

  //Checking for potential Lever source or origin parameters
  var pageUrl = window.location.href;
  var leverParameter = '';
  var trackingPrefix = '?lever-'

  if( pageUrl.indexOf(trackingPrefix) >= 0){
    // Found Lever parameter
    var pageUrlSplit = pageUrl.split(trackingPrefix);
    leverParameter = '?lever-'+pageUrlSplit[1];
  }

  var tagsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
  };

  function replaceTag(tag) {
      return tagsToReplace[tag] || tag;
  }

  function sanitizeHTML(str) {
      return str.replace(/[&<>]/g, replaceTag);
  }

  //Functions for checking if the variable is unspecified and removing script tags + null check
  function sanitizeAttribute(string) {
    if (string == '' || typeof string == 'undefined' ) {
      return;
    }
    string = sanitizeHTML(string);
    return string.replace(/\s+/ig, "");
  }

  // Adding the account name to the API URL
  var url = 'https://api.lever.co/v0/postings/' + options.accountName + '?group=team&mode=json';

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
        var postingTitle = sanitizeHTML(posting.text);
        var location = (posting.categories.location || 'Uncategorized');
        var locationsanitizeAttribute = sanitizeAttribute(location);
        var commitment = (posting.categories.commitment || 'Uncategorized');
        var commitmentsanitizeAttribute = sanitizeAttribute(commitment);
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

    for(var i = 0; i < groupedPostings.length; i++) {

      content += '<ul class="lever-jobs-list ' + groupedPostings[i].department + '">';
      content += '<li class="lever-department ' + groupedPostings[i].department + '"><h3 class="lever-department-title">' + groupedPostings[i].departmentTitle + '</h3></li>';

      for (j = 0; j < groupedPostings[i].teams.length; j ++) {

        content += '<li class="lever-team ' + groupedPostings[i].teams[j].team + '"><h4 class="lever-team-title">' + groupedPostings[i].teams[j].teamTitle + '</h4></li>';

        for (var k = 0; k < groupedPostings[i].teams[j].postings.length; k ++) {
          content += '<li class="lever-job ' + sanitizeAttribute(groupedPostings[i].teams[j].postings[k].categories.team) + ' ' + sanitizeAttribute(groupedPostings[i].teams[j].postings[k].categories.location) + ' ' + sanitizeAttribute(groupedPostings[i].teams[j].postings[k].categories.commitment) + '">' +
          '<a class="lever-job-title" href="' + groupedPostings[i].teams[j].postings[k].hostedUrl + '"">' + groupedPostings[i].teams[j].postings[k].text + '</a><span class="lever-job-tag">' + (groupedPostings[i].teams[j].postings[k].categories.location || '') + '</span></li>';
          //TODO – need to order depts/teams/postings alphabetically
          // TODO - need to check what will happen if the company doesn't use departments
        }

      }



    }


    // content += '<ul class="lever-jobs-list ' + titlesanitizeAttribute + '">';
    // content += '<li class="lever-team ' + titlesanitizeAttribute + '"><h3 class="lever-team-title">' + title + '</h3></li>';

    // content += '<li class="lever-job ' + teamsanitizeAttribute + ' ' + locationsanitizeAttribute + ' ' + commitmentsanitizeAttribute + '">' +
    // '<a class="lever-job-title" href="' + link + '"">' + postingTitle + '</a><span class="lever-job-tag">' + location + '</span></li>';
    content += '</ul>';
    document.getElementById("lever-jobs-container").innerHTML = content;
    console.log("groupedPostings", groupedPostings);
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
    }
  };

  request.onerror = function() {
    console.log("Error fetching jobs.");
  };

  request.send();


};

window.loadLeverJobs(window.leverJobsOptions);
