Shrinkify: Serverless URL Shortening API
========================================

check this [page](https://parshnt-shortner.netlify.app/) for documentation on usage.


[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/parshnt/shrinkify)

## Initial configuration

Click in the Deploy to Netlify button above to create your own site directly and push this repository to your own account.
Before creating the site, Netlify will ask you to fill required environment variables listed here:

- `MONGO_URL` - connector URL for your mongoDB instance.


Example
-------

Visit
[https://parshnt-shortner.netlify.app/edu](https://parshnt-shortner.netlify.app/edu)
and you'll be redirected to
[https://www.educative.io](https://www.educative.io)

NOTE
----

Due to free tier limitations this function runs on us-east-1 AWS Lambda
region, expect delays as you move away geography.

TO-DO
-----

- Better & functional front-end (In React maybe?).
