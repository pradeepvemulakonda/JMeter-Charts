/**
 * New node file
 */
define(["jquery"], function($) {
	return {
        fetchProjects: function(callback) {
        	$.when($.getJSON( "/jc/project" )).done(callback);
        },
        
        fetchVersions: function(projectName, callback) {
        	$.when($.getJSON( "/jc/project/" + projectName + "/version" )).done(callback);
        },
        
        fetchBuilds: function(projectName, version, callback) {
        	$.when($.getJSON( "/jc/project/" + projectName + "/version/" + version + '/build' )).done(callback);
        },
        
        fetchReport: function(projectName, version, buildNo, callback) {
        	$.when($.getJSON( "/jc/project/"  + projectName + "/version/" + version + '/build/' + buildNo)).done(callback);
        }
    };
});
