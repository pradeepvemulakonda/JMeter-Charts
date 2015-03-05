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

        fetchSelectedSamples: function (project, callback) {
            $.when($.getJSON('/jc/project/'+ project +'/samples/selected')).done(callback);
        },

        setSamples: function (project, samples, callback) {
            var data = new FormData();
            data.append('project', project);
            data.append('samples', samples);
            $.ajax({
                    url: 'jc/project/'+project+'/samples/selected',
                    type: 'POST',
                    data: data,
                    cache: false,
                    dataType: 'json',
                    processData: false, // Don't process the files
                    contentType: false, // Set content type to false as jQuery will
                                        // tell the server its a query string
                                        // request
                    success: function(data)
                    {
                        if(typeof data.error === 'undefined')
                        {
                            // Success so call function to process the form
                            callback(null, data);
                        }
                        else
                        {
                            // Handle errors here
                            callback(null, data);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown)
                    {
                        // Handle errors here
                        var err = jqXHR.responseText;
                        console.log(errorThrown);
                        callback(err);
                        // STOP LOADING SPINNER
                    }
                });
        },

        fetchComparisionData: function (compareArray, project, version, callback) {
            var deferends = [];
            if(!version) {
                $.each(compareArray, function (index, value) {
                    deferends.push($.getJSON('/jc/project/'+project+'/version/'+ value +'/latest/build'));
                });
                $.when.apply($, deferends).done(callback);
            } else {
                $.each(compareArray, function (index, value) {
                    deferends.push($.getJSON('/jc/project/'+ project +'/version/'+ version +'/build/' + value));
                });
                $.when.apply($, deferends).done(callback);
            }
        }
    };
});
