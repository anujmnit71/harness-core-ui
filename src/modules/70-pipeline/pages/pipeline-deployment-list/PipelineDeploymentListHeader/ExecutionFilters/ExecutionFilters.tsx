/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { isEmpty, pick } from 'lodash-es'

import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { FilterDTO, PipelineExecutionFilterProperties } from 'services/pipeline-ng'
import { usePostFilter, useUpdateFilter, useDeleteFilter } from 'services/pipeline-ng'
import { useGetEnvironmentListForProject, useGetServiceListForProject } from 'services/cd-ng'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import type { FilterInterface, FilterDataInterface } from '@common/components/Filter/Constants'
import { useBooleanStatus, useUpdateQueryParams } from '@common/hooks'
import type { PipelineType, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import {
  PipelineExecutionFormType,
  getMultiSelectFormOptions,
  BUILD_TYPE,
  getFilterByIdentifier,
  getBuildType,
  getValidFilterArguments,
  createRequestBodyPayload
} from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'

import { StringUtils } from '@common/exports'
import {
  isObjectEmpty,
  UNSAVED_FILTER,
  removeNullAndEmpty,
  flattenObject
} from '@common/components/Filter/utils/FilterUtils'
import { useFiltersContext } from '../../FiltersContext/FiltersContext'
import PipelineFilterForm from '../../PipelineFilterForm/PipelineFilterForm'
import type { StringQueryParams } from '../../types'

export interface ExecutionFilterQueryParams {
  filter?: string
}

const UNSAVED_FILTER_IDENTIFIER = StringUtils.getIdentifierFromName(UNSAVED_FILTER)

export function ExecutionFilters(): React.ReactElement {
  const [loading, setLoading] = React.useState(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelineType<PipelinePathProps>>()
  const { state: isFiltersDrawerOpen, open: openFilterDrawer, close: hideFilterDrawer } = useBooleanStatus()
  const { getString } = useStrings()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<StringQueryParams>()
  const { selectedProject } = useAppStore()
  const isCDEnabled = (selectedProject?.modules && selectedProject.modules?.indexOf('CD') > -1) || false
  const isCIEnabled = (selectedProject?.modules && selectedProject.modules?.indexOf('CI') > -1) || false
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)
  const { savedFilters: filters, isFetchingFilters, refetchFilters, queryParams } = useFiltersContext()

  const { data: servicesResponse, loading: isFetchingServices } = useGetServiceListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: isFiltersDrawerOpen
  })

  const { data: environmentsResponse, loading: isFetchingEnvironments } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: isFiltersDrawerOpen
  })

  const { mutate: createFilter } = usePostFilter({
    queryParams: { accountIdentifier: accountId }
  })

  const { mutate: updateFilter } = useUpdateFilter({
    queryParams: { accountIdentifier: accountId }
  })

  const { mutate: deleteFilter } = useDeleteFilter({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      type: 'PipelineExecution'
    }
  })

  const isFetchingMetaData = isFetchingEnvironments || isFetchingServices

  const appliedFilter =
    queryParams.filterIdentifier && queryParams.filterIdentifier !== UNSAVED_FILTER_IDENTIFIER
      ? getFilterByIdentifier(queryParams.filterIdentifier, filters)
      : queryParams.filters && !isEmpty(queryParams.filters)
      ? {
          name: UNSAVED_FILTER,
          identifier: UNSAVED_FILTER_IDENTIFIER,
          filterProperties: queryParams.filters,
          filterVisibility: undefined
        }
      : null
  const { pipelineName, status, moduleProperties } =
    (appliedFilter?.filterProperties as PipelineExecutionFilterProperties) || {}
  const { name = '', filterVisibility, identifier = '' } = appliedFilter || {}
  const { ci, cd } = moduleProperties || {}
  const { serviceDefinitionTypes, infrastructureType, serviceIdentifiers, envIdentifiers } = cd || {}
  const { branch, tag, ciExecutionInfoDTO, repoNames } = ci || {}
  const { sourceBranch, targetBranch } = ciExecutionInfoDTO?.pullRequest || {}
  const buildType = getBuildType(moduleProperties || {})
  const fieldToLabelMapping = React.useMemo(
    () =>
      new Map<string, string>([
        ['pipelineName', getString('filters.executions.pipelineName')],
        ['status', getString('status')],
        ['sourceBranch', getString('pipeline-triggers.conditionsPanel.sourceBranch')],
        ['targetBranch', getString('pipeline-triggers.conditionsPanel.targetBranch')],
        ['branch', getString('pipelineSteps.deploy.inputSet.branch')],
        ['tag', getString('tagLabel')],
        ['buildType', getString('filters.executions.buildType')],
        ['repoNames', getString('pipelineSteps.build.create.repositoryNameLabel')],
        ['serviceDefinitionTypes', getString('deploymentTypeText')],
        ['infrastructureType', getString('infrastructureTypeText')],
        ['serviceIdentifiers', getString('services')],
        ['envIdentifiers', getString('environments')]
      ]),
    [getString]
  )

  const filterWithValidFields = removeNullAndEmpty(
    pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
  )

  const filterWithValidFieldsWithMetaInfo =
    filterWithValidFields.sourceBranch && filterWithValidFields.targetBranch
      ? Object.assign(filterWithValidFields, { buildType: getString('filters.executions.pullOrMergeRequest') })
      : filterWithValidFields.branch
      ? Object.assign(filterWithValidFields, { buildType: getString('pipelineSteps.deploy.inputSet.branch') })
      : filterWithValidFields.tag
      ? Object.assign(filterWithValidFields, { buildType: getString('tagLabel') })
      : filterWithValidFields

  function handleFilterSelection(
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ): void {
    event?.stopPropagation()
    event?.preventDefault()

    if (option.value) {
      updateQueryParams({
        filterIdentifier: option.value.toString(),
        filters: [] as any /* this will remove the param */
      })
    } else {
      updateQueryParams({
        filterIdentifier: [] as any /* this will remove the param */,
        filters: [] as any /* this will remove the param */
      })
    }
  }

  function onApply(inputFormData: FormikProps<PipelineExecutionFormType>['values']): void {
    if (!isObjectEmpty(inputFormData)) {
      const filterFromFormData = getValidFilterArguments({ ...inputFormData })
      updateQueryParams({ filters: JSON.stringify({ ...(filterFromFormData || {}) }) })
      hideFilterDrawer()
    } else {
      // showError(getString('filters.invalidCriteria'))
    }
  }

  async function handleSaveOrUpdate(
    isUpdate: boolean,
    data: FilterDataInterface<PipelineExecutionFormType, FilterInterface>
  ): Promise<void> {
    setLoading(true)
    const requestBodyPayload = createRequestBodyPayload({
      isUpdate,
      data,
      projectIdentifier,
      orgIdentifier
    })

    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (saveOrUpdateHandler && typeof saveOrUpdateHandler === 'function') {
      const updatedFilter = await saveOrUpdateHandler(isUpdate, requestBodyPayload)
      updateQueryParams({ filters: JSON.stringify({ ...(updatedFilter || {}) }) })
    }

    setLoading(false)
    refetchFilters()
  }

  // eslint-disable-next-line no-shadow
  async function handleDelete(identifier: string): Promise<void> {
    setLoading(true)
    const deleteHandler = filterRef.current?.deleteFilterHandler
    if (deleteHandler && typeof deleteFilter === 'function') {
      await deleteHandler(identifier)
    }
    setLoading(false)

    if (identifier === appliedFilter?.identifier) {
      reset()
    }
    refetchFilters()
  }

  function handleFilterClick(filterIdentifier: string): void {
    if (filterIdentifier !== UNSAVED_FILTER_IDENTIFIER) {
      updateQueryParams({
        filterIdentifier,
        filters: [] as any /* this will remove the param */
      })
    }
  }

  function reset(): void {
    replaceQueryParams({})
    hideFilterDrawer()
  }

  return (
    <React.Fragment>
      <FilterSelector<FilterDTO>
        appliedFilter={appliedFilter}
        filters={filters}
        onFilterBtnClick={openFilterDrawer}
        onFilterSelect={handleFilterSelection}
        fieldToLabelMapping={fieldToLabelMapping}
        filterWithValidFields={filterWithValidFieldsWithMetaInfo}
      />
      <Filter<PipelineExecutionFormType, FilterDTO>
        isOpen={isFiltersDrawerOpen}
        formFields={
          <PipelineFilterForm<PipelineExecutionFormType>
            isCDEnabled={isCDEnabled}
            isCIEnabled={isCIEnabled}
            initialValues={{
              environments: getMultiSelectFormOptions(environmentsResponse?.data?.content),
              services: getMultiSelectFormOptions(servicesResponse?.data?.content)
            }}
            type="PipelineExecution"
          />
        }
        initialFilter={{
          formValues: {
            pipelineName,
            repositoryName: repoNames?.[0] || undefined,
            status: getMultiSelectFormOptions(status),
            branch,
            tag,
            sourceBranch,
            targetBranch,
            buildType,
            deploymentType: serviceDefinitionTypes ? serviceDefinitionTypes[0] : undefined,
            infrastructureType,
            services: getMultiSelectFormOptions(serviceIdentifiers),
            environments: getMultiSelectFormOptions(envIdentifiers)
          },
          metadata: { name, filterVisibility, identifier, filterProperties: {} }
        }}
        filters={filters}
        isRefreshingFilters={isFetchingFilters || isFetchingMetaData || loading}
        onApply={onApply}
        onClose={() => hideFilterDrawer()}
        onSaveOrUpdate={handleSaveOrUpdate}
        onDelete={handleDelete}
        onFilterSelect={handleFilterClick}
        onClear={reset}
        ref={filterRef}
        dataSvcConfig={
          new Map<CrudOperation, (...rest: any[]) => Promise<any>>([
            ['ADD', createFilter],
            ['UPDATE', updateFilter],
            ['DELETE', deleteFilter]
          ])
        }
        onSuccessfulCrudOperation={() => refetchFilters()}
        validationSchema={Yup.object().shape({
          sourceBranch: Yup.string().when('buildType', {
            is: BUILD_TYPE.PULL_OR_MERGE_REQUEST,
            then: Yup.string().required()
          }),
          targetBranch: Yup.string().when('buildType', {
            is: BUILD_TYPE.PULL_OR_MERGE_REQUEST,
            then: Yup.string().required()
          }),
          branch: Yup.string().when('buildType', {
            is: BUILD_TYPE.BRANCH,
            then: Yup.string().required()
          }),
          tag: Yup.string().when('buildType', {
            is: BUILD_TYPE.TAG,
            then: Yup.string().required()
          })
        })}
      />
    </React.Fragment>
  )
}
