import { Container } from '@wings-software/uikit'
import React from 'react'
import css from './BlankLayout.module.scss'

//
// TODO: Implement BlankLayout as a very basic layout with a Harness
// logo and header on top, the rest is reserved for page content.
// @see https://qa.harness.io/#/account/zEaak-FLS425IEO7OLzMUg/onboarding
// as an example
//

export const BlankLayout: React.FC = ({ children }) => {
  return <Container className={css.layout}>{children}</Container>
}
