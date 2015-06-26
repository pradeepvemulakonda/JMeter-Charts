<H3>JMeter Charts Application </H3>

This application is used to upload JMeter Jtl reports to automatically generate reports.

Data from the jtl files are extracted and persisted in a mongoDB database.

The data is organized as Project >> version >> build >> report >> data.

The front end is built using JQuery and uses REST API to communicate with the Nodejs application in the backend.

A REST server is created to accept *.jtl/*.xml files and use an existing xsl stylesheet to populate data in mongodb. This data will be used to display charts in the frontend /html page.

<h4>The following Charts are generated using d3.js</h4>

<ol>
<li>Average Response times vs Samples (Bar Chart).</li>

<li>Average Response times vs No of Active Threads (Line Chart).</li>

<li>Average Number of Active Threads vs Execution time(Line Chart).</li>

<li>Compare Versions : - Average Response times vs Samples.</li>

<li>In all Charts selecting the legend(Sample) will toggle the chart element(bar or line) display(show or hide).</li>

<li>Compare two version's response times</li>
<li>Compare two build's response times</li>
</ol>

Additional info provided.
<ul>
<li>Setup the samples to be used for displaying the charts.</li>
<li>Display the latest build and project on login.</li>
<li>Provide support to Upload JTL/XML files from frontend.</li>
<li>Drag and drop result files(JTL/XML) and upload.</li>
<li>Using Requirejs for dependancy management.</li>
<li>Following AMD module structure for js files.</li>
</ul>
Nodejs server uses Express and MongodDB driver.

* Has a dependancy on https://www.npmjs.com/package/xslt4node
* Could not get it to run on windows8.Need to test on windows 7.

<h4> Installation </h4>
<h5>Prerequisits</h5>

* Install java 6/7/8
* Works only on Firefox and Chrome(on IE the report generation does not work, Promises in the code breaks the stuff).
</br>

Step 1: bower install (all js components are copied to folder /src/main/web/static/js/lib) 
        Note:rasterizehtml is not a bower dependancy.

Step 2: npm install.

Step 3: Install mongodb.

Step 4: provide the db details src/main/config.json.

<h4>Running</h4>

Step 1: node app.js in the src/main folder

Step 2: In the frontend if you want to see the report you need to select a project >> And select config tab >> check all the smaples you want to include in your report >> save/set samples.

<h5> Usage </h5>
* Use the upload report page to upload *.jtl/*.xml files
* Use the navigation links to check reports
* Use the Action menue on the right side of the report section to download report as pdf.
* Use the Action menue on the right side of the chart section to download the image.
* To compare two versions select both of the versions and select compare.(same for builds)
* Only a single results file can be uploaded at a time.

<h5>TODO</h5>
* Css to Less

<h4>Detailed Usage:</h4>

Before you can generate reports using this tool you need to create JMeter results file in XML format.
- To create a result file add an Aggregate Report listener.
- Set the result file type to xml as shown in the screenshot below.

Sample Perfromance test for this application in JMeter

<h6>JMeter samples</h6>
![JMeterCharts JMX](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Sample_JMeterCharts_jmx.png "JMeterCharts JMX")

<h6>Aggregate Report</h6>
![JMeterCharts Result Config](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Config_for_report.png "JMeterCharts Result Config")

<h6>Start JMeterCharts application</h6>
- start mongodb using <b>mongod</b> command
- start node application

![JMeterCharts app start](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/run_jmeter_charts.png "JMeterCharts app start")

<h6>Open browser at http://$host:$port/jc</h6>
- The host and the port can be configured in src/config.json.
- Once the changes are made the server needs to be restarted.

<h6>Sample config json</h6>
```javascript
{
	"mongoHost": "localhost", // mongodb host name
	"mongoPort": "27017", // mongodb port
	"mongoDB": "JMeterReportDB", // mongodb db name
	"httpPort": "30000" // node express port
}
```
<h5>Using JMeter Chart Application </h5>
- Once you open the application, if there are no existing projects you can create one by uploading a JMeter results file.
![JMeterCharts start page](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/initial.png "JMeterCharts start page")

- Select a JMeter results file using the browse button.
- Once the file is selected you should provide the <b>project</b>, <b>version</b> and <b>build</b> which are all mandatory.
- Once you provide the required details click <b> upload </b>

![Selected file](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Upload-before-submit.png "Selected File")

- Click <b>upload</b> and one the upload is successful the file color changes to green.

![Uploaded file](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Upload_after_submit.png "Uploaded File")

- Refreh page to load newly created project.

![Project menu](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Project_Menu.png "Project Menu")

- Select the Project "JMeterCharts" to view the versions in the menu.
- The details page on the right also shows the versions present in the project.

![Version menu](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Version_Menu.png "Version Menu")

> To View reports you need to first select the <b>config</b> tab in in the project details view and select the samples.

- Select the config tab to view the available samples for the project

![View Samples](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Set_Samples.png "View Samples")

- Select the samples to display and select <b> Set Samples </b>

![Update Samples](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Selected_Samples.png "Update Samples")

- Once the samples are set the application reloads to get the latest changes.
- Now you can select any project and see detailed charts for a specific viersion.

![View Version details](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/View_Version_Details.png "View Version Details")

- To view build details => select a specific version

![Version Menu](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Version_Menu.png "Version Menu")

- To view details of specific build click on <b>view details</b> on specific build

![Build Details](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/View_Build_Details.png "Build Details")

<h5> View and download Reports </h5>

For each version or build the application generates 3 types of charts
# Samples vs Response time
# Sample Response Time vs Threads
# Active threads vs run time

<h6>Sample charts</h6>
# Samples vs Response Time

![Sample vs response](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Sample_Response_ms.png "Sample vs response ms")

# Samples Response ms vs No of Threads

![Sample Response ms vs No of threads](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Response_ms_vs_Threads.png "Sample Response ms vs No of Threads")

# Active No of threads vs Run Time

![Active No of Threads vs Time](https://github.com/pradeepvemulakonda/JMeter-Charts/blob/master/out/docs/Active%20threads.png "Active No of Threads vs Time")




















