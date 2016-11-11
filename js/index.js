$( "button" ).on( "click", function() {

  var inputAccountName = $('#account').val();

  var postingsCode = "&lt;div id='lever-jobs-container'&gt;&lt;/div&gt;&lt;script type='text/javascript'&gt;window.leverJobsOptions = {accountName: '" + inputAccountName +"', includeCss: true};&lt;/script&gt;&lt;script type='text/javascript' src='https://andreasmb.github.io/lever-jobs-embed/index.js'&gt;&lt;/script&gt;";

  $(".success, .error").remove();
  if (inputAccountName.length) {
    $("#code").append('<p class="success">'+postingsCode+'</p>');
  } else {
    $("#code").append('<p class="error">You need to enter your account name</p>');
  }

});
