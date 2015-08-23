// Copyright 2015 Pradeep Vemulakonda

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the License at

//   http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

;(function(define) {

	define(['jquery', 'require'], function($) {
		/**
		 * Creates a file upload form specific to JMeterCharts.
		 * Expects an element with id = drop-zone for file upload by drag and drop
		 * Expects an upload form with class js-upload-files
		 * Expects an element with class list-group to display the selected upload files.
		 * This class has to be initialized only after page loading is complete
		 * @return {Upload} Upload module
		 */
		var Upload = {

			// drop zone to uplaod files
			dropZone : null,
			// global property used to hold files selected
			filesToUpload : [],
			// the uplpad form
			uploadFileSection : null,
			// list of selected files
			listGroup : null,

			/**
			 * Initialize the upload form
			 * @method init
			 * @public
			 * @chainable
			 */
			init: function () {
				// enable data transfer
				var self = this;
				$.event.props.push( 'dataTransfer');
				this.dropZone = $('#drop-zone');
				this.uploadFileSection = $('.js-upload-files');
				this.listGroup = this.uploadFileSection.find('.list-group');
				// set on change event on upload form
				$('#js-upload-form input[type=file]').on('change', function (event) {
			    	var files = event.target.files;
			    	self._renderFileItemsinList(files);
			    });

				// on submit of upload form
			    $('#js-upload-form').submit(function(e) {
			    	e.stopPropagation(); // Stop stuff happening
			        e.preventDefault(); // Totally stop stuff happening
			        var uploadFiles = self.filesToUpload;
			        e.preventDefault();
			        self._startUpload(uploadFiles, $(this));
			    });

			    // on clicking the reset button on the upload form
			    $('#js-upload-reset').click(function() {
			    	$('#js-upload-form').trigger('reset');
			        self.filesToUpload= [];
			        var uploadFileSection = $('.js-upload-files'),
		    		listGroup = uploadFileSection.find('.list-group');
			        listGroup.empty();
			        listGroup.append('<em>nothing selected</em>');
			        $('.error-template').hide();
			    });

			   // $(".typeahead").prop('disabled', true);


			    // setup typeahead
			    this._fetchProjectDropDown();

			    /**
			     * Set the ebvents for the drop zone
			  	 *
			     */
			    this.dropZone.on('drop', function(e) {
			        e.preventDefault();
			        this.className = 'upload-drop-zone';
			        var files = e.dataTransfer.files;
			        self._renderFileItemsinList(e.dataTransfer.files);
			    });

			    this.dropZone.on('dragover', function() {
			        this.className = 'upload-drop-zone drop';
			        return false;
			    });

			    this.dropZone.on('dragleave', function() {
			        this.className = 'upload-drop-zone';
			        return false;
			    });
				return this;
			},

			/**
			 * Renders the list of selected files
			 * @param  {Array} files selected files
			 * @private
			 * @chainable
			 */
			_renderFileItemsinList: function(files) {
				if(files.length !== 1) {
		        	alert('Only a single file can be selected at a time');
		        	return;
		    	}

		    	if(this.filesToUpload.length > 0) {
		    		alert('A file has already been selected for upload');
		        	return;
		    	}

				var self = this;
				// remove existing message
				this.listGroup.find('em').remove();

				// for each file add a new list item
				$.each(files, function (index, file) {
					self.filesToUpload.push({name:file.name, file: file});
					// <i class='fa fa-refresh fa-spin'></i>
					self.listGroup.append('<span class="list-group-item list-group-item-info"><span class="badge alert-info pull-right">ready to upload &nbsp;<i class="fa fa-times fa-fw"></i></span><span class="file-name">'+file.name+'</span></span>');
				});


				// add a cross mark to delete lists items
				$('.js-upload-files .fa-times').hover(
			      function () {
			         $(this).toggleClass('fa-inverse');
			      },
			      function () {
			          $(this).removeClass('fa-inverse');
			       }
			     );

				// setup click event to remove items from the list
				$('.js-upload-files .fa-times').click(function (event) {
					var fileName = $(event.target).closest('.list-group-item').find('.file-name').text();
					$.each(self.filesToUpload, function (index, fileData) {
						 if(fileData && fileData.name === fileName) {
							 self.filesToUpload.splice(index, 1);
						}
					});

					$(event.target).closest('.list-group-item').remove();
				 	if($('.js-upload-files .list-group .list-group-item').size() <= 0) {
						self.listGroup.append('<em>nothing selected</em>');
				 	}
			 	});

			 	return this;
			},

			/**
			 * Start the upload
			 * @param  {[type]} files [description]
			 * @param  {[type]} form  [description]
			 * @return {[type]}       [description]
			 */
			_startUpload: function (files, form) {
		        // START A LOADING SPINNER HERE

		        // Create a formdata object and add the files

		    	var	self = this;
		    	$.each(files, function(index, file)
		    	{
		    		var data = new FormData();
		    		data.append('resultFiles', file.file);
		    		console.info(file.name);


			    	data.append('project', form.find('[name="project"]').val());
			    	data.append('version', form.find('[name="version"]').val());
			    	data.append('build', form.find('[name="build"]').val());

			        $.ajax({
			            url: 'jc/upload',
			            type: 'POST',
			            data: data,
			            cache: false,
			            dataType: 'json',
			            processData: false, // Don't process the files
			            contentType: false, // Set content type to false as jQuery will
											// tell the server its a query string
											// request
			            success: function(data,  textStatus, jqXHR)
			            {

			            	if(typeof data.error === 'undefined')
			            	{
			            		// Success so call function to process the form
			            		self._onSuccessfulUpload(null, data);
			            	}
			            	else
			            	{
			            		// Handle errors here
			            		self._onFailedUpload(null, data);
			            	}
			            },
			            error: function(jqXHR, textStatus, errorThrown)
			            {
			            	// Handle errors here
			            	var err = jqXHR.responseText;
			            	console.log(errorThrown);
			            	self._onFailedUpload(null, err);
			            	// STOP LOADING SPINNER
			            }
			        });
				});
		    },

		    /**
		     * invoked on completing successfully.
		     * @method _onSuccessfulUpload
		     * @param  {[type]} event [description]
		     * @param  {[type]} data  [description]
		     * @return {[type]}       [description]
		     * @priavte
		     */
			_onSuccessfulUpload: function (event, data) {
				var uploadFileSection = $('.js-upload-files'),
				listGroup = uploadFileSection.find('.list-group'),
				listFiles = $(listGroup).find('.file-name');
				$('.error-template').hide();
				$.each(listFiles, function (index, fileSection) {
					fileSection = $(fileSection);
					if(fileSection.text() === data.fileName) {
		    			if (!data.error) {
			    			fileSection.parent().removeClass('list-group-item-info list-group-item-danger').addClass('list-group-item-success');
			    			fileSection.parent().find('.alert-info').html('Uploaded successfully');
			    			fileSection.parent().find('.alert-info').removeClass('alert-info').addClass('alert-success');
		    			} else {
		    				fileSection.parent().removeClass('list-group-item-info').addClass('list-group-item-danger');
			    			fileSection.parent().find('.alert-info').html('Uploaded failed');
			    			fileSection.parent().find('.alert-info').removeClass('alert-info').addClass('alert-danger');
		    			}
					}
				});
			},

			/**
			 * called when a file upload fails
			 * @method _onFailedUpload
			 * @param  {[type]} event [description]
			 * @param  {[type]} data  [description]
			 * @return {[type]}       [description]
			 */
		    _onFailedUpload: function (event, data) {
		    	var uploadFileSection = $('.js-upload-files'),
	    		listGroup = uploadFileSection.find('.list-group'),
		    	listFiles = $(listGroup).find('.file-name');

		    	$.each(listFiles, function (index, fileSection) {
		    		fileSection = $(fileSection);
	    			fileSection.parent().removeClass('list-group-item-info').addClass('list-group-item-danger');
	    			fileSection.parent().find('.alert-info').html('Uploaded failed');
	    			fileSection.parent().find('.alert-info').removeClass('alert-info').addClass('alert-dangers');
		    	});
		    	$('.error-template').text(data? data : 'upload failed because of invalid xml result file');
		    	$('.error-template').show();
		    },

		    _createBloodHoundProvider: function (url) {
				return new Bloodhound({
				  	datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
					    queryTokenizer: Bloodhound.tokenizers.whitespace,
					    limit: 10,
					    remote: {
					    // url points to a json file that contains an array of country
						// names, see
					    // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
						  remote: url,
						  url: url,
					    // the json file contains an array of strings, but the
						// Bloodhound
					    // suggestion engine expects JavaScript objects so this converts
						// all of
					    // those strings
					    filter: function(list) {
					      return $.map(list, function(data) { return { value: data }; });
					    }
					  }
				});
			},

			_fetchProjectDropDown: function () {
				if($('.typeahead.project').size() > 1) {
				    $('.typeahead.project').typeahead('destroy');
				}
				var projects = this._createBloodHoundProvider('jc/project'),
					self = this;

				projects.initialize(true);

				$('.typeahead.project').typeahead(
					{
					 	hint: true,
					 	highlight: true,
					 	minLength: 0
					},
					{
					 	name: 'projects',
					 	displayKey: 'value',
					 	source: projects.ttAdapter()
					}
				);

				//$('.typeahead.project').prop('disabled', false);

				// "select"-button
				$(".project-btn").click(function(event) {
				    var input = $('.typeahead.project');
				    input.focus();
				    var e = jQuery.Event("keydown");
				    e.keyCode = 40;
				    input.trigger(e);
				});

				$('.typeahead.project').on('typeahead:selected typeahead:autocompleted', function (event, suggestion) {
			 		if($('.typeahead.version').size() > 1) {
			 			$('.typeahead.version').typeahead('destroy');

			 		}
				 	var project = suggestion.value;
				 	self._fetchVersionDropDown(project);
				});
			},

			_fetchVersionDropDown: function (project) {
				var versions = this._createBloodHoundProvider('/jc/project/'+project+'/version'),
					self = this;
		 		// kicks off the loading/processing of `local` and
				// `prefetch`
		 		versions.initialize(true);

				$('.typeahead.version').typeahead({
					hint: true,
					highlight: true,
					minLength: 0
				},
				{
					name: 'versions',
					displayKey: 'value',
					source: versions.ttAdapter()
				});

				//$('.typeahead.version').prop('disabled', false);

				$('.version-btn').click(function(event) {
				    var input = $('.typeahead.version');
				    input.focus();
				    var e = jQuery.Event("keydown");
				    e.keyCode = 40;
				    input.trigger(e);
				});
				$('.typeahead.version').on('typeahead:selected typeahead:autocompleted', function (event, suggestion) {
	 				if($('.typeahead.build').size() > 1) {
			 			$('.typeahead.build').typeahead('destroy');

			 		}
					var project = $('.typeahead.project').typeahead('val');
					var version = suggestion.value;
					self._fetchBuildDropDown(project, version);
				});
			},

			_fetchBuildDropDown: function (project, version) {
				var builds = this._createBloodHoundProvider('/jc/project/'+project+'/version/'+ version +'/build');

				builds.initialize(true);

	 			$('.typeahead.build').typeahead({
	 	             hint: true,
	 	             highlight: true,
	 	             minLength: 0
	 	           },
	 	           {
	 	             name: 'builds',
	 	             displayKey: 'value',
	 	             source: builds.ttAdapter()
	 	         });

	 			$('.typeahead.build').prop('disabled', false);
	 			$('.build-btn').click(function(event) {
				    var input = $('.typeahead.build');
				    input.focus();
				    var e = jQuery.Event('keydown');
				    e.keyCode = 40;
				    input.trigger(e);
				});
	 		}
	 	};
	return Upload;
	});
}(typeof define === 'function' && define.amd ? define : function(deps, factory) {
	'use strict';
	if (typeof module !== 'undefined' && module.exports) {
		// Node
		module.exports = factory(require('jquery'));
	} else {
		factory(jQuery);
	}
}));
