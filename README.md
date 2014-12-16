This application is used to upload JMeter Jtl reports to automatically generate reports.

Data from the jtl files are extracted and persisted in a mongoDB database.

The data is organized as Project >> version >> report >> data.

The front end is built using Angularjs and uses REST API to communicate with the Nodejs application in the backend.

Current State of application only has a sample REST server and a A driver to access data from a MongoDB store.