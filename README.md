<h2 style="text-align: center;">
<img style="text-align: center;" src="https://raw.githubusercontent.com/auditsdigital/sustainability/master/logo.jpg">
</h2>
 
# Digital Sustainability Audits

[![Build Status](https://github.com/auditsdigital/sustainability/actions/workflows/build.yaml/badge.svg)](https://github.com/auditsdigital/sustainability/actions/workflows/build.yaml)
[![npm](https://img.shields.io/npm/v/sustainability)](https://www.npmjs.com/package/sustainability)
[![npm download count](https://img.shields.io/npm/dm/sustainability)](https://www.npmjs.com/package/sustainability)
[![Coverage Status](https://coveralls.io/repos/github/auditsdigital/sustainability/badge.svg?branch=master)](https://coveralls.io/github/auditsdigital/sustainability?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/auditsdigital/sustainability/badge.svg)](https://snyk.io/test/github/auditsdigital/sustainability)
[![MIT License](https://img.shields.io/npm/l/sustainability.svg)](#license)

> A new methodology for assessing the Internet carbon footprint and sustainability of digital services. Computes the carbon footprint (CF) index, determines the energy source of servers, the usage of HTTP2.0, WebP image format, lazy loading on images, font subsetting, etc.
> Effectively generates a customized sustainability report with a set of helpful comments to reduce the CF.

- [Problematic](#Problematic)
- [Our solution](#Our-solution)
- [How it works](#How-it-works)
- [Diagrams](#Diagrams)
- [Try it now](#Try-it-now)
- [Contributions](#contributions-are-welcomed)
- [License](#License)
- [Links](#Links)

## Problematic

Increasing Internet connectivity in everyday life fosters new, or otherwise more energy-intensive, forms of demand that may counterbalance energy savings [[1](https://doi.org/10.1016/j.erss.2018.01.018)].
As example, the rising of web applications and websites. They provide an engaging user experience with the development of a wide range of functionalities and interactive elements but still, they may have an impact on the environment.


## Our solution

Digital Sustainability Audits (DAS) is our solution for an environmentally sustainable transformation of digital resources.

Some of its key features are:

- Automated
- Lighting fast
- Platform agnostic
- Extensible
- User & developer friendly


## How it works

With the help of several audits or test suits we are able to assess digital sustainability of any service with only one thing: a valid URL.

At this moment, audits are divided into two categories: server and design.

### Server audits

Server aspects which are essential for online sustainability.

<p>
<details><summary>Running with renewable energy</summary><br/>
Is it using an eco-friendly hosting solution powered with renewable energy? It will look it up for you.
</details>
<details><summary>Carbon footprint</summary><br/>
What is its carbon footprint and how does it compare with others? It will look it up for you.
</details>
<details><summary>HTTP/2.0</summary><br/>
Is it really using HTTP/2.0 protocol? It will look it up for you.
</details>
<details><summary>Text compression</summary><br/>
Is it compressing all of its text data? It will look it up for you.
</details>
<details><summary>Bot traffic</summary><br/>
Is it preventing bots from wasting its bandwidth? It will look it up for you.
</details>
<details><summary>Cookie optimisation</summary><br/>
Are its cookies optimised and fairly sized? It will look it up for you.
</details>
<details><summary>Browser caching</summary><br/>
Is it taking fully advantage of browser caching? Is it wasting resources? It will look it up for you.
</details>
<details><summary>URL redirects</summary><br/>
Is it wasting resources with URL redirects? It will look it up for you.
</details>

### Design Audits

Targets the website assets that convert code to user consumable content.

<details><summary>WebP images</summary><br/>
Is it using the lightweight but powerful WebP image format on its images? It will look it up for you.
</details>
<details><summary>WebM videos</summary><br/>
Is it using the WebM video format on its videos? It will look it up for you.
</details>
<details><summary>Lazy loading on media</summary><br/>
Is it lazily loading its media assets so they are only downloaded on demand? It will look it up for you.
</details>
<details><summary>Font subsetting</summary><br/>
Is it subseting its fonts to only contain the necessary chars? It will look it up for you.
</details>
<details><summary>Console logs</summary><br/>
Is it handling the error and warning console logs or simply ignoring them? It will look it up for you.
</details>
<details><summary>Pixel energy efficiency</summary><br/>
Is it considering the energy produced by each pixel for displaying its contents? It will look it up for you.
</details>
<details><summary>Dark mode</summary><br/>
Does it have a dark mode theme to save energy? It will look it up for you.
</details>
<details><summary>Reactive CSS animations</summary><br/>
Is it implementing some logic to stop/display animations on demand? It will look it up for you.
</details>
<details><summary>Inline assets</summary><br/>
Is it inlining big JS and CSS assets and thus preventing the browser from storing those in memory? It will look it up for you.
</details>
</p>

> Are you ready to try it? 
> - Jump right into the [demo part](#Try-it-now) and see it by yourself!

Or stay for getting to know better the architecture with our diagrams.


## Basic architecture

To better know what exactly does `sustainability` in the background for each run, please [refer to here](https://github.com/auditsdigital/sustainability/blob/master/CONTRIBUTION-dev.md).


## Try it now

### User Interface 

Visit the site [https://audits.digital](https://audits.digital), enter a URL and wait for the report to be generated for you. That's it.

<img style="text-align: center;" src="https://raw.githubusercontent.com/auditsdigital/sustainability/master/ui.png">

<details><summary>NPM - @auditsdigital/sustainability </summary>

Install puppeteer (if you don't already have it installed):

`npm i puppeteer`

Install sustainability locally:

`npm i @auditsdigital/sustainability`

Now you can use it on your Node.js application. Take as example the following code:

```js
const { Sustainability } = require("sustainability");

const url = "https://www.example.org";

(async () => {
  const report = await Sustainability.audit(url);
  console.log(report);
})();
```

</details>
<details><summary>CLI</summary>

`sustainability [opts] url`<br/>
Which produces the following report object:

```js
{
  globalScore: 88,
  meta: {
    id: '4c21fbb0-ba35-11ea-bd32-09a6ce997b13',
    url: 'https://www.example.org',
    timing: [ 1593454566154, 1593454568225 ]
  },
  audits: [
    { category: [Object], score: 75, audits: [Object] },
    { category: [Object], score: 100, audits: [Object] }
  ]
}
```

</details>
<details><summary>Docker</summary>
<br/>

You can pull the latest `trydas/sustainability` docker image from [this repository](https://hub.docker.com/repository/docker/trydas/sustainability)

Note that you will also need to have a local installation of Redis or a running docker image.

### Environment variables

- REDIS_HOST (default to 127.0.0.1)
- REDIS_PORT (default to 6379)
- FRONTEND_URL (for setting up CORS, default to '*', defaults to null when `NODE_ENV=production` is set)
- REDIS_URL (default to unset)

### With docker compose

1. Run docker-compose file in the root docker folder. <br/>

```sh
cd docker/
docker-compose up -d
```

2. Open up a web browser and visit `http://localhost:8081`

3. Enter a url and run audits

</details>

<details><summary>API</summary>

### class: Sustainability

Sustainability module provides a method to run the sustainability audits on a URL.

<p>
<details><summary>Sustainability.audit(URL, settings)</summary><br/>

- `URL` <[string]> A valid and reachable URL to evaluate. **Warning**: You are responsible for providing a valid URL.
- `settings` <[Object]> Set of configurable settings for the audit. May include the following optional fields:
  - `browser` <[Browser]> Your own puppeteer's browser instance. If you set this options, the API won't spawn a browser instance. This may be useful if you want to make use of the `launch.connect(wsEndpoint)` method to remotely run a headless browser and pass it to the API. **Warning**: You will be responsible for handling the browser instance.
  - `launchSettings` <[Object]> passed to [puppeteer.launch]. Refer to [Puppeteer] documentation for more information. Defaults to `{}`.
  - `connectionSettings` <[Object]> Set of configurable connection settings. May include the following fields:
    - `maxNavigationTime`<[number]> Specifies a timeout in milliseconds (ms) for all the tasks. Defaults to 60000ms.
    - `maxScrollInterval` <[number]> Specifies the scrolling interval in milliseconds (ms) in the function that determines lazy loaded images. Defaults to 30ms.
    - `emulatedDevice` <[Object]> Set of emulated device settings. May include the following fields:
      - `userAgent` <[string]> A user-agent string.
      - `viewport` <[Object]> Set of viewport settings. May include the following fields:
        - `width` <[number]>
        - `height` <[number]>
      - `name` <[string]> Optional
      - `location` <[Object]> Set of location settings. May include the following fields:
        - `name` <[string]> The location name.
        - `latitude` <[number]> Latitude between -90 and 90
        - `longitude` <[number]> Longitude between -180 and 180
        - `accuracy`<[number]> Optional non-negative accuracy value
    - `coldRun` <[boolean]> Should initialise a cold run to find any potential URL redirect. Defaults to true.
    - `streams` <[boolean]> Should push individual audits results as they go. Defaults to false.
    </details>
    <details><summary>Sustainability.auditStream</summary><br/>

A readable stream of audits to pipe from. Used in combination with streams option.

For example:

```js
(async () => {
  Sustainability.auditStream.pipe(process.stdout);
  await Sustainability.audit(url, {
    connectionSettings: { streams: true },
  });
})();
```

</details>
</details>


<details><summary>Debugging</summary>

You can enable verbose logging to see the API in action.
This is done by setting the `DEBUG` environmental variable to `sustainability:*.` or with the `-d` option in the CLI.

For example:

```bash
# Linux
DEBUG=sustainability:* node index.js
# Windows Powershell
$env:DEBUG=sustainability:* node index.js
```

</details>

## Contributions are welcomed

This is open-source software. We highly encourage everyone interested to help pushing up this project.\
Core development? Join the team! Make sure you read first the [contributions-dev notes.](https://github.com/auditsdigital/sustainability/blob/master/CONTRIBUTION-dev.md)\
Found and issue, visibility, business aspects, sharing your thoughts? [Open a new issue](https://github.com/auditsdigital/sustainability/issues/new)\
Sponsoring? Help us to keep the project running in [Open Collective](https://opencollective.com/das).

[puppeteer]: https://github.com/GoogleChrome/puppeteer "Puppeteer"
[puppeteer.launch]: https://github.com/GoogleChrome/puppeteer/blob/v1.5.0/docs/api.md#puppeteerlaunchoptions "puppeteer.launch"
[page]: https://github.com/GoogleChrome/puppeteer/blob/v1.5.0/docs/api.md#class-page "Page"
[browser]: https://github.com/puppeteer/puppeteer/blob/v1.5.0/docs/api.md#class-browser "Browser"

## License

All the code and documents are licensed under MIT.


## Useful links

- [1] https://doi.org/10.1016/j.erss.2018.01.018.
- DAS video https://www.youtube.com/watch?v=3kDEQy2p4NY 


