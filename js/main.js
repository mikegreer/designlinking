/*

To do:

get tabletop backbone working
add URL routing
add info / about page
get responsive buttons working

design info page
design share functionality
icons for share and info
design tweaks to type (and look / read / do)
pull in data for intro copy, date and image
disable buttons when not clickable
refine transitions. subtler.
add tracking

*/

require.config({
    'paths': {
        "jquery": "vendor/jquery",
        "jquery.transit": "vendor/jquery.transit.min",
        "handlebars": "vendor/handlebars",
        "tabletop": "vendor/tabletop"
    },
    'shim':
    {
		'jquery.transit': {
            deps: ['jquery'],
            exports: '$'
        },
        'jquery': {
            exports: '$'
        },
		'handlebars': {
			exports: 'Handlebars'
		}
    }
});

require([
    'jquery',
    'handlebars',
    'tabletop',
    'jquery.transit'
],

function($, Handlebars){
	var tt,
	lookList = [],
	readList = [],
	doList = [],
	currentWeekIndex = 0,
	mostRecentSheet,
	weeksList;

	//read in data from google spreadsheet w/ tabletop js
	Tabletop.init({
		key: '0AjaUg4bse8SndEZxY3prYjYxejNCU1Q0RlhzVHRPamc',
		callback: createModels,
		simpleSheet: false,
		debug: true
	});

	/*
	Called when data from spreadsheet is loaded
	sets up initial variables and stores data for use
	*/
	function createModels(data, tabletop){
		tt = tabletop;
		// get list of all weeks from key sheet
		weeksList = tabletop.models['weeks'].all();
		//most recent sheet
		currentWeekIndex = weeksList.length-1;

		updateData();
	}

	/*
	Updates data and rerenders display
	*/
	function updateData(){
		sheetToFetch = weeksList[currentWeekIndex].weeks;
		var currentWeek = tt.models[sheetToFetch].all();

		//clear arrays
		lookList = [];
		readList = [];
		doList = [];

        //get date, image and copy
        var weekDate = weeksList[currentWeekIndex].weeks;
        var weekCopy = weeksList[currentWeekIndex].intro;
        var weekImage = weeksList[currentWeekIndex].imageurl;

		//sort objects into correct lists
		var length = currentWeek.length;
		var element = null;
		for (var i = 0; i < length; i++) {
			element = currentWeek[i];
			if(element.category == "look"){
			//	element.category == null;
			//	element.rowNumber = null;
				lookList.push(element);
			}
			if(element.category == "read"){
				readList.push(element);
			}
			if(element.category == "do"){
				doList.push(element);
			}
		}

        //switch sidebar image and title
        $('.side-bar').css("background-image", "url("+weekImage+")");
		$('#weekOf').text(weekDate);
        //render template
		var source = $('#links-template').html();
		var template = Handlebars.compile(source);
		var context = {
            date: weekDate,
            copy: weekCopy,
			lookList: lookList,
			readList: readList,
			doList: doList
		};
		$('#links').html(template(context));
	}

	/*
	Advance the display one week
	*/
	function nextWeek(){
		if(currentWeekIndex >= weeksList.length-1){
			console.log("We're not there yet");
		}
		else{
			console.log("Forward one week");
			currentWeekIndex ++;
			pageTransition();
		}
	}

	/*
	Go back one week
	*/
	function backWeek(){
		if(currentWeekIndex <= 0){
			console.log("Archive exhausted");
		}else{
			console.log("back one week");
			currentWeekIndex --;
			pageTransition();
		}
	}

	/*
	Perform page transition: make this better
	*/
	function pageTransition(){
		var sideWidth = $('.side-bar').width();
		
		//side-bar goes left.
		$('.side-bar').transit({
			x: -sideWidth
		}, function(){
			updateData();
			//bring bar back on
			$(this).transit({
				x: 0
			});
		});

		//content goes right and fades (link-section)
		$('.link-section').transit({
			x: sideWidth,
			opacity: 0
		}, function(){
			//change content links
			updateData();
			//$(this).html($('#week2').html());
			$(this).transition({
				x: 0,
				opacity: 1
			});
		});
	}

	/*
	Click handlers
	*/
	$('#bignext').click(function(){
		nextWeek();
	});

	$('#biglast').click(function(){
		backWeek();
	});
});

