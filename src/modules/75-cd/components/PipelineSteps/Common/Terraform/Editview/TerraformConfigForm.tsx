/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  Button,
  Color,
  Formik,
  Layout,
  Text,
  Heading,
  Card,
  Icon,
  ButtonVariation,
  ButtonSize,
  FormInput,
  SelectOption,
  getMultiTypeFromValue,
  MultiTypeInputType,
  StepProps
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { Form } from 'formik'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import {
  AllowedTypes,
  tfVarIcons,
  ConnectorMap,
  ConnectorLabelMap,
  ConnectorTypes,
  formInputNames,
  formikOnChangeNames,
  stepTwoValidationSchema
} from './TerraformConfigFormHelper'

import type { Connector } from '../TerraformInterfaces'

import css from './TerraformConfigForm.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface TerraformConfigStepOneProps {
  data: any
  isReadonly: boolean
  allowableTypes: MultiTypeInputType[]
  isEditMode: boolean
  selectedConnector: string
  setConnectorView: (val: boolean) => void
  setSelectedConnector: (val: ConnectorTypes) => void
  isTerraformPlan?: boolean
}

export const TerraformConfigStepOne: React.FC<StepProps<any> & TerraformConfigStepOneProps> = ({
  data,
  isReadonly,
  allowableTypes,
  nextStep,
  isEditMode,
  setConnectorView,
  selectedConnector,
  setSelectedConnector,
  isTerraformPlan = false
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  useEffect(() => {
    const selectedStore = isTerraformPlan
      ? data?.spec?.configuration?.configFiles?.store?.type
      : data?.spec?.configuration?.spec?.configFiles?.store?.type
    setSelectedConnector(selectedStore)
  }, [isEditMode])

  const newConnectorLabel = `${getString('newLabel')} ${
    !!selectedConnector && getString(ConnectorLabelMap[selectedConnector as ConnectorTypes])
  } ${getString('connector')}`
  const connectorError = getString('pipelineSteps.build.create.connectorRequiredError')
  const configSchema = {
    configFiles: Yup.object().shape({
      store: Yup.object().shape({
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(connectorError)
        })
      })
    })
  }
  const validationSchema = isTerraformPlan
    ? Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            ...configSchema
          })
        })
      })
    : Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            spec: Yup.object().shape({
              ...configSchema
            })
          })
        })
      })

  return (
    <Layout.Vertical padding="small" className={css.tfConfigForm}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {getString('cd.configFileStore')}
      </Heading>

      <Layout.Horizontal className={css.horizontalFlex} margin={{ top: 'xlarge', bottom: 'xlarge' }}>
        {AllowedTypes.map(item => (
          <div key={item} className={css.squareCardContainer}>
            <Card
              className={css.connectorIcon}
              selected={item === selectedConnector}
              data-testid={`varStore-${item}`}
              onClick={() => {
                setSelectedConnector(item as ConnectorTypes)
              }}
            >
              <Icon name={tfVarIcons[item]} size={26} />
            </Card>
            <Text color={Color.BLACK_100}>{item}</Text>
          </div>
        ))}
      </Layout.Horizontal>

      <Formik
        formName="tfPlanConfigForm"
        enableReinitialize={true}
        onSubmit={() => {
          /* istanbul ignore next */
        }}
        initialValues={data}
        validationSchema={validationSchema}
      >
        {formik => {
          const config = formik?.values?.spec?.configuration
          const connectorRef = isTerraformPlan
            ? config?.configFiles?.store?.spec?.connectorRef
            : config?.spec?.configFiles?.store?.spec?.connectorRef
          const disabled =
            !connectorRef ||
            (getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED &&
              !(connectorRef as ConnectorSelectedValue)?.connector &&
              connectorRef?.connector?.type !== selectedConnector)
          return (
            <Form className={css.formComponent}>
              <div className={css.formContainerStepOne}>
                {selectedConnector && (
                  <Layout.Horizontal className={css.horizontalFlex} spacing={'medium'}>
                    <FormMultiTypeConnectorField
                      label={`${selectedConnector} ${getString('connector')}`}
                      type={ConnectorMap[selectedConnector]}
                      width={400}
                      name={
                        isTerraformPlan
                          ? 'spec.configuration.configFiles.store.spec.connectorRef'
                          : 'spec.configuration.spec.configFiles.store.spec.connectorRef'
                      }
                      placeholder={getString('select')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      style={{ marginBottom: 10 }}
                      multiTypeProps={{ expressions, allowableTypes }}
                    />
                    <Button
                      className={css.newConnectorButton}
                      variation={ButtonVariation.LINK}
                      size={ButtonSize.SMALL}
                      disabled={isReadonly}
                      id="new-config-connector"
                      text={newConnectorLabel}
                      icon="plus"
                      iconProps={{ size: 12 }}
                      onClick={() => {
                        setConnectorView(true)
                        nextStep?.({ ...data, selectedType: selectedConnector })
                      }}
                    />
                  </Layout.Horizontal>
                )}
              </div>
              <Layout.Horizontal spacing="xxlarge">
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  onClick={() => nextStep?.({ ...formik.values, selectedType: selectedConnector })}
                  disabled={disabled}
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

interface TerraformConfigStepTwoProps {
  allowableTypes: MultiTypeInputType[]
  isReadonly: boolean
  onSubmitCallBack: any
  isTerraformPlan?: boolean
}

export const TerraformConfigStepTwo: React.FC<StepProps<any> & TerraformConfigStepTwoProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isReadonly = false,
  allowableTypes,
  isTerraformPlan = false
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]
  const validationSchema = stepTwoValidationSchema(isTerraformPlan, getString)

  return (
    <Layout.Vertical padding="small" className={css.tfConfigForm}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {getString('cd.configFileDetails')}
      </Heading>
      <Formik
        formName="tfRemoteWizardForm"
        initialValues={prevStepData}
        onSubmit={onSubmitCallBack}
        validationSchema={validationSchema}
      >
        {formik => {
          const connectorValue = (
            isTerraformPlan
              ? formik.values.spec?.configuration?.configFiles?.store?.spec?.connectorRef
              : formik.values.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
          ) as Connector
          const store = isTerraformPlan
            ? formik.values?.spec?.configuration?.configFiles?.store?.spec
            : formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec
          return (
            <Form className={css.formComponent}>
              <div className={css.tfRemoteForm}>
                {(connectorValue?.connector?.spec?.connectionType === 'Account' ||
                  connectorValue?.connector?.spec?.type === 'Account' ||
                  prevStepData?.urlType === 'Account') && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.repoName')}
                      name={formInputNames(isTerraformPlan).repoName}
                      placeholder={getString('pipelineSteps.repoName')}
                      multiTextInputProps={{ expressions, allowableTypes: allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.repoName) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={store?.repoName as string}
                        type="String"
                        variableName="configuration.configFiles.store.spec.repoName"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue(formikOnChangeNames(isTerraformPlan).repoName, value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={gitFetchTypes}
                    name={formInputNames(isTerraformPlan).gitFetchType}
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                  />
                </div>
                {store?.gitFetchType === gitFetchTypes[0].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name={formInputNames(isTerraformPlan).branch}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.branch) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={store?.branch as string}
                        type="String"
                        variableName="configuration.spec.configFiles.store.spec.branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue(formikOnChangeNames(isTerraformPlan).branch, value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}

                {store?.gitFetchType === gitFetchTypes[1].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name={formInputNames(isTerraformPlan).commitId}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.commitId) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={store?.commitId as string}
                        type="String"
                        variableName={formInputNames(isTerraformPlan).commitId}
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue(formikOnChangeNames(isTerraformPlan).commitId, value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('cd.folderPath')}
                    placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                    name={formInputNames(isTerraformPlan).folderPath}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(store?.folderPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginTop: 1 }}
                      value={store?.folderPath as string}
                      type="String"
                      variableName="formik.values.spec?.configuration?.configFiles?.store.spec?.folderPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue(formikOnChangeNames(isTerraformPlan).folderPath, value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>
              </div>

              <Layout.Horizontal spacing="xxlarge">
                <Button
                  text={getString('back')}
                  variation={ButtonVariation.SECONDARY}
                  icon="chevron-left"
                  onClick={() => previousStep?.()}
                  data-name="tf-remote-back-btn"
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
