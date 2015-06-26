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

/**
 * Main module which loads the left side navigation links
 * Registers the Upload module with the menue
 * Registers the project and version menu items with the Compare module.
 * Sets the Page header and the brad crumb
 * @module main
 */
require(['require',
		 'jquery',
		 'jquery.bootstrap',
		 'lib/metisMenu/dist/metisMenu',
		 'scrollTo',
		 'lib/typeahead.js/dist/typeahead.bundle.min',
		 'rest',
		 'mustache',
		 'compare',
		 'enum',
		 'template-loader',
		 'lib/bootstrap-combobox/js/bootstrap-combobox'], function (require, $) {
	var rest = require('rest');
	var Mustache = require('mustache');
	var Compare = require('compare');
	var Enum = require('enum');
	var Loader = require('template-loader');
	var menuTemplate = null;
	var subMenuTemplate = null;

	// fetch the menuTemplate
	$(function() {
		Loader.load(Enum.template.MENU, function(template) {
			 menuTemplate = template;
		});
		Loader.load(Enum.template.SUB_MENU, function(template) {
			 subMenuTemplate = template;
		});
	});

	// Loads the correct sidebar on window load,
	// collapses the sidebar on window resize.
	// Sets the min-height of #page-wrapper to window size
	$(function() {
	    $(window).bind('load resize', function() {
	        var topOffset = 50;
	        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
	        if (width < 768) {
	            $('div.navbar-collapse').addClass('collapse');
	            topOffset = 100; // 2-row-menu
	        } else {
	            $('div.navbar-collapse').removeClass('collapse');
	        }

	        var height = (this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height;
	        height = height - topOffset;
	        if (height < 1) {
	        	height = 1;
	        }
	        if (height > topOffset) {
	            $('#page-wrapper').css('min-height', (height) + 'px');
	        }
	    });
	});

	/**
	 * render initial content
	 * @return {[type]}   [description]
	 */
	$(function() {
		Loader.load(Enum.template.UPLOAD, function(template) {
		    var rendered = Mustache.render(template);
		    $('.dynamic-template').html(rendered);
		    	setup();
		    	fetchAndRenderLatestProject();
		});
	});

	/**
	 * Set the navigation links on document ready
	 * fetch the project details on load
	 */

	function setup() {
		// setup the forms upload
		require(['upload'], function (Upload) {
			Upload.init();
		});
		// hide the error
		$('.error-template').hide();
		fetchAndRenderProjectData();
	}

	/**
	 * Fetch the latest project and render it on load
	 * @private
	 */
	function fetchAndRenderLatestProject() {
		$('.main-project').click(function () {
			Loader.load(Enum.template.LATEST_PROJECT, function(template) {
				rest.fetchLatest(function (data) {
					var rendered = Mustache.render(template, {
						project: data.name,
						version: data.version,
						build: data.build
					});
			    	$('.dynamic-template').html(rendered);
					setPageHeader('Select a Project to view detailed performance charts');
					setBreadCrumb(['Select Project']);
				});
			});
		});
	}


	/**
	 * Adds a project menu items
	 * @param {Node}   node  the node to which the newly created menu item should be appended to
	 * @param {String}   clazz    css class to set on the created menue item
	 * @param {Function} callback the onclick callback to register
	 * @private
	 */
	function _addProjects(node, projects, callback) {
		node.empty();
		var menu = $(Mustache.render(menuTemplate, {
		    	title: 'project',
		    	projects: projects,
		    	concat: function () {
						    return this.split(' ').join('-');
						}
		    }));
		    menu.find('.accordion-heading').bind('click', callback);
			node.append(menu);
	}

	/**
	 * Adds a project menu items
	 * @param {Node}   node  the node to which the newly created menu item should be appended to
	 * @param {String}   clazz    css class to set on the created menue item
	 * @param {Function} callback the onclick callback to register
	 * @private
	 */
	function _addVersions(node, versions, callback) {
		node.empty();
		var menu = $(Mustache.render(subMenuTemplate, {
		    	title: 'version',
		    	versions: versions
		    }));
		    menu.bind('click', callback);
			node.append(menu);
	}

	/**
	 * Sets the page header
	 * @param {String}
	 * @private
	 */
	function setPageHeader(headerText) {
		$('.page-header').text(headerText);
	}

	/**
	 * Sets the Bread crumbs
	 * @param {Array} of bread crumbs
	 * @private
	 */
	function setBreadCrumb(crumbs) {
		var breadCrumbContainer = $('.breadcrumb');
		breadCrumbContainer.empty();
		$.each(crumbs, function (index, crumb){
			breadCrumbContainer.append('<li>' + crumb + '</li>');
		});
	}


	/**
	 * Fetch a render the project details.
	 * @private
	 */
	function fetchAndRenderProjectData() {
		rest.fetchProjects(function( data) {
			var node = $(document.createDocumentFragment());
			data = data.sort();
			_addProjects(node, data, fetchAndRenderVersionData);
			$('.projects').html(node);
		});
	}

	/**
	 * Fetch the version data for the project
	 * @param  {Object} event the click event triggered when the menu item is clicked
	 * @private
	 */
	function fetchAndRenderVersionData(event) {
		var selectedProjectContainer = $(event.target);
		if(selectedProjectContainer.is('span')) {
			var project = selectedProjectContainer.text().trim();
			var projectParentContainer = selectedProjectContainer.closest('.accordion-group');
			rest.fetchVersions(project, function (data) {
				data = data.sort();
				var versionsContainer = projectParentContainer.find('.versions');
				_addVersions(versionsContainer, data, fetchAndRenderBuildData);
				Compare.fetchAndRenderProjectTemplate(project , data);
				setPageHeader('Displaying charts for Project: ' + project);
				setBreadCrumb(['Select Project', 'Project: '+ project]);
			});
		}
	}

	/**
	 * Fetch the build data for the project
	 * @param  {Object} event the click event triggered when the menu item is clicked
	 * @private
	 */
	function fetchAndRenderBuildData(event) {
		var selectedVersion = $(event.currentTarget);
		if(selectedVersion.is('li')) {
			var project = selectedVersion.closest('.accordion-group').find('.selected-value.project').text();
			var version = selectedVersion.text();
			rest.fetchBuilds(project, version, function (data) {
				data = data.sort();
				Compare.fetchAndRenderVersionTemplate(project, version, data);
				setPageHeader('Displaying charts for Version: ' + version);
				setBreadCrumb(['Select Project', 'Project: '+ project, 'Version: '+ version]);
			});
		}
	}
});
