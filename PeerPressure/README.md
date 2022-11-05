# Troubleshooting
## If you face an error that concurrently is not recognised, run npm install -g concurrently

# Advice when Developing
## When developing, modify the dev command to run a few services and separately run the service under development in a new terminal. All logs from the services run concurrently will be seen in the same terminal unseprated.

# Viewing Logs of Deployment
## View the deployment logs at the following link: https://console.cloud.google.com/logs/query . Toggle time to view the most recent logs. An example query to set is as follows. Replace collaboration-service with service you want to look at. To view frontend logs, replace with default.

resource.type="gae_app"
resource.labels.module_id="collaboration-service"
--Hide similar entries
-(
-jsonPayload.message:*
-labels.logLabel:*
-labels.activity_type_name:*
-jsonPayload.response_code:*
-jsonPayload.referer:*
-jsonPayload.path:*
-jsonPayload.name:*
-jsonPayload.code:*
jsonPayload:*)
--End of hide similar entries
