/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Card, Formik, FormikForm, Layout } from '@harness/uicore'
import React, { ReactElement } from 'react'
import FlagToggleSwitch from '@cf/components/EditFlagTabs/FlagToggleSwitch'
import type { Feature, Serve } from 'services/cf'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import usePatchFeatureFlag from './hooks/usePatchFeatureFlag'
import css from './TargetingRulesTab.module.scss'

export interface TargetingRulesFormValues {
  state: string
}

interface TargetingRulesTabProps {
  featureFlag: Feature
  refetchFlag: () => Promise<unknown>
}

const TargetingRulesTab = ({ featureFlag, refetchFlag }: TargetingRulesTabProps): ReactElement => {
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
    // gitDetails: gitSyncInitialValues.gitDetails,
    // autoCommit: gitSyncInitialValues.autoCommit
  }

  const { saveChanges } = usePatchFeatureFlag({
    initialValues,
    refetchFlag,
    featureFlagIdentifier: featureFlag.identifier
  })

  return (
    <Formik
      enableReinitialize={true}
      validateOnChange={false}
      validateOnBlur={false}
      formName="targeting-rules-form"
      initialValues={initialValues}
      // validate={validateForm}
      // validationSchema={yup.object().shape({
      //   gitDetails: gitSyncValidationSchema
      // })}
      // onSubmit={onSaveChanges}
      onSubmit={values => {
        saveChanges(values)
      }}
    >
      {formikProps => {
        return (
          <FormikForm style={{ height: '60vh' }}>
            <Layout.Vertical padding={{ left: 'xlarge', right: 'xlarge' }} height="100%">
              <Layout.Vertical spacing="small">
                <Card elevation={0}>
                  <FlagToggleSwitch
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
            </Layout.Vertical>
            {formikProps.dirty && (
              <Layout.Horizontal padding="medium" spacing="small" className={css.actionButtons}>
                <Button
                  type="submit"
                  text="Save Changes"
                  variation={ButtonVariation.PRIMARY}
                  onClick={e => {
                    e.preventDefault()
                    return formikProps.submitForm()
                  }}
                  //   text={getString('save')}
                  //   onClick={event => {
                  //     if (gitSync?.isGitSyncEnabled && !gitSync?.isAutoCommitEnabled) {
                  //       event.preventDefault()
                  //       setIsGitSyncModalOpen(true)
                  //     }
                  //   }}
                />
                <Button
                  variation={ButtonVariation.TERTIARY}
                  text="Cancel"
                  //   text={getString('cancel')}
                  //   onClick={(e: MouseEvent) => {
                  //     e.preventDefault()
                  //     onCancelEditHandler()
                  //     formikProps.handleReset()
                  //   }}
                />
              </Layout.Horizontal>
            )}
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export default TargetingRulesTab
