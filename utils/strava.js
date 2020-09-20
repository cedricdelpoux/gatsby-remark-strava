const stravaApi = require("strava-v3")
const errors = require("request-promise/errors")

class Strava {
  constructor() {
    this.token = null
  }

  async init({clientId, clientSecret, token}) {
    this.token = JSON.parse(token)

    stravaApi.config({
      client_id: clientId,
      client_secret: clientSecret,
    })

    let expired = true

    if (this.token.expires_at) {
      const nowDate = new Date()
      const expirationDate = new Date(this.token.expires_at * 1000)
      expired = expirationDate.getTime() < nowDate.getTime()
    }

    if (expired) {
      const refreshedToken = await stravaApi.oauth.refreshToken(
        this.token.refresh_token
      )

      this.token = refreshedToken
    }

    if (!this.isTokenValid()) {
      throw new Error(
        "Invalid token. Please regenerate one using `gatsby-remark-strava-token` command"
      )
    }
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

  async getActivity(id) {
    return new Promise((resolve, reject) => {
      const {access_token} = this.token

      stravaApi.activities
        .get({id, access_token})
        .then((payload) => {
          return resolve(payload)
        })
        .catch(errors.StatusCodeError, (statusCodeError) => {
          return reject(new Error(statusCodeError.error.message))
        })
    })
  }
}

const strava = new Strava()

exports.strava = strava
