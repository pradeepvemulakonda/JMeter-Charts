<H1>JMeter Charts Application </H1>

This application is used to upload JMeter Jtl reports to automatically generate reports.

Data from the jtl files are extracted and persisted in a mongoDB database.

The data is organized as Project >> version >> report >> data.

The front end is built using Angularjs and uses REST API to communicate with the Nodejs application in the backend.

A REST server is created to accept *.jtl files and use an existing xsl stylesheet to populate data in mongodb. This data will be used to display charts in the frontend /html page.
