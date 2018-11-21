# gatsby-source-slack

Use your [Slack API](https://api.slack.com) token to download your channels and users into [Gatsby](https://www.gatsbyjs.org/)'s GraphQL data layer!

⚠ **Please note:** This plugin was made out of a specific necessity, so it doesn't cover all of Slack's API capabilities, focusing only on channels and users. If you want to add extra functionalities, feel free to [create a PR](https://github.com/hcavalieri/gatsby-source-slack/pulls) and contribute :smile:

## Table of content

- [Basic Usage](#basic-usage)
- [Options](#options)
- [Todo](#todo)
- [License](#license)

## Basic usage

```
yarn add gatsby-source-slack
# or
npm i gatsby-source-slack --save
```

```js
// in your gatsby-config.js
module.exports = {
  // ...
  plugins: [
    {
      resolve: 'gatsby-source-slack',
      options: {
        // Avoid including your token directly in your file.
        // Instead, opt for adding them to .env files for extra
        // security ;)
        token: 'xoxp-asdkl1posdapo12-asjsdi12idsaioo',
      },
    },
  ],
  // ...
};
```

Go through http://localhost:8000/___graphql after running `gatsby develop` to understand the created data and create a new query and checking available collections and fields by typing `CTRL + SPACE`.

## Options

| Options           | Type             | Default | Description                                                                                 |
| ----------------- | ---------------- | ------- | ------------------------------------------------------------------------------------------- |
| key               | string           |         | **[required]** Your API key                                                                 |
| channelsToFetch   | array of strings | `[]`    | The IDs of channels you'd like to fetch                                                     |
| normalizeMessages | boolean          | `false` | Wether the plugin should format messages' text to include the referenced users, links, etc. |

## Using .env variables to hide your key

If you don't want to attach your API key to the repo, you can easily store it in .env files by doing the following:

```js
// In your .env file
SLACK_TOKEN = 'xoxp-asdkl1posdapo12-asjsdi12idsaioo';

// In your gatsby-config.js file
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

module.exports = {
  // ...
  plugins: [
    {
      resolve: 'gatsby-source-slack',
      options: {
        token: process.env.SLACK_TOKEN,
        // ...
      },
    },
  ],
  // ...
};
```

This example is based off [Gatsby Docs' implementation](https://next.gatsbyjs.org/docs/environment-variables).

## TODO

- Pass down the whole `message` objects into `normalizedMessages`;
- Better documentation on `normalizeMEssages`;
- Tutorial on how to set-up a Slack clone - maybe open source the one I've made;
- Live example of this working

## License

I'm not very literate on licensing, so I just went with **MIT**, if you have any considerations just let me know! Oh, and, of course, feel free to contribute to this plugin, even bug reports are welcome!
