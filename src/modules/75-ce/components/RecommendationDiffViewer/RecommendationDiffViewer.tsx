/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text, Color } from '@wings-software/uicore'
import type { BorderProps } from '@harness/uicore/dist/styled-props/border/BorderProps'
import { QualityOfService, ResourceDetails, ResourceObject } from '@ce/types'

import css from './RecommendationDiffViewer.module.scss'

interface DiffBlockProps {
  text: string
  color: string
  textColor: string
  resources: ResourceDetails
  border?: BorderProps
  qualityOfService?: string
  dataTestId?: string
}

const DiffBlock: React.FC<DiffBlockProps> = ({
  text,
  color,
  resources,
  textColor,
  border,
  qualityOfService,
  dataTestId
}) => {
  const innerElement = (
    <>
      <Text className={css.monospace}>{text}:</Text>
      <Layout.Horizontal padding={{ left: 'medium', top: 'xsmall' }}>
        <Text className={css.monospace}>memory:</Text>
        <Text color={textColor} padding={{ left: 'small' }} data-testid={`${dataTestId}-memVal`}>
          {resources.memory}
        </Text>
      </Layout.Horizontal>
      {qualityOfService !== QualityOfService.BURSTABLE ? (
        <Layout.Horizontal padding={{ left: 'medium', top: 'xsmall' }}>
          <Text className={css.monospace}>cpu:</Text>
          {resources.cpu ? (
            <Text color={textColor} padding={{ left: 'xsmall' }} data-testid={`${dataTestId}-cpuVal`}>
              {resources.cpu}
            </Text>
          ) : null}
        </Layout.Horizontal>
      ) : null}
    </>
  )
  return border ? (
    <Container
      background={color}
      padding={{
        left: 'xxlarge',
        top: 'small',
        bottom: 'small'
      }}
      border={{ ...border, color: Color.GREEN_700, width: 2 }}
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
      <DiffBlock resources={currentResources.limits} text="limits" color="green100" textColor="red500" />
      <DiffBlock
        resources={
          qualityOfService === QualityOfService.GUARANTEED ? recommendedResources.requests : recommendedResources.limits
        }
        text="limits"
        color="green100"
        border={{ left: true, right: true }}
        textColor="green500"
        qualityOfService={qualityOfService}
        dataTestId="limitsId"
      />
      <DiffBlock resources={currentResources.requests} text="request" color="primary1" textColor="red500" />
      <DiffBlock
        resources={recommendedResources.requests}
        text="request"
        color="primary1"
        border={{ left: true, right: true, bottom: true }}
        textColor="green500"
        dataTestId="requestId"
      />
    </Container>
  )
}

export default RecommendationDiffViewer
