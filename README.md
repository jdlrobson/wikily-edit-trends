Provides weekly rundowns of Wikipedia's trending edits.

# How to use

npm install wikily-edit-trends
Setup a daily/twice daily cronjob to poll new content

	```
	node node_modules/wikily-edit-trends/cron.js
	`

In your app make use of it

	```
	var wt = require ('wikily-edit-trends');
	// get a week of data
	wg.get().then( function ( json ) {
		// do something
	});
	```

