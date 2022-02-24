/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { defaultTo } from 'lodash-es'
import { Button, CardSelect, Container, Heading, Layout, StepProps, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  useSelectCards,
  RequirementCard,
  CardData,
  FeaturesString
} from '@connectors/common/RequirementCard/RequirementCard'
import type { GcpCloudCostConnector } from 'services/cd-ng'
import type { CEGcpConnectorDTO } from './OverviewStep'
import css from '../CreateCeGcpConnector.module.scss'

const ChooseRequirements: React.FC<StepProps<CEGcpConnectorDTO>> = ({ prevStepData, nextStep, previousStep }) => {
  const { getString } = useStrings()
  const featuresEnabled = prevStepData?.spec?.featuresEnabled || []

  const featureCards = useRef<CardData[]>([
    {
      icon: 'ce-visibility',
      text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
      value: 'BILLING',
      heading: getString('connectors.costVisibility'),
      prefix: getString('common.aws'),
      isDefaultSelected: true,
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.default.feat1'),
        getString('connectors.ceAzure.chooseRequirements.visibility.feat2'),
        getString('connectors.ceAzure.chooseRequirements.visibility.feat3'),
        getString('connectors.ceAzure.chooseRequirements.visibility.feat4'),
        getString('connectors.ceAzure.chooseRequirements.visibility.feat5')
      ],
      footer: getString('connectors.ceAws.crossAccountRoleStep1.default.footer')
    },
    {
      icon: 'ce-visibility',
      text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
      value: 'VISIBILITY',
      heading: getString('connectors.ceAws.crossAccountRoleStep1.visible.heading'),
      prefix: getString('connectors.ceAws.crossAccountRoleStep1.visible.prefix'),
      isDefaultSelected: false,
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.visible.feat1'),
        getString('connectors.ceAws.crossAccountRoleStep1.visible.feat2')
      ],
      footer: (
        <>
          {getString('connectors.ceAzure.chooseRequirements.optimization.footer1')}{' '}
          <a
            href="https://ngdocs.harness.io/article/80vbt5jv0q-set-up-cost-visibility-for-aws#aws_ecs_and_resource_inventory_management"
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
          >
            {getString('permissions').toLowerCase()}
          </a>{' '}
          {getString('connectors.ceAws.crossAccountRoleStep1.optimize.footer')}
        </>
      )
    },
    {
      icon: 'nav-settings',
      text: getString('connectors.ceAzure.chooseRequirements.optimizationCardDesc'),
      value: 'OPTIMIZATION',
      heading: getString('common.ce.autostopping'),
      prefix: getString('connectors.ceAws.crossAccountRoleStep1.optimize.prefix'),
      isDefaultSelected: false,
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.optimize.feat1'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat2'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat3'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat4')
      ],
      footer: (
        <>
          {getString('connectors.ceAzure.chooseRequirements.optimization.footer1')}{' '}
          <a
            href="https://ngdocs.harness.io/article/80vbt5jv0q-set-up-cost-visibility-for-aws#aws_resource_optimization_using_auto_stopping_rules"
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
          >
            {getString('permissions').toLowerCase()}
          </a>{' '}
          {getString('connectors.ceAws.crossAccountRoleStep1.optimize.footer')}
        </>
      )
    }
  ]).current

  const { selectedCards, setSelectedCards } = useSelectCards({ featuresEnabled, featureCards })

  const handleSubmit = () => {
    const features: FeaturesString[] = selectedCards.map(card => card.value)
    if (prevStepData?.includeBilling) features.push('BILLING')
    const newspec: GcpCloudCostConnector = {
      ...prevStepData?.spec,
      featuresEnabled: features,
      serviceAccountEmail: defaultTo(prevStepData?.serviceAccount, ''),
      projectId: ''
    }
    const payload = prevStepData
    if (payload) payload.spec = newspec
    nextStep?.(payload)
  }

  const handleprev = () => {
    previousStep?.({ ...(prevStepData as CEGcpConnectorDTO) })
  }

  const handleCardSelection = (item: CardData) => {
    if (!item.isDefaultSelected) {
      const sc = [...selectedCards]
      const index = sc.indexOf(item)
      if (index > -1) {
        sc.splice(index, 1)
      } else {
        sc.push(item)
      }

      setSelectedCards(sc)
    }
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAws.crossAccountRoleStep1.heading')}
        <span>{getString('connectors.ceAws.crossAccountRoleStep1.choosePermissions')}</span>
      </Heading>
      <Text color="grey800">{getString('connectors.ceAws.crossAccountRoleStep1.description')}</Text>
      <Container>
        <Text font={{ italic: true }}>{getString('connectors.ceAws.crossAccountRoleStep1.info')}</Text>
        <div style={{ flex: 1 }}>
          <div className={css.cards}>
            <CardSelect
              data={featureCards}
              selected={selectedCards}
              multi={true}
              className={css.grid}
              onChange={item => {
                handleCardSelection(item)
              }}
              cornerSelected={true}
              renderItem={item => <RequirementCard {...item} />}
            />
          </div>
          <Layout.Horizontal className={css.buttonPanel} spacing="small">
            <Button text={getString('previous')} icon="chevron-left" onClick={handleprev}></Button>
            <Button
              type="submit"
              intent="primary"
              text={getString('continue')}
              rightIcon="chevron-right"
              onClick={handleSubmit}
              disabled={!prevStepData?.includeBilling && selectedCards.length == 0}
            />
          </Layout.Horizontal>
        </div>
      </Container>
    </Layout.Vertical>
  )
}

export default ChooseRequirements
