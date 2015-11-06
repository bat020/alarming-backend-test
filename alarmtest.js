$(document).ready(function () {

  var ref = new Firebase('https://blazing-fire-4780.firebaseio.com/alarming');
  var usersRef = ref.child('users');
  var eventsRef = ref.child('events');
  var currentUser = ref.getAuth();

  // event viewing stuff

  $('#view-button').click(function () {
    usersRef.child(currentUser.uid).on('value', viewEvents);
    $('#create-status').text('');
    $('#create-form').hide();
    $('#view-list').show();
  });

  function viewEvents(snapshot) {
    var events = snapshot.val().events;
    var eventTitles = [];
    for (var eventId in events) {
      eventsRef.child(eventId + '/title').once('value', function (snapshot) {
        eventTitles.push(snapshot.val());
      });
    }
    if (events) {
      $('#view-status').text('Here are your events: ' + eventTitles.join(', '));
    } else {
      $('#view-status').text('No events found');
    }
  };

  // event creation stuff

  $('#create-button').click(function () {
    $('#create-status').text('Enter event details');
    $('#create-form').show();
    $('#view-list').hide();
  });

  $('#submit-button').click(function (){
    var titleString = $('#title').val()
    saveNewEvent(titleString);
    $('#create-status').text(titleString + ' created');
    $('#title').val('');
    $('#create-form').hide();
  });

  eventsRef.on('child_added', function (snapshot) {
    var ownerRef = usersRef.child(snapshot.val().owner);
    var newNode = {};
    newNode[snapshot.key()] = true;
    ownerRef.child('events').update(newNode);
  });

  function saveNewEvent(titleString) {
    var eventPath = eventsRef.push({
      title: titleString,
      owner: currentUser.uid
    });
  };

  // user authentication stuff

  $('#logout-button').click(function () {
    ref.unauth();
    currentUser = null;
    $('#create-status').text('');
    $('#create-form').hide();
    $('#view-list').hide();
  });

  $('#login-button').click(function () {
    ref.authWithPassword({
      email: $('#email').val(),
      password: $('#password').val()
    }, loginHandler);
  });

  $('#signup-button').click(function () {
    ref.createUser({
      email: $('#email').val(),
      password: $('#password').val()
    }, signupHandler);
  });

  ref.onAuth(authDataChange);

  function loginHandler(error, authData) {
    if (error) {
      $('#status-message').text(error);
    } else {
      clearLoginForm();
      currentUser = authData;
      usersRef.child(authData.uid).on('value', viewEvents);
    }
  };

  function signupHandler(error, userData) {
    if (error) {
      $('#status-message').text(error);
    } else {
      saveNewUser(userData.uid, $('#email').val());
      ref.authWithPassword({
        email: $('#email').val(),
        password: $('#password').val()
      }, loginHandler);
    }
  }

  function authDataChange(authData) {
    if (authData) {
      $('#status-message').text(authData.password.email + " is logged in");
      $('#user-buttons').show();
      $('#login-form').hide();
    } else {
      $('#status-message').text("Please log in or sign up");
      $('#user-buttons').hide();
      $('#login-form').show();
    }
  };

  function clearLoginForm() {
    $('#email').val('');
    $('#password').val('');
  };

  function saveNewUser(userId, userEmail) {
    usersRef.child(userId).set({
      email: userEmail
    });
  };

});
