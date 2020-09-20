import React from "react"
import {graphql} from "gatsby"

export default ({data: {page}}) => {
  return <div dangerouslySetInnerHTML={{__html: page.html}} />
}

export const pageQuery = graphql`
  query Page($path: String!) {
    page: markdownRemark(fields: {slug: {eq: $path}}) {
      html
    }
  }
`
