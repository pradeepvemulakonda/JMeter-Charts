/**
 * New node file
 */
define(['jquery'], function($) {
	return {
        fetchProjects: function(callback) {
        	$.when($.getJSON( '/jc/project' )).done(callback);
        },

        fetchVersions: function(projectName, callback) {
        	$.when($.getJSON( '/jc/project/' + projectName + '/version' )).done(callback);
        },

        fetchBuilds: function(projectName, version, callback) {
        	$.when($.getJSON( '/jc/project/' + projectName + '/version/' + version + '/build' )).done(callback);
        },

        fetchReport: function(projectName, version, buildNo, callback) {
        	$.when($.getJSON( '/jc/project/'  + projectName + '/version/' + version + '/build/' + buildNo)).done(callback);
        },

        fetchLatest: function(callback) {
            $.when($.getJSON('/jc/latest')).done(callback);
        },

        fetchLatestBuildforVersion: function (project, version, callback) {
            $.when($.getJSON('/jc/project/'+project+'/version/'+ version +'/latest/build')).done(callback);
        },

        fetchSamples: function (project, callback) {
            $.when($.getJSON('/jc/project/'+ project +'/samples')).done(callback);
        },

        fetchComparisionData: function (compareArray, project, isVersion, callback) {
            var deferends = [];
            if(isVersion) {
                $.each(compareArray, function (index, value) {
                    deferends.push($.getJSON('/jc/project/'+project+'/version/'+ value +'/latest/build'));
                });
                $.when.apply($, deferends).done(callback);
            }
        }

    };
});
