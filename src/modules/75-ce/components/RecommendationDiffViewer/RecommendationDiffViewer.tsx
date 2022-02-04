/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import type { ResourceDetails, ResourceObject } from '@ce/types'

import css from './RecommendationDiffViewer.module.scss'

interface DiffBlockProps {
  text: string
  color: string
  textColor: string
  resources: ResourceDetails
  showLeftBorder?: boolean
  qualityOfService: string
}

const DiffBlock: React.FC<DiffBlockProps> = ({
  text,
  color,
  resources,
  textColor,
  showLeftBorder,
  qualityOfService
}) => {
  const innerElement = (
    <>
      {/* {qualityOfService === 'GUARANTEED' ? ( */}
      <Text style={{ fontFamily: "'Roboto Mono', monospace" }}>{text}:</Text>
      {/* ) : null} */}
      <Layout.Horizontal padding={{ left: 'medium', top: 'xsmall' }}>
        <Text style={{ fontFamily: "'Roboto Mono', monospace" }}>memory:</Text>
        <Text color={textColor} padding={{ left: 'small' }}>
          {resources.memory}
        </Text>
      </Layout.Horizontal>
      {qualityOfService !== 'BURSTABLE' ? (
        <Layout.Horizontal padding={{ left: 'medium', top: 'xsmall' }}>
          <Text style={{ fontFamily: "'Roboto Mono', monospace" }}>cpu:</Text>
          <Text style={{ fontFamily: "'Roboto Mono', monospace" }} color={textColor} padding={{ left: 'xsmall' }}>
            {resources.cpu || '-'}
          </Text>
        </Layout.Horizontal>
      ) : null}
    </>
  )
  return showLeftBorder ? (
    <Container
      background={color}
      padding={{
        left: 'xxlarge',
        top: 'small',
        bottom: 'small'
      }}
      border={{
        left: showLeftBorder
      }}
    >
      {innerElement}
    </Container>
  ) : (
    <Container
      background={color}
      padding={{
        left: 'xxlarge',
        top: 'small',
        bottom: 'small'
      }}
    >
      {innerElement}
    </Container>
  )
}

interface RecommendationDiffViewerProps {
  recommendedResources: ResourceObject
  currentResources: ResourceObject
  qualityOfService: string
}

const RecommendationDiffViewer: React.FC<RecommendationDiffViewerProps> = ({
  recommendedResources,
  currentResources,
  qualityOfService
}) => {
  return (
    <Container className={css.diffContainer}>
      <DiffBlock
        resources={currentResources.limits}
        text="limits"
        color="green100"
        textColor="red500"
        qualityOfService={qualityOfService}
      />
      <DiffBlock
        resources={qualityOfService === 'GUARANTEED' ? recommendedResources.requests : recommendedResources.limits}
        text="limits"
        color="green100"
        showLeftBorder
        textColor="green500"
        qualityOfService={qualityOfService}
      />
      <DiffBlock
        resources={currentResources.requests}
        text="request"
        color="primary1"
        textColor="red500"
        qualityOfService={qualityOfService}
      />
      <DiffBlock
        resources={recommendedResources.requests}
        text="request"
        color="primary1"
        showLeftBorder
        textColor="green500"
        qualityOfService={qualityOfService}
      />
    </Container>
  )
}

export default RecommendationDiffViewer
