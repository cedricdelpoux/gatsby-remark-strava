const stravaApi = require("strava-v3")

// Gatsby runs the plugin on every document at once: without a limit, a site
// with many embeds opens as many connections to Strava at the same time, and
// some of them fail on a busy build machine
const MAX_CONCURRENT_REQUESTS = 4

class Strava {
  constructor() {
    this.token = null
    this.initializing = null
    this.initialized = false
    this.running = 0
    this.waiting = []
  }

  // Every document calls it: the token is refreshed once for all of them,
  // and again only once the refreshed one has expired. Until then, the token
  // read from the options is still the expired one, which must not start
  // another refresh.
  init(options) {
    if (!this.initializing || (this.initialized && this.isTokenExpired())) {
      this.initializing = this.refresh(options).catch((e) => {
        // The next document tries again
        this.initializing = null
        throw e
      })
    }

    return this.initializing
  }

  async refresh({clientId, clientSecret, token}) {
    this.initialized = false
    this.token = JSON.parse(token)

    stravaApi.config({
      client_id: clientId,
      client_secret: clientSecret,
    })

    if (this.isTokenExpired()) {
      this.token = await stravaApi.oauth.refreshToken(this.token.refresh_token)
    }

    if (!this.isTokenValid()) {
      throw new Error(
        "Invalid token. Please regenerate one using `gatsby-remark-strava-token` command"
      )
    }

    this.initialized = true
  }

  isTokenExpired() {
    if (!this.token || !this.token.expires_at) {
      return true
    }

    return this.token.expires_at * 1000 < Date.now()
  }

  isTokenValid() {
    if (
      this.token &&
      this.token.access_token &&
      this.token.refresh_token &&
      this.token.expires_at
    ) {
      return true
    }

    return false
  }

  // Waits for one of the MAX_CONCURRENT_REQUESTS slots. A finished request
  // hands its slot over to the next waiting one instead of freeing it, so
  // that no other request can take it in between.
  async acquire() {
    if (this.running < MAX_CONCURRENT_REQUESTS) {
      this.running++
      return
    }

    await new Promise((resolve) => this.waiting.push(resolve))
  }

  release() {
    const next = this.waiting.shift()

    if (next) {
      next()
    } else {
      this.running--
    }
  }

  // Rejects on any error, a network one included: an error left unhandled
  // would stop the whole Gatsby build
  async getActivity(id) {
    await this.acquire()

    try {
      return await stravaApi.activities.get({
        id,
        access_token: this.token.access_token,
      })
    } catch (e) {
      // An HTTP error carries Strava's own message in its body
      throw new Error((e.error && e.error.message) || e.message)
    } finally {
      this.release()
    }
  }
}

const strava = new Strava()

exports.strava = strava
