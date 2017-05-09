
$(document).ready(function() {
	var config = {
	    apiKey: "AIzaSyAuz8vPo_4T-mNW0FolyaUhkS8mVXHacHg",
	    authDomain: "super-cool-project-e16f4.firebaseapp.com",
	    databaseURL: "https://super-cool-project-e16f4.firebaseio.com",
	    projectId: "super-cool-project-e16f4",
	    storageBucket: "super-cool-project-e16f4.appspot.com",
	    messagingSenderId: "585394604169"
  	};
	firebase.initializeApp(config);	

	// Firebase database reference //
	var dbChatRoom = firebase.database().ref().child('chatroom');	// reference to object chatroom //
	var dbUser = firebase.database().ref().child('user'); // reference to object user //

	const $signInWindow = $('#signInWindow');
	const $outsiderWindow = $('#outsiderWindow');
	const $email = $('#email');
	const $password = $('#password');
	const $btnSignUp = $('#btnSignUp');
	const $btnSignIn = $('#btnSignIn');
	const $btnSignOut = $('#btnSignOut');
	const $profileImageAnchor = $('#profileImageAnchor');

	var user = firebase.auth().currentUser;
	updateUI(user);

	// SignUp //
	$btnSignUp.click(function(e) {
		const email = $email.val();
		const password = $password.val();
		const auth = firebase.auth();

		// async method //
		const promise = auth.createUserWithEmailAndPassword(email, password);

		// promise failed, execute the following function (catch(exception)) //
		promise.catch(function(e) {
			console.log(e.message);
		});

		// promise success, execute the function then(user) //
		promise.then(function(user) {
			console.log("Hello, " + user.email);
			const dbUserId = dbUser.child(user.uid);
			
			/*var src = firebase.storage().ref('/images/default.png').getDownloadURL().then(function(url) {
				// set -> new data set //
				return url;
			});	*/
			// set user data to firebase //
			dbUserId.set({
				email: user.email,
				name: '',
				occuption: '',
				age: '',
				description: '',
				photoURL: 'https://firebasestorage.googleapis.com/v0/b/super-cool-project-e16f4.appspot.com/o/images%2Fdefault.png?alt=media&token=eb881640-e96a-4e36-b675-983ab44e55a8'
			});
		});
	});

	// Sign in //
	$btnSignIn.click(function(e) {
		const email = $email.val();
		const password = $password.val();
		const auth = firebase.auth();

		const promise = auth.signInWithEmailAndPassword(email, password);
		promise.catch(function(e) {
			console.log(e.message);
		});
		promise.then(function() {
			console.log("Sign in");
		});
	});

	// Sign out //
	$btnSignOut.click(function() {
		firebase.auth().signOut();
	});

	// Auth listener //
	firebase.auth().onAuthStateChanged(function(user) {
		updateUI(user);
	});

	// Click the profile image //
	$profileImageAnchor.click(function() {
		$('#file').trigger('click');	// open file dialog //
		$("#file").change(uploadImage);	// the behaviour of user doing in open file dialog //
	});

	function uploadImage() {
		var file = $(this)[0].files[0];				// get the input file //
		console.log(file.name);
		if(file) {									// if the file is not empty, upload the input file to firebase storage //		
			var storage = firebase.storage().ref();
			storage.child('images/' + file.name).put(file).then(function(snapshot) {
				console.log("update success");
				var photoURL = snapshot.metadata.downloadURLs[0];
				var user = firebase.auth().currentUser;
				firebase.database().ref().child('user/' + user.uid).update({
					photoURL: photoURL
				});
				$('#profileImage').attr('src', photoURL);
			}).catch(function(e) {
				console.log(e.message);
			});
		}
		else {										// closed the open file dialog by cancel or close //
			console.log("close");
		}
	}

	$('#update').click(function() {
		var name = $('#settingsName').val();
		var occuption = $('#settingsOccuption').val();
		var age = $('#settingsAge').val();
		var description = $('#settingsDescription').val();

		var user = firebase.auth().currentUser;
		const dbUserId = dbUser.child(user.uid);
		console.log(name);
		dbUserId.update({
			name: name,
			occuption: occuption,
			age: age,
			description: description
		}).then(updateUI(user));	// update user data to firebase //
	});

	$('#send').click(function() {
		var message = $('#msg').val();
		var user = firebase.auth().currentUser;
		console.log(message);
		if(message) {
			dbChatRoom.push({
				uid: user.uid,
				message: message
			});

			$('#msg').val('');
		}
	});
});

function updateUI(user) 
{
	/*var src;
	firebase.storage().ref('/images/default.png').getDownloadURL().then(function(url) {
		// set -> new data set //
		src = url;
	});	
	console.log(src);*/
	
	// user login //
	if(user) {
		$('#btnSignIn').attr('disabled', 'disabled');
		$('#signInWindow').css('display', 'none');
		$('#btnSignOut').removeAttr('style');
		$('#outsiderWindow').removeAttr('style');
		firebase.database().ref('/user/' + user.uid).once('value').then(function(snapshot) {
			var data = snapshot.val();
			updateProfile(data);
			updateSettings(data);
			updateChatroom();
		});
	}
	// no user //
	else {
		console.log('no user');
		$('#btnSignIn').removeAttr('disabled');
		$('#signInWindow').removeAttr('style');
		$('#btnSignOut').css('display', 'none');
		$('#outsiderWindow').css('display', 'none');
	}

	
}

function updateProfile(data)
{
	$('#name').html((data.name) ? data.name : "unknown");
	//$('#occuption').html((data.occuption) ? data.occuption : "unknown");
	//$('#age').html((data.age) ? data.age : "unknown");
	$('#detail').html("age." + ((data.age) ? data.age : "unknown") + ", " + ((data.occuption) ? data.occuption : "unknown"));
	$('#description').html((data.description) ? data.description : "unknown");
	$('#profileImage').attr('src', data.photoURL);
}

function updateSettings(data)
{
	$('#settingsProfileImage').attr('src', data.photoURL);
	$('#settingsName').val(data.name);
	$('#settingsOccuption').val(data.occuption);
	$('#settingsAge').val(data.age);
	$('#settingsDescription').html(data.description);
	updateClassOnMaterialTextfield($('#settingsName'));
	updateClassOnMaterialTextfield($('#settingsOccuption'));
	updateClassOnMaterialTextfield($('#settingsAge'));
	updateClassOnMaterialTextfield($('#settingsDescription'));
}

function updateClassOnMaterialTextfield(ui)
{
	if(ui.val())
		ui.parent().addClass('is-dirty');
	else
		ui.parent().removeClass('is-dirty');
}

function updateChatroom()
{
	$('#messages-field').empty();
	var dbChatRoom = firebase.database().ref().child('chatroom');
	dbChatRoom.limitToLast(15).on('child_added', function(snapshot){
      	var data = snapshot.val();
      	var message = data.message;
      	var uid = data.uid;
      	var $messageElement = $("<li>");
      	var $senderImg = $("<img src='' class='chat-image'>");
      	var $nameElement = $("<h4>").addClass('chat-name');
      	var $messageText = $("<div>").addClass('chat-text').text(data.message);
      	
      	if (uid == firebase.auth().currentUser.uid) {
        	$messageElement.addClass('avatar');
        	$messageElement.append($nameElement).append($senderImg).append($messageText);
      	} else {
      		$messageElement.addClass('other');
      		$messageElement.append($senderImg).append($nameElement).append($messageText);
    	}

    	firebase.database().ref('/user/' + uid).once('value').then(function(snapshot) {
    		$senderImg.attr('src', snapshot.val().photoURL);
    		$nameElement.text(snapshot.val().name);
    		
    	});

    	$('#messages-field').append($messageElement);
    	$('#messages-field')[0].scrollTop = $('#messages-field')[0].scrollHeight;
    });
}
