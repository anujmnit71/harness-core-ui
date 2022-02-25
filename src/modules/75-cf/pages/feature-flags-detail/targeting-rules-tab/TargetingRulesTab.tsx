/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Card, Container, Formik, FormikForm, Layout } from '@harness/uicore'
import React, { ReactElement } from 'react'
import FlagToggleSwitch from '@cf/components/EditFlagTabs/FlagToggleSwitch'
import type { Feature } from 'services/cf'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import usePatchFeatureFlag from './hooks/usePatchFeatureFlag'
import css from './TargetingRulesTab.module.scss'

export interface TargetingRulesFormValues {
  state: string
}

export interface TargetingRulesTabProps {
  featureFlagData: Feature
  refetchFlag: () => Promise<unknown>
  refetchFlagLoading: boolean
}

const TargetingRulesTab = ({
  featureFlagData: featureFlagData,
  refetchFlag,
  refetchFlagLoading
}: TargetingRulesTabProps): ReactElement => {
  const { getString } = useStrings()

  const initialValues = {
    state: featureFlagData.envProperties?.state as string
  }

  const { saveChanges, loading: patchFeatureLoading } = usePatchFeatureFlag({
    initialValues,
    featureFlagIdentifier: featureFlagData.identifier,
    refetchFlag
  })

  const isLoading = patchFeatureLoading || refetchFlagLoading

  return (
    <Formik
      enableReinitialize={true}
      validateOnChange={false}
      validateOnBlur={false}
      formName="targeting-rules-form"
      initialValues={initialValues}
      onSubmit={values => {
        saveChanges(values)
      }}
    >
      {formikProps => {
        return (
          <FormikForm>
            <Container className={css.tabContainer}>
              <Layout.Vertical spacing="small" padding={{ left: 'xlarge', right: 'xlarge' }}>
                <Card elevation={0}>
                  <FlagToggleSwitch
                    disabled={isLoading}
                    currentState={formikProps.values.state}
                    currentEnvironmentState={featureFlagData.envProperties?.state}
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
                <Layout.Horizontal
                  data-testid="targeting-rules-footer"
                  padding="medium"
                  spacing="small"
                  className={css.actionButtons}
                >
                  {isLoading && (
                    <Button type="submit" text={getString('save')} loading variation={ButtonVariation.PRIMARY} />
                  )}

                  {!isLoading && (
                    <Button
                      type="submit"
                      text={getString('save')}
                      variation={ButtonVariation.PRIMARY}
                      onClick={e => {
                        e.preventDefault()
                        formikProps.submitForm()
                      }}
                    />
                  )}

                  <Button
                    variation={ButtonVariation.TERTIARY}
                    text={getString('cancel')}
                    disabled={isLoading}
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
