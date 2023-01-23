/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import {
  Formik,
  FormInput,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  SelectOption
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { defaultTo, memoize } from 'lodash-es'
import type { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import type { NexusRegistrySpec } from 'services/pipeline-ng'
import { getConnectorIdValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { ConnectorConfigDTO, useGetRepositories } from 'services/cd-ng'
import {
  k8sRepositoryFormatTypes,
  nexus2RepositoryFormatTypes,
  RepositoryFormatTypes
} from '@pipeline/utils/stageHelpers'
import type { specInterface } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/NexusArtifact/NexusArtifact'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { ImagePathProps, RepositoryPortOrServer } from '../../../ArtifactInterface'
import { repositoryPortOrServer } from '../../../ArtifactHelper'
import css from '../../ArtifactConnector.module.scss'

export interface queryInterface extends specInterface {
  repository: string
  repositoryFormat: string
  connectorRef?: string
}

export function NexusArtifact({
  handleSubmit,
  prevStepData,
  initialValues,
  previousStep
}: StepProps<ConnectorConfigDTO> & ImagePathProps<NexusRegistrySpec>): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const validationSchema = Yup.object().shape({
    repositoryFormat: Yup.string().required(getString('pipeline.artifactsSelection.validation.repositoryFormat')),
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    artifactPath: Yup.string().when('repositoryFormat', {
      is: RepositoryFormatTypes.Docker,
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactPath'))
    }),
    repositoryUrl: Yup.string().when('repositoryPortorRepositoryURL', {
      is: RepositoryPortOrServer.RepositoryUrl,
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.repositoryUrl'))
    }),
    repositoryPort: Yup.string().when('repositoryPortorRepositoryURL', {
      is: RepositoryPortOrServer.RepositoryPort,
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.repositoryPort'))
    }),
    artifactId: Yup.string().when('repositoryFormat', {
      is: RepositoryFormatTypes.Maven,
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactId'))
    }),
    groupId: Yup.string().when('repositoryFormat', {
      is: RepositoryFormatTypes.Maven,
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.groupId'))
    }),
    group: Yup.string().when('repositoryFormat', {
      is: RepositoryFormatTypes.Raw,
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.group'))
    }),
    packageName: Yup.string().when('repositoryFormat', {
      is: val => val === RepositoryFormatTypes.NPM || val === RepositoryFormatTypes.NuGet,
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.packageName'))
    })
  })

  const connectorRefValue = getConnectorIdValue(prevStepData)

  const {
    data: repositoryDetails,
    refetch: refetchRepositoryDetails,
    loading: fetchingRepository,
    error: errorFetchingRepository
  } = useMutateAsGet(useGetRepositories, {
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      repositoryFormat: ''
    }
  })

  const selectRepositoryItems = useMemo(() => {
    return repositoryDetails?.data?.map(repository => ({
      value: defaultTo(repository.repositoryName, ''),
      label: defaultTo(repository.repositoryName, '')
    }))
  }, [repositoryDetails?.data])

  const getRepository = (): { label: string; value: string }[] => {
    if (fetchingRepository) {
      return [{ label: getString('loading'), value: getString('loading') }]
    }
    return defaultTo(selectRepositoryItems, [])
  }

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingRepository} />
  ))

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="nexusArtifact"
        validationSchema={validationSchema}
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            ...(formData.repositoryFormat === RepositoryPortOrServer.RepositoryUrl && {
              repositoryUrl: formData.repositoryUrl
            }),
            ...(formData.repositoryFormat === RepositoryPortOrServer.RepositoryPort && {
              repositoryPort: formData.repositoryPort
            }),
            connectorRef: getConnectorIdValue(prevStepData)
          })
        }}
      >
        {({ values }) => (
          <Form>
            <div className={css.artifactForm}>
              <div className={css.imagePathContainer}>
                <FormInput.Select
                  name="repositoryFormat"
                  label={getString('common.repositoryFormat')}
                  items={[...k8sRepositoryFormatTypes, ...nexus2RepositoryFormatTypes]}
                />
              </div>

              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  selectItems={getRepository()}
                  label={getString('repository')}
                  name="repository"
                  placeholder={getString('pipeline.artifactsSelection.repositoryPlaceholder')}
                  useValue
                  multiTypeInputProps={{
                    allowableTypes: [MultiTypeInputType.FIXED],
                    selectProps: {
                      noResults: (
                        <NoTagResults
                          tagError={errorFetchingRepository}
                          isServerlessDeploymentTypeSelected={false}
                          defaultErrorText={getString('pipeline.artifactsSelection.errors.noRepositories')}
                        />
                      ),
                      itemRenderer: itemRenderer,
                      items: getRepository(),
                      allowCreatingNewItems: true
                    },
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                      if (
                        e?.target?.type !== 'text' ||
                        (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                      ) {
                        return
                      }
                      refetchRepositoryDetails({
                        queryParams: {
                          ...commonParams,
                          connectorRef: connectorRefValue,
                          repositoryFormat: values?.repositoryFormat
                        }
                      })
                    }
                  }}
                />
              </div>

              {values?.repositoryFormat === RepositoryFormatTypes.Maven ? (
                <>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.groupId')}
                      name="groupId"
                      placeholder={getString('pipeline.artifactsSelection.groupIdPlaceholder')}
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED]
                      }}
                    />
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.artifactId')}
                      name="artifactId"
                      placeholder={getString('pipeline.artifactsSelection.artifactIdPlaceholder')}
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED]
                      }}
                    />
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.extension')}
                      name="extension"
                      placeholder={getString('pipeline.artifactsSelection.extensionPlaceholder')}
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED]
                      }}
                    />
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.classifier')}
                      name="classifier"
                      placeholder={getString('pipeline.artifactsSelection.classifierPlaceholder')}
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED]
                      }}
                    />
                  </div>
                </>
              ) : values?.repositoryFormat === RepositoryFormatTypes.Docker ? (
                <>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactPathLabel')}
                      name="artifactPath"
                      placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED]
                      }}
                    />
                  </div>
                  <div className={css.tagGroup}>
                    <FormInput.RadioGroup
                      name="repositoryPortorRepositoryURL"
                      radioGroup={{ inline: true }}
                      items={repositoryPortOrServer}
                      className={css.radioGroup}
                    />
                  </div>

                  {values?.repositoryPortorRepositoryURL === RepositoryPortOrServer.RepositoryUrl && (
                    <div className={css.imagePathContainer}>
                      <FormInput.MultiTextInput
                        label={getString('repositoryUrlLabel')}
                        name="repositoryUrl"
                        placeholder={getString('pipeline.repositoryUrlPlaceholder')}
                        multiTextInputProps={{
                          allowableTypes: [MultiTypeInputType.FIXED]
                        }}
                      />
                    </div>
                  )}

                  {values?.repositoryPortorRepositoryURL === RepositoryPortOrServer.RepositoryPort && (
                    <div className={css.imagePathContainer}>
                      <FormInput.MultiTextInput
                        label={getString('pipeline.artifactsSelection.repositoryPort')}
                        name="repositoryPort"
                        placeholder={getString('pipeline.artifactsSelection.repositoryPortPlaceholder')}
                        multiTextInputProps={{
                          allowableTypes: [MultiTypeInputType.FIXED]
                        }}
                      />
                    </div>
                  )}
                </>
              ) : values?.repositoryFormat === RepositoryFormatTypes.Raw ? (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    label={getString('rbac.group')}
                    name="group"
                    placeholder={getString('pipeline.artifactsSelection.groupPlaceholder')}
                    multiTextInputProps={{
                      allowableTypes: [MultiTypeInputType.FIXED]
                    }}
                  />
                </div>
              ) : (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    label={getString('pipeline.artifactsSelection.packageName')}
                    name="packageName"
                    placeholder={getString('pipeline.manifestType.packagePlaceholder')}
                    multiTextInputProps={{
                      allowableTypes: [MultiTypeInputType.FIXED]
                    }}
                  />
                </div>
              )}
            </div>
            <Layout.Horizontal spacing="medium">
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('back')}
                icon="chevron-left"
                onClick={() => previousStep?.(prevStepData)}
              />
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('submit')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default NexusArtifact
