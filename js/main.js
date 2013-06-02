/*

To do:
pull in data for intro copy, date and image
disable buttons when not clickable
design updates
responsive buttons working
refine transitions. subtler.
backbone.js to add url functionality?
*/

require.config({
    // Require is defined in /scripts, so just the remaining path (and no ext needed)
    'paths': {
        "jquery": "vendor/jquery",
        "jquery.transit": "vendor/jquery.transit.min",
        "underscore": "vendor/underscore",
        "backbone": "vendor/backbone",
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
   		},
   		backbone: {
            'deps': ['jquery', 'underscore'],
            'exports': 'Backbone'
        },
        underscore: {
            'exports': '_'
        }
    }
});


/*define(['jquery.transit'], function() {
    // module code
   $('.side-bar').css({ translate: [60,30] });
});*/


require([
    'jquery',
    'underscore',
    'backbone',
    'handlebars',
    'tabletop',
    'jquery.transit'
],

function($, _, Backbone, Handlebars){

    window.LinkWeek = Backbone.Model.extend({});

    window.LinkWeeks = Backbone.Collection.extend({
        model: LinkWeek,
        url: 'projects.json'
        //set this up to '/projects' and 
        //get server to return public/projects.json
        //or similar. here direct to json.
    });

    window.LinksView = Backbone.View.extend({

        tagName: 'div',
        className: 'project',

        initialize: function(){
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.template = _.template($('#project-template').html());
        },

        render: function(){
            var renderedContent = this.template(this.model.toJSON());
            this.$el.html(renderedContent);
            //$(this.el).html(renderedContent);
            return this;
        }

    });

 
//    project = new Project({title:'test', description:'01', tracks:[{title: 'Track A'}]});
 //   projectView = new ProjectView({model:project});
   // $('#container').append(projectView.render().el);
   //data lists

	//convert this into backbone models, etc.
	var tt,
	lookList = [],
	readList = [],
	doList = [],
	currentWeekIndex = 0,
	mostRecentSheet,
	weeksList;

	$(document).ready(function(){
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

			//look up sheet in list
			mostRecentSheet = weeksList[currentWeekIndex].sheets;

			updateData();
		}

		/*
		Updates data and rerenders itd display
		*/
		function updateData(){
			sheetToFetch = weeksList[currentWeekIndex].weeks;
			var currentWeek = tt.models[sheetToFetch].all();

			//clear arrays
			lookList = [];
			readList = [];
			doList = [];

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

			//create template
			var source = $('#links-template').html();
			var template = Handlebars.compile(source);
			var context = {
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

			updateData();
			console.log($.transit);
			//side-bar goes left.
			$('.side-bar').transit({
				x: -sideWidth
			}, function(){
				//change side-bar date
				//change side-bar image
				//load these from sheets page
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
			},function(){ 
				//hange content links
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
});

