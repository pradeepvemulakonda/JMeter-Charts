<H3>JMeter Charts Application </H3>

This application is used to upload JMeter Jtl reports to automatically generate reports.

[For detailed usage -> WIKI](https://github.com/pradeepvemulakonda/JMeter-Charts/wiki)

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
* Css to Less.
* Unit tests ( Even though there is not much functionality in the backend).
* Angualar port.
* Display charts in mobile browsers.
