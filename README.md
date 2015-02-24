<H1>JMeter Charts Application </H1>

This application is used to upload JMeter Jtl reports to automatically generate reports.

Data from the jtl files are extracted and persisted in a mongoDB database.

The data is organized as Project >> version >> build >> report >> data.

The front end is built using JQuery and uses REST API to communicate with the Nodejs application in the backend.

A REST server is created to accept *.jtl/*.xml files and use an existing xsl stylesheet to populate data in mongodb. This data will be used to display charts in the frontend /html page.

<h1>The following Charts are generated using d3.js</h1>h1>

1) Average Response times vs Samples (Bar Chart).

2) Average Response times vs No of Active Threads (Line Chart).

3) Average Number of Active Threads vs Execution time(Line Chart).

4) Compare Versions : - Average Response times vs Samples.

5) In all Charts selecting the legend(Sample) will toggle the chart element(bar or line) display(show or hide).

Display the latest build and project on login.

* Provide support to Upload JTL/XML files from frontend.
* Drag and drop result files(JTL/XML) and upload.
* Using Requirejs for dependancy management.
* Following AMD module structure for js files.

Nodejs server uses Express and MongodDB driver.

* Transaformation of XML works only on Unix/Linux as it requires XSLT libraries.

// TODO run code on windows.
// More charts
// Compare diffrent Versions
// Compare each version with the previous and show average increase/decrease in performance.


