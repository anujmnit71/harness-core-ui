/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep, defaultTo, isEmpty, isNull, isUndefined, omit, omitBy } from 'lodash-es'
import {
  Layout,
  NestedAccordionProvider,
  FontVariation,
  Text,
  Color,
  PageHeader,
  PageBody,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  getErrorInfoFromErrorObject
} from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { parse } from 'yaml'
import type { FormikProps } from 'formik'
import type { PipelineInfoConfig } from 'services/cd-ng'
import {
  useGetTemplateFromPipeline,
  useGetPipeline,
  useCreateInputSetForPipeline,
  useGetInputSetForPipeline,
  useUpdateInputSetForPipeline,
  ResponseInputSetResponse,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  ResponsePMSPipelineResponseDTO,
  EntityGitDetails,
  ResponseInputSetTemplateWithReplacedExpressionsResponse
} from 'services/pipeline-ng'

import { useToaster } from '@common/exports'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { InputSetGitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { getFormattedErrors } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import type { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { changeEmptyValuesToRunTimeInput } from '@pipeline/utils/stageHelpers'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useGetYamlWithTemplateRefsResolved } from 'services/template-ng'
import type { CreateUpdateInputSetsReturnType, InputSetDTO, InputSetType } from '@pipeline/utils/types'
import { clearRuntimeInput } from '../PipelineStudio/StepUtil'
import GitPopover from '../GitPopover/GitPopover'
import FormikInputSetForm from './FormikInputSetForm'
import css from './InputSetForm.module.scss'

interface SaveInputSetDTO {
  inputSet: InputSetDTO
}

const getDefaultInputSet = (
  template: PipelineInfoConfig,
  orgIdentifier: string,
  projectIdentifier: string
): InputSetDTO => ({
  name: '',
  identifier: '',
  description: undefined,
  orgIdentifier,
  projectIdentifier,
  pipeline: template,
  repo: '',
  branch: ''
})

const clearNullUndefined = /* istanbul ignore next */ (data: InputSetDTO): InputSetDTO => {
  const omittedInputset = omitBy(omitBy(data, isUndefined), isNull)
  return changeEmptyValuesToRunTimeInput(cloneDeep(omittedInputset), '')
}
export interface InputSetFormProps {
  executionView?: boolean
}

interface GetUpdatedGitDetailsReturnType extends EntityGitDetails {
  lastObjectId?: string
  baseBranch?: string
}

const getUpdatedGitDetails = (
  isEdit: boolean,
  gitDetails: SaveToGitFormInterface | undefined,
  lastObjectId: string,
  initialGitDetails: EntityGitDetails
): GetUpdatedGitDetailsReturnType => {
  let updatedGitDetails: GetUpdatedGitDetailsReturnType = {}
  if (gitDetails) {
    updatedGitDetails = { ...gitDetails }
    if (isEdit) {
      updatedGitDetails['lastObjectId'] = lastObjectId
    }
    if (gitDetails.isNewBranch) {
      updatedGitDetails['baseBranch'] = initialGitDetails.branch
    }
  }
  return updatedGitDetails
}

const getInputSet = (
  orgIdentifier: string,
  projectIdentifier: string,
  inputSetResponse: ResponseInputSetResponse | null,
  template: ResponseInputSetTemplateWithReplacedExpressionsResponse | null,
  mergeTemplate?: string,
  isGitSyncEnabled?: boolean
): InputSetDTO | InputSetType => {
  if (inputSetResponse?.data) {
    const inputSetObj = inputSetResponse?.data

    const parsedInputSetObj = parse(defaultTo(inputSetObj?.inputSetYaml, ''))
    /*
      Context of the below if block
      We need to populate existing values of input set in the form.
      The values are to be filled come from 'merge' API i.e. mergeTemplate object
      But if the merge API fails (due to invalid input set or any other reason) - we populate the value from the input set response recevied (parsedInputSetObj).
    */
    const parsedPipelineWithValues = mergeTemplate
      ? defaultTo(parse(defaultTo(mergeTemplate, ''))?.pipeline, {})
      : parsedInputSetObj?.inputSet?.pipeline

    if (isGitSyncEnabled && parsedInputSetObj && parsedInputSetObj.inputSet) {
      return {
        name: parsedInputSetObj.inputSet.name,
        tags: parsedInputSetObj.inputSet.tags,
        identifier: parsedInputSetObj.inputSet.identifier,
        description: parsedInputSetObj.inputSet.description,
        orgIdentifier: parsedInputSetObj.inputSet.orgIdentifier,
        projectIdentifier: parsedInputSetObj.inputSet.projectIdentifier,
        pipeline: clearRuntimeInput(parsedPipelineWithValues),
        gitDetails: defaultTo(inputSetObj.gitDetails, {}),
        entityValidityDetails: defaultTo(inputSetObj.entityValidityDetails, {})
      }
    }
    return {
      name: inputSetObj.name,
      tags: inputSetObj.tags,
      identifier: defaultTo(inputSetObj.identifier, ''),
      description: inputSetObj?.description,
      orgIdentifier,
      projectIdentifier,
      pipeline: clearRuntimeInput(parsedPipelineWithValues),
      gitDetails: defaultTo(inputSetObj.gitDetails, {}),
      entityValidityDetails: defaultTo(inputSetObj.entityValidityDetails, {})
    }
  }
  return getDefaultInputSet(
    clearRuntimeInput(parse(defaultTo(template?.data?.inputSetTemplateYaml, ''))?.pipeline),
    orgIdentifier,
    projectIdentifier
  )
}
export function InputSetForm(props: InputSetFormProps): React.ReactElement {
  const { executionView } = props
  const { getString } = useStrings()
  const [isEdit, setIsEdit] = React.useState(false)
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, inputSetIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch, inputSetRepoIdentifier, inputSetBranch } = useQueryParams<InputSetGitQueryParams>()
  const [savedInputSetObj, setSavedInputSetObj] = React.useState<InputSetDTO>({})
  const [initialGitDetails, setInitialGitDetails] = React.useState<EntityGitDetails>({ repoIdentifier, branch })
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const history = useHistory()
  const {
    refetch: refetchTemplate,
    data: template,
    loading: loadingTemplate
  } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    body: {
      stageIdentifiers: []
    },
    lazy: true
  })

  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [formErrors, setFormErrors] = React.useState<Record<string, any>>({})
  const { showSuccess, showError } = useToaster()

  const {
    data: inputSetResponse,
    refetch,
    loading: loadingInputSet
  } = useGetInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier: inputSetRepoIdentifier,
      branch: inputSetBranch
    },
    inputSetIdentifier: defaultTo(inputSetIdentifier, ''),
    lazy: true
  })

  const [mergeTemplate, setMergeTemplate] = React.useState<string>()
  // const { openNestedPath } = useNestedAccordion()
  const { mutate: mergeInputSet, loading: loadingMerge } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch,
      repoIdentifier: inputSetRepoIdentifier,
      branch: inputSetBranch
    }
  })

  const { mutate: createInputSet, loading: createInputSetLoading } = useCreateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
  const { mutate: updateInputSet, loading: updateInputSetLoading } = useUpdateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const {
    data: pipeline,
    loading: loadingPipeline,
    refetch: refetchPipeline
  } = useGetPipeline({
    pipelineIdentifier,
    lazy: true,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })

  const { data: templateRefsResolvedPipeline, loading: loadingResolvedPipeline } = useMutateAsGet(
    useGetYamlWithTemplateRefsResolved,
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        pipelineIdentifier,
        projectIdentifier,
        repoIdentifier,
        branch,
        getDefaultFromOtherRepo: true
      },
      body: {
        originalEntityYaml: yamlStringify(parse(defaultTo(pipeline?.data?.yamlPipeline, ''))?.pipeline)
      }
    }
  )

  const inputSet: InputSetDTO | InputSetType = React.useMemo(() => {
    return getInputSet(orgIdentifier, projectIdentifier, inputSetResponse, template, mergeTemplate, isGitSyncEnabled)
  }, [mergeTemplate, inputSetResponse?.data, template?.data?.inputSetTemplateYaml, isGitSyncEnabled])

  const [disableVisualView, setDisableVisualView] = React.useState(inputSet.entityValidityDetails?.valid === false)

  const formikRef = React.useRef<FormikProps<InputSetDTO & GitContextProps>>()

  React.useEffect(() => {
    if (inputSet.entityValidityDetails?.valid === false || selectedView === SelectedView.YAML) {
      setSelectedView(SelectedView.YAML)
    } else {
      setSelectedView(SelectedView.VISUAL)
    }
  }, [inputSet, inputSet.entityValidityDetails?.valid])

  React.useEffect(() => {
    if (inputSet.entityValidityDetails?.valid === false) {
      setDisableVisualView(true)
    } else {
      setDisableVisualView(false)
    }
  }, [inputSet.entityValidityDetails?.valid])

  React.useEffect(() => {
    if (inputSetIdentifier !== '-1') {
      setIsEdit(true)
      refetch({ pathParams: { inputSetIdentifier: inputSetIdentifier } })
      refetchTemplate()
      refetchPipeline()
      mergeInputSet({ inputSetReferences: [inputSetIdentifier] })
        .then(response => {
          setMergeTemplate(response.data?.pipelineYaml)
        })
        .catch(e => {
          setMergeTemplate(undefined)
          showError(getErrorInfoFromErrorObject(e), undefined, 'pipeline.get.template')
        })
    } else {
      refetchTemplate()
      refetchPipeline()

      setIsEdit(false)
    }
  }, [inputSetIdentifier])

  useDocumentTitle([
    defaultTo(parse(defaultTo(pipeline?.data?.yamlPipeline, ''))?.pipeline?.name, getString('pipelines')),
    isEdit ? defaultTo(inputSetResponse?.data?.name, '') : getString('inputSets.newInputSetLabel')
  ])

  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '')
        const inputSetYamlVisual = parse(yaml).inputSet as InputSetDTO
        if (inputSetYamlVisual) {
          inputSet.name = inputSetYamlVisual.name
          inputSet.identifier = inputSetYamlVisual.identifier
          inputSet.description = inputSetYamlVisual.description
          inputSet.pipeline = inputSetYamlVisual.pipeline

          formikRef.current?.setValues({
            ...omit(inputSet, 'gitDetails', 'entityValidityDetails'),
            repo: defaultTo(repoIdentifier, ''),
            branch: defaultTo(branch, '')
          })
        }
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, inputSet]
  )

  const createUpdateInputSet = async (
    inputSetObj: InputSetDTO,
    gitDetails?: SaveToGitFormInterface,
    objectId = ''
  ): CreateUpdateInputSetsReturnType => {
    let response: ResponseInputSetResponse | null = null
    try {
      const updatedGitDetails = getUpdatedGitDetails(isEdit, gitDetails, objectId, initialGitDetails)
      if (isEdit) {
        if (inputSetObj.identifier) {
          response = await updateInputSet(yamlStringify({ inputSet: clearNullUndefined(inputSetObj) }) as any, {
            pathParams: {
              inputSetIdentifier: defaultTo(inputSetObj.identifier, '')
            },
            queryParams: {
              accountIdentifier: accountId,
              orgIdentifier,
              pipelineIdentifier,
              projectIdentifier,
              pipelineRepoID: repoIdentifier,
              pipelineBranch: branch,
              ...updatedGitDetails
            }
          })
        } else {
          throw new Error(getString('common.validation.identifierIsRequired'))
        }
      } else {
        response = await createInputSet(yamlStringify({ inputSet: clearNullUndefined(inputSetObj) }) as any, {
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            pipelineIdentifier,
            projectIdentifier,
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch,
            ...updatedGitDetails
          }
        })
      }
      if (!isGitSyncEnabled) {
        showSuccess(getString('inputSets.inputSetSaved'))
        history.goBack()
      }
    } catch (e) {
      const errors = getFormattedErrors(e?.data?.metadata?.uuidToErrorResponseMap)
      if (!isEmpty(errors)) {
        setFormErrors(errors)
      }
      // This is done because when git sync is enabled, errors are displayed in a modal
      if (!isGitSyncEnabled) {
        showError(getErrorInfoFromErrorObject(e), undefined, 'pipeline.update.create.inputset')
      } else {
        throw e
      }
    }
    return {
      status: response?.status, // nextCallback can be added if required
      nextCallback: () => history.goBack()
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<SaveInputSetDTO>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: SaveInputSetDTO,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> => createUpdateInputSet(payload?.inputSet || savedInputSetObj, gitData, objectId)
  })

  const handleSubmit = React.useCallback(
    async (inputSetObjWithGitInfo: InputSetDTO, gitDetails?: EntityGitDetails) => {
      const inputSetObj = omit(inputSetObjWithGitInfo, 'repo', 'branch')
      setSavedInputSetObj(inputSetObj)
      setInitialGitDetails(gitDetails as EntityGitDetails)
      if (inputSetObj) {
        if (isGitSyncEnabled) {
          openSaveToGitDialog({
            isEditing: isEdit,
            resource: {
              type: 'InputSets',
              name: inputSetObj.name as string,
              identifier: inputSetObj.identifier as string,
              gitDetails: isEdit ? inputSetResponse?.data?.gitDetails : gitDetails
            },
            payload: { inputSet: inputSetObj }
          })
        } else {
          createUpdateInputSet(inputSetObj)
        }
      }
    },
    [isEdit, updateInputSet, createInputSet, showSuccess, showError, isGitSyncEnabled, inputSetResponse, pipeline]
  )

  const child = React.useCallback(
    () => (
      <FormikInputSetForm
        inputSet={inputSet}
        template={template}
        pipeline={pipeline}
        templateRefsResolvedPipeline={templateRefsResolvedPipeline}
        handleSubmit={handleSubmit}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        yamlHandler={yamlHandler}
        setYamlHandler={setYamlHandler}
        formikRef={formikRef}
        selectedView={selectedView}
        executionView={executionView}
        isEdit={isEdit}
        isGitSyncEnabled={isGitSyncEnabled}
      />
    ),
    [
      inputSet,
      template,
      pipeline,
      templateRefsResolvedPipeline,
      handleSubmit,
      formErrors,
      setFormErrors,
      yamlHandler,
      setYamlHandler,
      formikRef,
      selectedView,
      executionView,
      isEdit,
      isGitSyncEnabled
    ]
  )

  return executionView ? (
    child()
  ) : (
    <InputSetFormWrapper
      loading={
        loadingInputSet ||
        loadingPipeline ||
        loadingResolvedPipeline ||
        loadingTemplate ||
        (!isGitSyncEnabled && (createInputSetLoading || updateInputSetLoading)) ||
        loadingMerge
      }
      isEdit={isEdit}
      selectedView={selectedView}
      handleModeSwitch={handleModeSwitch}
      inputSet={inputSet}
      pipeline={pipeline}
      isGitSyncEnabled={isGitSyncEnabled}
      disableVisualView={disableVisualView}
    >
      {child()}
    </InputSetFormWrapper>
  )
}

export interface InputSetFormWrapperProps {
  isEdit: boolean
  children: React.ReactNode
  selectedView: SelectedView
  loading: boolean
  handleModeSwitch(mode: SelectedView): void
  inputSet: InputSetDTO
  pipeline: ResponsePMSPipelineResponseDTO | null
  isGitSyncEnabled?: boolean
  disableVisualView: boolean
}

export function InputSetFormWrapper(props: InputSetFormWrapperProps): React.ReactElement {
  const {
    isEdit,
    children,
    selectedView,
    handleModeSwitch,
    loading,
    inputSet,
    pipeline,
    isGitSyncEnabled,
    disableVisualView
  } = props
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { getString } = useStrings()

  return (
    <React.Fragment>
      <GitSyncStoreProvider>
        <PageHeader
          className={css.pageHeaderStyles}
          title={
            <Layout.Horizontal width="42%">
              <Text lineClamp={1} color={Color.GREY_800} font={{ weight: 'bold', variation: FontVariation.H4 }}>
                {isEdit
                  ? getString('inputSets.editTitle', { name: inputSet.name })
                  : getString('inputSets.newInputSetLabel')}
              </Text>
              {isGitSyncEnabled && isEdit && (
                <GitPopover
                  data={defaultTo(inputSet.gitDetails, {})}
                  iconProps={{ margin: { left: 'small', top: 'xsmall' } }}
                />
              )}
              <div className={css.optionBtns}>
                <VisualYamlToggle
                  selectedView={selectedView}
                  onChange={nextMode => {
                    handleModeSwitch(nextMode)
                  }}
                  disableToggle={disableVisualView}
                />
              </div>
            </Layout.Horizontal>
          }
          breadcrumbs={
            <NGBreadcrumbs
              links={[
                {
                  url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
                  label: getString('pipelines')
                },
                {
                  url: routes.toInputSetList({
                    orgIdentifier,
                    projectIdentifier,
                    accountId,
                    pipelineIdentifier,
                    module,
                    branch: pipeline?.data?.gitDetails?.branch,
                    repoIdentifier: pipeline?.data?.gitDetails?.repoIdentifier
                  }),
                  label: defaultTo(parse(defaultTo(pipeline?.data?.yamlPipeline, ''))?.pipeline.name, '')
                }
              ]}
            />
          }
        />
      </GitSyncStoreProvider>
      <PageBody loading={loading}>{children}</PageBody>
    </React.Fragment>
  )
}

export function EnhancedInputSetForm(props: InputSetFormProps): React.ReactElement {
  return (
    <NestedAccordionProvider>
      <InputSetForm {...props} />
    </NestedAccordionProvider>
  )
}
