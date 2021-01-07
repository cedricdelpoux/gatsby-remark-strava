# gatsby-remark-strava

[![Npm version][badge-npm]][npm]
[![Npm downloads][badge-npm-dl]][npm]
[![MIT license][badge-licence]](./licence.md)
[![PRs welcome][badge-prs-welcome]](#contributing)

`gatsby-remark-strava` is a [Gatsby](https://www.gatsbyjs.org/) [remark](https://remark.js.org/) plugin to embed [Strava](https://www.strava.com/) activities by their URL.

## Usage

1. Download `gatsby-remark-strava` from the NPM registry:

```shell
yarn add gatsby-remark-strava
```

2. Generate a token

The package needs 3 `.env` variables with the following format to work:

```dotenv
STRAVA_CLIENT_ID=2845
STRAVA_CLIENT_SECRET=c3d62caed3sjf4vdjsb096d010d81f52a17ac5
STRAVA_TOKEN={"access_token":"ya...J0","refresh_token":"1..mE","expires_at":1581439030,"expires_in":21600}
```

`gatsby-remark-strava` expose a script to make the generation easier.

Open a terminal at the root of your project and type:

```shell
gatsby-remark-strava-token
```

3. Add the plugin in your `gatsby-config.js` file. It's important that it is a child plugin of `gatsby-transformer-remark` as below, otherwise it won't work. 

```js
require("dotenv").config()

module.exports = {
    plugins: [
        {
            resolve: "gatsby-transformer-remark",
            options: {
                plugins: [
                    {
                        resolve: "gatsby-remark-strava",
                        options: {
                            stravaClientId: process.env.STRAVA_CLIENT_ID,
                            stravaClientSecret:
                                process.env.STRAVA_CLIENT_SECRET,
                            stravaToken: process.env.STRAVA_TOKEN,
                        },
                    },
                ],
            },
        },
    ],
}
```

4. Add [Strava](https://www.strava.com/) activities links to your content

```md
[strava activity 3657585594 embed](https://www.strava.com/activities/3657585594)
```

> Text need to contains "embed" to be transformed

## Showcase

You are using `gatsby-remark-strava` for your website? Thank you!

Please add your website to the [Showcase](./showcase.yml)

## Contributing

-   ⇄ Pull/Merge requests and ★ Stars are always welcome.
-   For bugs and feature requests, please [create an issue][github-issue].

## Changelog

See [CHANGELOG](./CHANGELOG.md)

## License

This project is licensed under the MIT License - see the
[LICENCE](./LICENCE.md) file for details

[badge-npm]: https://img.shields.io/npm/v/gatsby-remark-strava.svg?style=flat-square
[badge-npm-dl]: https://img.shields.io/npm/dt/gatsby-remark-strava.svg?style=flat-square
[badge-licence]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[badge-prs-welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[npm]: https://www.npmjs.org/package/gatsby-remark-strava
[github-issue]: https://github.com/cedricdelpoux/gatsby-remark-strava/issues/new
