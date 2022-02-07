/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Layout, Text, IconName, FontVariation, Color, Icon } from '@wings-software/uicore'
import React from 'react'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './RecommendationDetailsSummaryCards.module.scss'

interface RecommendationDetailsSavingsCardProps {
  title: string
  amount: string
  amountSubTitle?: string
  subTitle?: string
  iconName?: IconName
}

export const RecommendationDetailsSavingsCard: React.FC<RecommendationDetailsSavingsCardProps> = props => {
  const { title, amount, amountSubTitle, subTitle, iconName } = props
  const { getString } = useStrings()

  return (
    <Card className={cx(css.savingsCard)} style={{ backgroundColor: Color.PRIMARY_1 }} elevation={1}>
      <Layout.Vertical spacing="small">
        <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_500}>
          {title}
        </Text>
        <Layout.Horizontal style={{ alignItems: 'baseline' }} spacing="xsmall">
          {iconName ? <Icon name={iconName} size={28} color={Color.GREEN_700} /> : null}
          <Text color={Color.GREEN_700} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.recommendation.listPage.uptoText')}
          </Text>
          <Text className={css.amount} color={Color.GREEN_600} font={{ variation: FontVariation.H3 }}>
            {amount}
          </Text>
          {amountSubTitle ? (
            <Text color={Color.GREEN_700} font={{ variation: FontVariation.BODY2 }}>
              {amountSubTitle}
            </Text>
          ) : null}
        </Layout.Horizontal>
        {subTitle ? (
          <Text color={Color.GREY_500} font={{ variation: FontVariation.TINY }}>
            {subTitle}
          </Text>
        ) : null}
      </Layout.Vertical>
    </Card>
  )
}

interface RecommendationDetailsSpendCardProps {
  title: string
  withRecommendationAmount: string
  withoutRecommendationAmount: string
}

export const RecommendationDetailsSpendCard: React.FC<RecommendationDetailsSpendCardProps> = props => {
  const { title, withRecommendationAmount, withoutRecommendationAmount } = props
  const { getString } = useStrings()

  return (
    <Card className={cx(css.potentialSpendCard)} elevation={1}>
      <Layout.Vertical spacing="small">
        <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_500}>
          {title}
        </Text>
        <Layout.Horizontal padding={{ left: 'small', right: 'small' }}>
          <Layout.Vertical
            padding={{ top: 'medium', right: 'medium' }}
            flex={{ justifyContent: 'space-between', alignItems: 'start' }}
          >
            <Text className={css.amount} font={{ variation: FontVariation.H3 }}>
              {withRecommendationAmount}
            </Text>
            <Layout.Horizontal spacing="xsmall">
              <Text color={Color.GREEN_700} font={{ variation: FontVariation.TINY }}>
                ${getString('common.with')}
              </Text>
              <Text color={Color.GREY_500} font={{ variation: FontVariation.TINY }}>
                {getString('ce.recommendation.sideNavText').toLowerCase()}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
          <Layout.Vertical padding={{ top: 'large' }} flex={{ justifyContent: 'space-between', alignItems: 'start' }}>
            <Text className={css.amount} font={{ variation: FontVariation.H6 }}>
              {withoutRecommendationAmount}
            </Text>
            <Layout.Horizontal spacing="xsmall">
              <Text color={Color.RED_700} font={{ variation: FontVariation.TINY }}>
                {getString('common.without')}
              </Text>
              <Text color={Color.GREY_500} font={{ variation: FontVariation.TINY }}>
                ${getString('ce.recommendation.sideNavText').toLowerCase()}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Layout.Vertical>
    </Card>
  )
}
