<H1>JMeter Charts Application </H1>

This application is used to upload JMeter Jtl reports to automatically generate reports.

Data from the jtl files are extracted and persisted in a mongoDB database.

The data is organized as Project >> version >> build >> report >> data.

The front end is built using JQuery and uses REST API to communicate with the Nodejs application in the backend.

A REST server is created to accept *.jtl/*.xml files and use an existing xsl stylesheet to populate data in mongodb. This data will be used to display charts in the frontend /html page.

<h1>The following Charts are generated using d3.js</h1>

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

* Transaformation of XML works only on Linux/Mac as it requires XSLT libraries.
* Added xslt4Node support, but still could not get it to work on windows.

