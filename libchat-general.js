/** @preserve
	Chat Widget
	University of St. Thomas Libraries
	May 03, 2017
	
	Full Code and Documentation available at:
	https://github.com/USTLibraries/Chat-Widget
	
*/

/*	
	https://jscompress.com/ was used to create minified js version
	https://cssminifier.com/ was used to create the minified css version

	This basically places a LibChat chat box inside of a nice pull up menu. 
	It switches to a pop out (new window) on mobile phones (small screen width)
	It requires both a Pop Out Widget, an In Page Widget, and a Slide Up Widget to be created in LibChat first
	It could be modified to encapsulate any chat service.
	
*/

(function () {
								
	/* *****************************************************************
	 * CUSTOM VARIABLES
	 */

	var ver = "2.0.0-20170504"; // just something to check for in the Browser Console, does nothing else
	
	var url = "https://api2.libanswers.com/1.0/chat/widgets/status/[yourInstID]"; // The location of the API - we use the default Chat Box to check availability	
	var libChatPopOutID = "[d0d...LibChat Pop Out ID...ef5]"; // pop out chat for mobile
	var libChatInPageID = "[a45...LibChat In Page ID...799]"; // bottom up for tablet/desktop
	var libChatNoJQuery = "[56b...LibChat Slide Up ID..dea]"; // vanilla libchat to use if jQuery not available
	var checkRate_ms = 15 * 1000; // 10 seconds = 10 * 1000; 15 seconds = 15 * 1000
	
	/* 
	 * END CUSTOM VARIABLES
	 * Yep, that's it. No other code changes are necessary in this .js file
	 ***************************************************************** */

	console.log("CHAT: Version "+ver);

	// Check to see if jQuery is available
	if (  typeof($) !== "undefined" ) {

		$( document ).ready( function() { 

			// FUNCTION VARIABLE
			var currentStatus = false;


			// **************************************************************************************************
			// * FUNCTIONS


			// FUNCTION check against returned JSON data
			var isAvailable = function(d){ return ( d.online === true ); }; // returns true or false	

			// FUNCTION check window height -- if it is too small it is best to give user a pop out window rather than in page
			var isSmallScreen = function(){ return (window.innerWidth < 600 || window.innerHeight < 600); }; // returns true or false

			// FUNCTION for bounce/visual effect so that we don't need to load jQuery UI
			// also .effect forces a reload the iframe within whereas .animate does not
			var bounce = function(element, myDistance) {
				var div = $(element);
				var interval = 300;
				var distance = myDistance;
				var times = 2;

				//$(div).css('position', 'relative');

				for (var iter = 0; iter < (times + 1) ; iter++) {
					$(div).animate({
						bottom: ((iter % 2 === 0 ? distance : distance * -1))
					}, interval);
				}                                                                                                          
				$(div).animate({ bottom: 0 }, interval);
			};

			// *********************************************
			// generateChat() - this will kick things off when called

			var generateChat = function() {

				// **************************************************************************************************

				// This is sent as a callback once the api has been checked
				// It initializes the chat window and then calls a function
				// to display either available or not available
				var display = function(data) {

					$("#c92-chat > div > a").attr("href","#");

					// section off box into two parts, header (div:first-child) and content (div:last-child) and move <a> into first div
					$("#c92-chat").append("<div></div>");

					// set window as collapsed
					$("#c92-chat").addClass("collapsed");
					$("#c92-chat").attr("data-chat-clicked","false");

					// add the click event for the header
					$("#c92-chat > div:first > a, #c92-chat > div:first").click(function() { 

						var boxWindowElem = $(this).closest("#c92-chat");

						// toggle
						if ($(boxWindowElem).hasClass("expanded")) {
							$(boxWindowElem).removeClass("expanded").addClass("collapsed");

						} else {
							$(boxWindowElem).removeClass("collapsed").addClass("expanded");
							$(boxWindowElem).attr("data-chat-clicked","true");
						}

						return false;

					}); // end click event function

					// show the content in the chat window
					setDisplay(isAvailable(data));

					// recheck status every x seconds
					var checkDisplay = function(d){ if (currentStatus !== isAvailable(d)) { setDisplay(isAvailable(d)); } };
					window.setInterval( function() { checkAvailability(checkDisplay); }, checkRate_ms );

					// add bounce (desktop/large tablet only, and only twice)
					if(!isSmallScreen()) {

						// initial bounce (small distance)
						bounce($("#c92-chat"), 1);

						// one more bounce (larger distance) AND only if not interacted with
						window.setTimeout(function() {
							bounce( $("div[data-chat-clicked='false']#c92-chat"), 15);
						}, (1000 * 90) ); // wait 90 seconds
					}

				}; 

				// **************************************************************************************************

				// if the HTML placeholder doesn't exist, create it
				var boxWindow = $("#c92-chat");
				if (!$(boxWindow).length) {

					$("body").append("<div id='c92-chat'><div><a></a></div></div>");
					$("#c92-chat > div > a").attr("href","http://www.stthomas.edu/libraries/ask");
					$("#c92-chat > div > a").text("Ask a UST Librarian");

					boxWindow = $("#c92-chat");

					// Bring in the stylesheet
					if ($(boxWindow).css("position") !== "fixed" ) {
						 $("head").append("<link id='style-c92-chat' rel='stylesheet' type='text/css' href='https://static.stthomas.edu/libraries/js/chat/libchat.css' />");
					}  
				}

				checkAvailability(display);

			};

			// END FUNCTION: generateChat()
			// *********************************************

			// *********************************************
			// START FUNCTION: setDisplay()

			var setDisplay = function(status) {
				currentStatus = status;
				console.log("Chat Online: " + status);
				console.log("Chat for Small Screen: " + isSmallScreen());

				var script = document.createElement("script");
				var div = document.createElement("div");		

				// evaluate avaliability and screen size and present appropriate chat to user
				if(status) { // UST Librarian is available

					if (isSmallScreen()) { // Small screen
						var chatBtn = document.createElement("div");
						$(chatBtn).attr("id", "libchat_"+libChatPopOutID);
						$(div).addClass("c92btnwrap");
						$(div).append(chatBtn);
						$(script).attr("src", "https://v2.libanswers.com/load_chat.php?hash="+libChatPopOutID);
					} else { // desktop or larger tablet
						$(div).attr("id", "libchat_"+libChatInPageID);
						$(script).attr("src", "https://v2.libanswers.com/load_chat.php?hash="+libChatInPageID);
					}


				} else { // UST Librarian is NOT available

					 // No chat so we set to a recommended actions page
					 var iframe = document.createElement("iframe");
					 $(iframe).attr( {
						 src: "https://static.stthomas.edu/libraries/js/chat/not-available.html?v=40",
						 title: "Chat window",
						 scrolling: "no"
					 });

					 $(div).append(iframe);	
					 $(div).addClass("notavailable");			
				}

				// change text and function of <a> tag
				if ( status ) { $("#c92-chat > div > a").text("Chat with a UST Librarian"); }
				else { $("#c92-chat > div > a").text("Need Help?"); }

				// add the chat window
				$("#c92-chat > div:last").html( div );
				if( $(script).attr("src") !== "" ) { $("#c92-chat > div:last").append( script ); }	

			};

			// END FUNCTION: setDisplay()
			// *********************************************


			// *********************************************
			// START FUNCTION: checkAvailability()

			var checkAvailability = function(display) {  

				// FUNCTION: Callback function for processing before it invokes final callback
				var process = function(callback) {
					var jsontext = JSON.parse(this.responseText);		   
					callback(jsontext);
				};

				// FUNCTION: XML Request Function
				var callAPI = function (sURL, fCallback /*, argumentToPass1, argumentToPass2, etc. */) {
					var oReq = new XMLHttpRequest();
					oReq.open("get", sURL, true);
					oReq.callback = fCallback;
					oReq.arguments = Array.prototype.slice.call(arguments, 2);
					oReq.onload = function(){ this.callback.apply(this, this.arguments); };
					oReq.onerror = function(){ console.error(this.statusText); };
					oReq.send(null);
				};

				callAPI(url, process, display);	// Call the API and pass the procedures to call after done   
			};

			// * END FUNCTION: checkAvailability()
			// *********************************************


			// ********************************************
			// MAIN for documentReady

			generateChat();

		});

		/* 
		 * END document ready 
		 ***************************************************************** */
	} else {

		/* *****************************************************************
		 * jQuery Not Detected: Generate a SIMPLE chat using pure Javascript
		 *
		 * If we don't detect jQuery on the page, create a generic chat box using plain
		 * JavaScript.
		 */

		console.log("CHAT: jQuery required to generate chat box. Generic chat box generated instead.");

		// add the JS to the page
		console.log("CHAT: Adding LibChat without jQuery" );
		var sc=document.createElement('script');
		sc.type='text/javascript';
		sc.src= "https://v2.libanswers.com/load_chat.php?hash="+libChatNoJQuery;
		document.getElementsByTagName('body')[0].appendChild(sc);

		var libChatDiv = document.createElement('div');
		libChatDiv.id = "libchat_"+libChatNoJQuery;
		document.getElementsByTagName('body')[0].appendChild(libChatDiv);

	}

})();