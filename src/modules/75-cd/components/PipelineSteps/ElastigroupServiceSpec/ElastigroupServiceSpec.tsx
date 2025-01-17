/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { set, get, isEmpty } from 'lodash-es'
import { parse } from 'yaml'
import type { FormikErrors } from 'formik'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import {
  ServiceSpec,
  getConnectorListV2Promise,
  ResponsePageConnectorResponse,
  ConnectorResponse
} from 'services/cd-ng'
import { ArtifactToConnectorMap, allowedArtifactTypes } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { StepViewType, ValidateInputSetProps, Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { K8SDirectServiceStep } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import { getConnectorName, getConnectorValue } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { K8sServiceSpecVariablesFormProps } from '../Common/GenericServiceSpec/GenericServiceSpecVariablesForm'
import ElastigroupServiceSpecEditable from './ElastigroupServiceSpecEditable'
import { ElastigroupServiceSpecInputSetMode } from './ElastigroupServiceSpecInputSetMode'
import type { ElastigroupServiceStep } from './ElastigroupServiceSpecInterface'
import { ElastigroupServiceSpecVariablesForm } from './ElastigroupServiceSpecVariablesForm'

const logger = loggerFor(ModuleName.CD)

const ArtifactsPrimaryRegex = /^.+artifacts\.primary\.sources\.spec\.connectorRef$/

const elastigroupAllowedArtifactTypes: Array<ArtifactType> = allowedArtifactTypes.Elastigroup

export class ElastigroupServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.ElastigroupService
  protected defaultValues: ServiceSpec = {}

  protected stepIcon: IconName = 'elastigroup'
  protected stepName = 'Specify Spot Elastigroup'
  protected stepPaletteVisible = false
  protected _hasStepVariables = true
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.invocationMap.set(ArtifactsPrimaryRegex, this.getArtifactsPrimaryConnectorsListForYaml.bind(this))
  }

  protected returnConnectorListFromResponse(response: ResponsePageConnectorResponse): CompletionItemInterface[] {
    return (
      response?.data?.content?.map((connector: ConnectorResponse) => ({
        label: getConnectorName(connector),
        insertText: getConnectorValue(connector),
        kind: CompletionItemKind.Field
      })) || []
    )
  }

  protected getArtifactsPrimaryConnectorsListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (elastigroupAllowedArtifactTypes.includes(obj?.type)) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: {
            types: [ArtifactToConnectorMap.AmazonS3],
            filterType: 'Connector'
          }
        }).then(this.returnConnectorListFromResponse)
      }
    }

    return Promise.resolve([])
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ElastigroupServiceStep>): FormikErrors<ElastigroupServiceStep> {
    const errors: FormikErrors<ElastigroupServiceStep> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    // These are temporary artifact validations. Will refactor once Amazon AMI is available
    const artifactType = !isEmpty(data?.artifacts?.primary?.sources?.[0]?.spec)
      ? 'artifacts.primary.sources[0].type'
      : 'artifacts.primary.type'
    const artifactPath = !isEmpty(data?.artifacts?.primary?.sources?.[0]?.spec)
      ? 'artifacts.primary.sources[0].spec'
      : 'artifacts.primary.spec'

    if (
      isEmpty(data?.artifacts?.primary?.primaryArtifactRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.artifacts?.primary?.primaryArtifactRef) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'artifacts.primary.primaryArtifactRef',
        getString?.('fieldRequired', { field: 'Primary Artifact Ref' })
      )
    }
    if (
      isEmpty(get(data, `${artifactPath}.connectorRef`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.connectorRef`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.connectorRef`, getString?.('fieldRequired', { field: 'ConnectorRef' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.tag`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.tag`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.tag`, getString?.('fieldRequired', { field: 'Tag' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.imagePath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.imagePath`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.imagePath`, getString?.('fieldRequired', { field: 'Image Path' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.artifactPath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.artifactPath`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.artifactPath`, getString?.('fieldRequired', { field: 'Artifact Path' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.spec.artifactPath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.spec.artifactPath`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.spec.artifactPath`, getString?.('fieldRequired', { field: 'Artifact Path' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.build`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.build`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.build`, getString?.('fieldRequired', { field: 'Build' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.jobName`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.jobName`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.jobName`, getString?.('fieldRequired', { field: 'Job Name' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.subscriptionId`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.subscriptionId`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.subscriptionId`, getString?.('fieldRequired', { field: 'Subscription Id' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.repository`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.repository`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.repository`, getString?.('fieldRequired', { field: 'Repository' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.registry`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.registry`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.registry`, getString?.('fieldRequired', { field: 'Registry' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.artifactDirectory`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.artifactDirectory`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.artifactDirectory`, getString?.('fieldRequired', { field: 'Artifact Directory' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.registryHostname`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.registryHostname`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.registryHostname`, getString?.('fieldRequired', { field: 'Registry Hostname' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.repositoryUrl`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.repositoryUrl`)) === MultiTypeInputType.RUNTIME &&
      get(data, artifactType) !== 'ArtifactoryRegistry'
    ) {
      set(errors, `${artifactPath}.repositoryUrl`, getString?.('fieldRequired', { field: 'Repository Url' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.spec.repositoryUrl`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.spec.repositoryUrl`)) === MultiTypeInputType.RUNTIME &&
      get(data, artifactType) !== 'ArtifactoryRegistry'
    ) {
      set(errors, `${artifactPath}.spec.repositoryUrl`, getString?.('fieldRequired', { field: 'Repository Url' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.repositoryPort`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.repositoryPort`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.repositoryPort`, getString?.('fieldRequired', { field: 'repository Port' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.bucketName`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.bucketName`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.bucketName`, getString?.('fieldRequired', { field: 'Bucket Name' }))
    }
    if (
      isEmpty(get(data, `${artifactPath}.filePath`)) &&
      isRequired &&
      getMultiTypeFromValue(get(template, `${artifactPath}.filePath`)) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, `${artifactPath}.filePath`, getString?.('fieldRequired', { field: 'File Path' }))
    }

    // Startup script
    if (
      isEmpty(data?.startupScript?.store?.spec?.files) &&
      isRequired &&
      getMultiTypeFromValue(template?.startupScript?.store?.spec?.files) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'startupScript.store.spec.files[0]', getString?.('fieldRequired', { field: 'File' }))
    }
    if (
      isEmpty(data?.startupScript?.store?.spec?.secretFiles) &&
      isRequired &&
      getMultiTypeFromValue(template?.startupScript?.store?.spec?.secretFiles) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'startupScript.store.spec.secretFiles[0]', getString?.('fieldRequired', { field: 'File' }))
    }

    // Config Files

    data?.configFiles?.forEach((configFile, index) => {
      const currentFileTemplate = get(template, `configFiles[${index}].configFile.spec.store.spec`, '')
      if (
        isEmpty(configFile?.configFile?.spec?.store?.spec?.files) &&
        isRequired &&
        getMultiTypeFromValue(currentFileTemplate?.files) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `configFiles[${index}].configFile.spec.store.spec.files[0]`,
          getString?.('fieldRequired', { field: 'File' })
        )
      }
      if (!isEmpty(configFile?.configFile?.spec?.store?.spec?.files)) {
        configFile?.configFile?.spec?.store?.spec?.files?.forEach((value: string, fileIndex: number) => {
          if (!value) {
            set(
              errors,
              `configFiles[${index}].configFile.spec.store.spec.files[${fileIndex}]`,
              getString?.('fieldRequired', { field: 'File' })
            )
          }
        })
      }
      if (
        isEmpty(configFile?.configFile?.spec?.store?.spec?.secretFiles) &&
        isRequired &&
        getMultiTypeFromValue(currentFileTemplate?.secretFiles) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `configFiles[${index}].configFile.spec.store.spec.secretFiles[0]`,
          getString?.('fieldRequired', { field: 'File' })
        )
      }
      if (!isEmpty(configFile?.configFile?.spec?.store?.spec?.secretFiles)) {
        configFile?.configFile?.spec?.store?.spec?.secretFiles?.forEach((value: string, secretFileIndex: number) => {
          if (!value) {
            set(
              errors,
              `configFiles[${index}].configFile.spec.store.spec.secretFiles[${secretFileIndex}]`,
              getString?.('fieldRequired', { field: 'File' })
            )
          }
        })
      }
    })

    return errors
  }

  renderStep(props: StepProps<K8SDirectServiceStep>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, factory, customStepProps, readonly, allowableTypes } =
      props

    if (stepViewType === StepViewType.InputVariable) {
      return (
        <ElastigroupServiceSpecVariablesForm
          {...(customStepProps as K8sServiceSpecVariablesFormProps)}
          initialValues={initialValues}
          stepsFactory={factory}
          onUpdate={onUpdate}
          readonly={readonly}
        />
      )
    }

    if (isTemplatizedView(stepViewType)) {
      return (
        <ElastigroupServiceSpecInputSetMode
          {...(customStepProps as K8sServiceSpecVariablesFormProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          path={inputSetData?.path}
          readonly={inputSetData?.readonly || readonly}
          factory={factory}
          allowableTypes={allowableTypes}
        />
      )
    }

    return (
      <ElastigroupServiceSpecEditable
        {...(customStepProps as K8sServiceSpecVariablesFormProps)}
        factory={factory}
        initialValues={initialValues}
        onUpdate={onUpdate}
        readonly={inputSetData?.readonly || readonly}
      />
    )
  }
}
