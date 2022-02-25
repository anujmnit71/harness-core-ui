/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Card, Container, Formik, FormikForm, Layout } from '@harness/uicore'
import React, { ReactElement } from 'react'
import FlagToggleSwitch from '@cf/components/EditFlagTabs/FlagToggleSwitch'
import type { Feature, Serve } from 'services/cf'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import usePatchFeatureFlag from './hooks/usePatchFeatureFlag'
import css from './TargetingRulesTab.module.scss'

export interface TargetingRulesFormValues {
  state: string
}

interface TargetingRulesTabProps {
  featureFlag: Feature
}

const TargetingRulesTab = ({ featureFlag }: TargetingRulesTabProps): ReactElement => {
  const { getString } = useStrings()

  const initialValues = {
    state: featureFlag.envProperties?.state as string,
    onVariation: featureFlag.envProperties?.defaultServe.variation
      ? featureFlag.envProperties?.defaultServe.variation
      : featureFlag.defaultOnVariation,
    offVariation: featureFlag.envProperties?.offVariation as string,
    defaultServe: featureFlag.envProperties?.defaultServe as Serve,
    variationMap:
      featureFlag.envProperties?.variationMap?.filter(variationMapItem => !!variationMapItem?.targets?.length) ?? [],
    flagName: featureFlag.name,
    flagIdentifier: featureFlag.identifier
  }

  const { saveChanges, loading } = usePatchFeatureFlag({
    initialValues,
    featureFlagIdentifier: featureFlag.identifier
  })

  const formDisabled = loading

  return (
    <Formik
      enableReinitialize={true}
      validateOnChange={false}
      validateOnBlur={false}
      formName="targeting-rules-form"
      initialValues={initialValues}
      onSubmit={(values, formikBag) => {
        saveChanges(values, () => formikBag.resetForm({ ...values }))
      }}
    >
      {formikProps => {
        return (
          <FormikForm>
            <Container className={css.tabContainer}>
              <Layout.Vertical spacing="small" padding={{ left: 'xlarge', right: 'xlarge' }}>
                <Card elevation={0}>
                  <FlagToggleSwitch
                    disabled={formDisabled}
                    currentState={formikProps.values.state}
                    currentEnvironmentState={featureFlag.envProperties?.state}
                    handleToggle={() =>
                      formikProps.setFieldValue(
                        'state',
                        formikProps.values.state === FeatureFlagActivationStatus.OFF
                          ? FeatureFlagActivationStatus.ON
                          : FeatureFlagActivationStatus.OFF
                      )
                    }
                  />
                </Card>
                <Card>ON default rules section</Card>
                <Card>OFF rules section</Card>
              </Layout.Vertical>

              {formikProps.dirty && (
                <Layout.Horizontal padding="medium" spacing="small" className={css.actionButtons}>
                  <Button
                    type="submit"
                    text={getString('save')}
                    loading={formDisabled}
                    disabled={formDisabled}
                    variation={ButtonVariation.PRIMARY}
                    onClick={e => {
                      e.preventDefault()
                      formikProps.submitForm()
                    }}
                  />

                  <Button
                    variation={ButtonVariation.TERTIARY}
                    text={getString('cancel')}
                    disabled={formDisabled}
                    onClick={e => {
                      e.preventDefault()
                      formikProps.handleReset()
                    }}
                  />
                </Layout.Horizontal>
              )}
            </Container>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export default TargetingRulesTab
