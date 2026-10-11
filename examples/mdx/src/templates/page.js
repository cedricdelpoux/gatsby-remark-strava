import {MDXProvider} from "@mdx-js/react"
import React from "react"

const Strava = ({id, name}) => (
  <div data-testid="strava-embed">
    Strava activity #{id} — {name}
  </div>
)

const components = {strava: Strava}

const PageTemplate = ({children}) => (
  <MDXProvider components={components}>{children}</MDXProvider>
)

export default PageTemplate
