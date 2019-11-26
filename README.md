# Urban Analytics

A centralised platform for creating, storing, analysing and showcasing spatial data.

* [Installation](#installation)
* [Links](#links)
* [Configuration](#configuration)

## Installation

To get a version running locally:

```bash
git clone https://github.com/ellisdod/urban-analytics.git
cd urban-analytics
npm install
```

Then in separate terminal windows run the following:

The server:

```bash
node server
```

The client:

```bash
npm run dev
```

### Link to your Okta account

You will need to [create an OpenID Connect Application in Okta](https://developer.okta.com/blog/2018/02/15/build-crud-app-vuejs-node#add-authentication-with-okta) to get your values to perform authentication.

Log in to your Okta Developer account (or [sign up](https://developer.okta.com/signup/) if you don’t have an account) and navigate to **Applications** > **Add Application**. Click **Single-Page App**, click **Next**, and give the app a name you’ll remember, and click **Done**.

#### Configuration

Create a .env file with the following settings

``` bash
VUE_APP_OKTA_CLIENT_ID=*yourOktaClientId*
VUE_APP_OKTA_URI=*yourOktaDomain*
MONGODB_URI=*yourMongoUri*
```

**NOTE:** The value of `{yourOktaDomain}` should be something like `dev-123456.oktapreview`.
