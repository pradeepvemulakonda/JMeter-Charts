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
 * REST clinet for fetching data from the backend server
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

        fetchSelectedSamplesAsync: function (project) {
            var dfd = new $.Deferred();
            $.get('/jc/project/'+ project +'/samples/selected', function (data){
                dfd.resolve(data);
            });
            return dfd.promise();
        },

        setSamples: function (project, samples, callback) {
            $.ajax({
                    url: 'jc/project/'+project+'/samples/selected',
                    type: 'POST',
                    data: samples,
                    cache: false,
                    dataType: 'json',
                    processData: false, // Don't process the files
                    contentType: 'application/json',

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

        setEnvDetails: function (entity, envDetails, callback) {
            $.ajax({
                    url: 'jc/project/'+entity,
                    type: 'PUT',
                    data: envDetails,
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
