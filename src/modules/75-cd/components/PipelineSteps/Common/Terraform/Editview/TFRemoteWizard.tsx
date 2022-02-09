/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Button,
  ButtonVariation,
  Color,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Icon,
  Layout,
  MultiTypeInputType,
  SelectOption,
  StepProps,
  Text,
  useToaster
} from '@wings-software/uicore'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { unset, map } from 'lodash-es'
import cx from 'classnames'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'
import { FieldArray, FieldArrayRenderProps, Form } from 'formik'

import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useGetBuildsDetailsForArtifactory, useGetRepositoriesDetailsForArtifactory } from 'services/cd-ng'

import { Connector, PathInterface, RemoteVar, TerraformStoreTypes } from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

import css from './TerraformVarfile.module.scss'

interface TFRemoteProps {
  onSubmitCallBack: (data: RemoteVar) => void
  isEditMode: boolean
  isReadonly?: boolean
  allowableTypes: MultiTypeInputType[]
}
export const TFRemoteWizard: React.FC<StepProps<any> & TFRemoteProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isEditMode,
  isReadonly = false,
  allowableTypes
}) => {
  const [selectedRepo, setSelectedRepo] = useState('')
  const [connectorRepos, setConnectorRepos] = useState<SelectOption[]>()
  const [filePathIndex, setFilePathIndex] = useState<{ index: number; path: string }>()
  const [artifacts, setArtifacts] = useState<any>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { getString } = useStrings()
  const { showError } = useToaster()
  const initialValues = isEditMode
    ? {
        varFile: {
          identifier: prevStepData?.varFile?.identifier,
          type: TerraformStoreTypes.Remote,
          spec: {
            store: {
              spec: {
                gitFetchType: prevStepData?.varFile?.spec?.store?.spec?.gitFetchType,
                repoName: prevStepData?.varFile?.spec?.store?.spec?.repoName,
                branch: prevStepData?.varFile?.spec?.store?.spec?.branch,
                commitId: prevStepData?.varFile?.spec?.store?.spec?.commitId,
                paths:
                  getMultiTypeFromValue(prevStepData?.varFile?.spec?.store?.spec?.paths) === MultiTypeInputType.RUNTIME
                    ? prevStepData?.varFile?.spec?.store?.spec?.paths
                    : (prevStepData?.varFile?.spec?.store?.spec?.paths || []).map((item: string) => ({
                        path: item,
                        id: uuid()
                      }))
              }
            }
          }
        }
      }
    : {
        varFile: {
          type: TerraformStoreTypes.Remote,
          spec: {
            store: {
              spec: {
                gitFetchType: 'Branch',
                repoName: '',
                branch: '',
                commitId: '',
                paths: [{ id: uuid(), path: '' }]
              }
            }
          }
        }
      }
  const connectorValue = prevStepData?.varFile?.spec?.store?.spec?.connectorRef as Connector
  const connectionType =
    connectorValue?.connector?.spec?.connectionType === 'Account' ||
    connectorValue?.connector?.spec?.type === 'Account' ||
    prevStepData?.urlType === 'Account'
  const isArtifactory = prevStepData.selectedType === 'Artifactory'
  const {
    data: ArtifactRepoData,
    loading: ArtifactRepoLoading,
    refetch: getArtifactRepos,
    error: ArtifactRepoError
  } = useGetRepositoriesDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorValue.connector?.identifier,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })
  const {
    data: Artifacts,
    loading: ArtifactsLoading,
    refetch: GetArtifacts,
    error: ArtifactsError
  } = useGetBuildsDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorValue.connector?.identifier,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repositoryName: selectedRepo,
      maxVersions: 50,
      filePath: filePathIndex?.path
    },
    debounce: 500,
    lazy: true
  })

  if (ArtifactRepoError) {
    showError(ArtifactRepoError.message)
  }

  if (ArtifactsError) {
    showError(ArtifactsError.message)
  }

  useEffect(() => {
    if (selectedRepo && filePathIndex?.path) {
      GetArtifacts()
    }
  }, [filePathIndex, selectedRepo])

  useEffect(() => {
    if (Artifacts && !ArtifactsLoading) {
      setArtifacts({
        ...artifacts,
        [`${filePathIndex?.path}-${filePathIndex?.index}`]: map(Artifacts.data, artifact => ({
          label: artifact.artifactName as string,
          value: artifact.artifactPath as string
        }))
      })
    }
  }, [Artifacts])

  useEffect(() => {
    if (isArtifactory && !ArtifactRepoData) {
      getArtifactRepos()
    }

    if (ArtifactRepoData) {
      setConnectorRepos(map(ArtifactRepoData.data?.repositories, repo => ({ label: repo, value: repo })))
    }
  }, [ArtifactRepoData])

  const { expressions } = useVariablesExpression()

  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]
  /* istanbul ignore next */
  const onDragStart = React.useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])
  /* istanbul ignore next */
  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore next */
    event.currentTarget.classList.remove(css.dragging)
  }, [])
  /* istanbul ignore next */
  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore next */
    if (event.preventDefault) {
      event.preventDefault()
    }
    /* istanbul ignore next */
    event.currentTarget.classList.add(css.dragOver)
    /* istanbul ignore next */
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, arrayHelpers: FieldArrayRenderProps, droppedIndex: number) => {
      /* istanbul ignore next */
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      /* istanbul ignore next */
      if (data) {
        const index = parseInt(data, 10)
        /* istanbul ignore next */
        arrayHelpers.swap(index, droppedIndex)
      }
      /* istanbul ignore next */
      event.currentTarget.classList.remove(css.dragOver)
    },
    []
  )
  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.tfVarStore}>
      <Text font="large" color={Color.GREY_800}>
        {getString('cd.varFileDetails')}
      </Text>
      <Formik
        formName="tfRemoteWizardForm"
        initialValues={{ ...initialValues, isArtifactory: isArtifactory }}
        onSubmit={values => {
          /* istanbul ignore next */
          const payload = {
            ...values,
            connectorRef: prevStepData?.varFile?.spec?.store?.spec?.connectorRef
          }
          /* istanbul ignore next */
          const data = {
            varFile: {
              type: payload.varFile.type,
              identifier: payload.varFile.identifier,
              spec: {
                store: {
                  /* istanbul ignore next */
                  type: payload.connectorRef?.connector?.type || prevStepData?.selectedType,
                  spec: {
                    ...payload.varFile.spec?.store?.spec,
                    connectorRef: payload.connectorRef
                      ? getMultiTypeFromValue(payload?.connectorRef) === MultiTypeInputType.RUNTIME
                        ? payload?.connectorRef
                        : payload.connectorRef?.value
                      : prevStepData.identifier || ''
                  }
                }
              }
            }
          }
          /* istanbul ignore else */
          if (payload.varFile.spec?.store?.spec?.gitFetchType === gitFetchTypes[0].value) {
            unset(data?.varFile?.spec?.store?.spec, 'commitId')
          } else if (payload.varFile.spec?.store?.spec?.gitFetchType === gitFetchTypes[1].value) {
            unset(data?.varFile?.spec?.store?.spec, 'branch')
          }
          /* istanbul ignore else */
          if (
            getMultiTypeFromValue(payload.varFile.spec?.store?.spec?.paths) === MultiTypeInputType.FIXED &&
            payload.varFile.spec?.store?.spec?.paths?.length
          ) {
            data.varFile.spec.store.spec['paths'] = payload.varFile.spec?.store?.spec?.paths?.map(
              (item: PathInterface) => item.path
            )
          } else if (getMultiTypeFromValue(payload.varFile.spec?.store?.spec?.paths) === MultiTypeInputType.RUNTIME) {
            data.varFile.spec.store.spec['paths'] = payload.varFile.spec?.store?.spec?.paths
          }

          // if (
          //   getMultiTypeFromValue(payload.varFile.spec?.store?.spec?.paths) === MultiTypeInputType.FIXED &&
          //   payload.varFile.spec?.store?.spec?.paths?.length &&
          //   isArtifactory
          // ) {
          //   data.varFile.spec.store.spec['paths'] = payload.varFile.spec?.store?.spec?.paths?.map(
          //     (item: PathInterface) => ({ path: item.path, artifactName: item.fileName })
          //   )
          // }
          window.console.log('data', data)
          /* istanbul ignore else */
          onSubmitCallBack(data)
        }}
        validationSchema={Yup.object().shape({
          isArtifactory: Yup.boolean(),
          varFile: Yup.object().shape({
            identifier: Yup.string().required(getString('common.validation.identifierIsRequired')),
            spec: Yup.object().shape({
              store: Yup.object().shape({
                spec: Yup.object().shape({
                  gitFetchType: Yup.string().when('isArtifactory', {
                    is: false,
                    then: Yup.string().required(getString('cd.gitFetchTypeRequired'))
                  }),
                  branch: Yup.string().when('gitFetchType', {
                    is: !isArtifactory && 'Branch',
                    then: Yup.string().trim().required(getString('validation.branchName'))
                  }),
                  commitId: Yup.string().when('gitFetchType', {
                    is: 'Commit',
                    then: Yup.string().trim().required(getString('validation.commitId'))
                  }),
                  paths: Yup.lazy(value => {
                    if (typeof value === 'object') {
                      return Yup.array().of(
                        Yup.object().shape({ path: Yup.string().required(getString('cd.pathCannotBeEmpty')) })
                      )
                    } else return Yup.mixed()
                  })
                })
              })
            })
          })
        })}
      >
        {formik => {
          const store = formik.values?.varFile?.spec?.store?.spec
          return (
            <Form>
              <div className={css.tfRemoteForm}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Text name="varFile.identifier" label={getString('identifier')} />
                </div>
                {isArtifactory && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.Select
                      items={connectorRepos ? connectorRepos : []}
                      name="varFile.spec.store.spec.repositoryName"
                      label={getString('pipelineSteps.repoName')}
                      placeholder={ArtifactRepoLoading ? 'Loading...' : 'Select a Repository'}
                      disabled={ArtifactRepoLoading}
                      onChange={value => setSelectedRepo(value.value as string)}
                    />
                  </div>
                )}

                {connectionType && !isArtifactory && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.repoName')}
                      name="varFile.spec.store.spec.repoName"
                      placeholder={getString('pipelineSteps.repoName')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.repoName) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={store?.repoName as string}
                        type="String"
                        variableName="varFile.spec.store.spec.repoName"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value =>
                          /* istanbul ignore next */
                          formik.setFieldValue('varFile.spec.store.spec.repoName', value)
                        }
                      />
                    )}
                  </div>
                )}
                {!isArtifactory && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.Select
                      items={gitFetchTypes}
                      name="varFile.spec.store.spec.gitFetchType"
                      label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                      placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    />
                  </div>
                )}
                {!isArtifactory && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name="varFile.spec.store.spec.branch"
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.branch) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={store?.branch as string}
                        type="String"
                        variableName="varFile.spec.store.spec.branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('varFile.spec.store.spec.branch', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}

                {store?.gitFetchType === gitFetchTypes[1].value && !isArtifactory && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name="varFile.spec.store.spec.commitId"
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.commitId) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={store?.commitId as string}
                        type="String"
                        variableName="varFile.spec.store.spec.commitId"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('varFile.spec.store.spec.commitId', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}
                <div className={cx(stepCss.formGroup)}>
                  <MultiTypeFieldSelector
                    name="varFile.spec.store.spec.paths"
                    label={getString('filePaths')}
                    style={{ width: 370 }}
                    allowedTypes={allowableTypes.filter(item => item !== MultiTypeInputType.EXPRESSION)}
                  >
                    {isArtifactory && (
                      <Layout.Horizontal className={css.artifactHeader} flex={{ justifyContent: 'space-between' }}>
                        <Text font="normal" color={Color.GREY_600}>
                          File Path
                        </Text>
                        <Text font="normal" color={Color.GREY_600}>
                          Artifact Name
                        </Text>
                      </Layout.Horizontal>
                    )}
                    <FieldArray
                      name={isArtifactory ? 'varFile.spec.store.spec.artifacts' : 'varFile.spec.store.spec.paths'}
                      render={arrayHelpers => {
                        return (
                          <>
                            {(store?.paths || []).map((path: PathInterface, index: number) => {
                              const key = `${filePathIndex?.path}-${filePathIndex?.index}`
                              const rowArtifacts = artifacts && artifacts[key] ? artifacts[key] : []
                              return (
                                <Layout.Horizontal
                                  key={`${path}-${index}`}
                                  flex={{ distribution: 'space-between' }}
                                  style={{ alignItems: 'end' }}
                                >
                                  <Layout.Horizontal
                                    spacing="medium"
                                    style={{ alignItems: 'baseline' }}
                                    className={css.tfContainer}
                                    key={`${path}-${index}`}
                                    draggable={isArtifactory ? false : true}
                                    onDragEnd={onDragEnd}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    /* istanbul ignore next */
                                    onDragStart={event => {
                                      /* istanbul ignore next */
                                      onDragStart(event, index)
                                    }}
                                    /* istanbul ignore next */
                                    onDrop={event => onDrop(event, arrayHelpers, index)}
                                  >
                                    <Icon name="drag-handle-vertical" className={css.drag} />
                                    <Text width={12}>{`${index + 1}.`}</Text>
                                    <FormInput.MultiTextInput
                                      onChange={val => {
                                        setFilePathIndex({ index, path: val as string })
                                      }}
                                      name={
                                        isArtifactory
                                          ? `varFile.spec.store.spec.artifacts[${index}].artifactPathExpression`
                                          : `varFile.spec.store.spec.paths[${index}].path`
                                      }
                                      label=""
                                      multiTextInputProps={{
                                        expressions,
                                        allowableTypes: allowableTypes.filter(
                                          item => item !== MultiTypeInputType.RUNTIME
                                        )
                                      }}
                                      style={{ width: isArtifactory ? 240 : 300 }}
                                    />
                                    {isArtifactory && (
                                      <FormInput.Select
                                        name={`varFile.spec.store.spec.artifacts[${index}].artifactFile.name`}
                                        label=""
                                        items={rowArtifacts}
                                        style={{ width: isArtifactory ? 240 : 300 }}
                                        disabled={ArtifactsLoading}
                                        placeholder={ArtifactsLoading ? 'Loading...' : 'Select a Artifact'}
                                        onChange={val => {
                                          formik?.setFieldValue(
                                            `varFile.spec.store.spec.artifacts[${index}].artifactFile.path`,
                                            val.value
                                          )
                                        }}
                                      />
                                    )}
                                    <Button
                                      minimal
                                      icon="main-trash"
                                      data-testid={`remove-header-${index}`}
                                      onClick={() => arrayHelpers.remove(index)}
                                    />
                                  </Layout.Horizontal>
                                </Layout.Horizontal>
                              )
                            })}
                            <Button
                              icon="plus"
                              variation={ButtonVariation.LINK}
                              data-testid="add-header"
                              onClick={() => arrayHelpers.push({ path: '' })}
                            >
                              {getString('cd.addTFVarFileLabel')}
                            </Button>
                          </>
                        )
                      }}
                    />
                  </MultiTypeFieldSelector>
                  {getMultiTypeFromValue(formik.values?.varFile?.spec?.store?.spec?.paths) ===
                    MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ marginTop: 6 }}
                      value={formik.values?.varFile?.spec?.store?.spec?.paths}
                      type={getString('list')}
                      variableName={'varFile.spec.store.spec.paths'}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={val => formik?.setFieldValue('varFile.spec.store.spec.paths', val)}
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
