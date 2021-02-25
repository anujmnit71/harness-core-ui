import React, { useEffect, useState } from 'react'
import { Container, Formik, FormikForm, Text, Layout, Icon, Color, SelectOption } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import Table from '@common/components/Table/Table'

import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'

import { Environment, GetListEnvironmentsQueryParams, useGetListEnvironments } from 'services/portal'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/exports'
import { EnvironmentSelect } from '@cv/pages/monitoring-source/app-dynamics/SelectApplications/EnvironmentSelect'
import {
  useGetEnvironmentListForProject,
  EnvironmentResponseDTO,
  GetEnvironmentListForProjectQueryParams
} from 'services/cd-ng'
import { TableColumnWithFilter } from '@cv/components/TableColumnWithFilter/TableColumnWithFilter'
import css from './SelectEnvironment.module.scss'

const PAGE_LIMIT = 6
export interface SelectEnvironmentProps {
  initialValues?: any
  onSubmit?: (data: any) => void
  onPrevious: () => void
}

export interface Options {
  name: string
  value: string
}

interface TableData {
  name: string
  id: string
  appName: string
  appId: string
  selected: boolean
  environment?: SelectOption
}

const RenderColumnApplication: Renderer<CellProps<TableData>> = ({ row }) => {
  const data = row.original
  return <Text>{data.appName}</Text>
}

const SelectEnvironment: React.FC<SelectEnvironmentProps> = props => {
  const { getString } = useStrings()
  const [tableData, setTableData] = useState<Array<TableData>>()
  const [environmentOptions, setEnvironmentOptions] = useState<any>([])
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { data, loading, error, refetch: refetchEnvironments } = useGetListEnvironments({
    lazy: true
  })
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<string | undefined>()
  const [offset, setOffset] = useState(0)
  const { data: environmentsResponse } = useGetEnvironmentListForProject({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    } as GetEnvironmentListForProjectQueryParams
  })
  useEffect(() => {
    if (environmentsResponse?.data?.content?.length) {
      setEnvironmentOptions(
        environmentsResponse?.data?.content?.map(env => ({
          label: env.name,
          value: env.identifier
        }))
      )
    }
  }, [environmentsResponse])

  useEffect(() => {
    const appIds = Object.keys(props.initialValues.applications || {})
    refetchEnvironments({
      queryParams: {
        appId: appIds,
        offset: String(offset),
        limit: PAGE_LIMIT.toString(),
        'search[0]': filter ? [{ field: 'keywords' }, { op: 'CONTAINS' }, { value: filter }] : undefined
      } as GetListEnvironmentsQueryParams,
      queryParamStringifyOptions: { arrayFormat: 'repeat' }
    })
  }, [props.initialValues.selectedApplications, filter, offset])

  useEffect(() => {
    if ((data?.resource as any)?.response) {
      const env = props.initialValues.environments ?? {}
      const formatData = (data?.resource as any)?.response?.map((item: Environment) => {
        return {
          name: item.name,
          id: item.uuid,
          appName: props.initialValues.applications[String(item.appId)],
          appId: item.appId,
          selected: !!env[String(item.uuid)],
          environment: env[String(item.uuid)]?.environment ?? {}
        }
      })

      setTableData(formatData)
    }
  }, [(data?.resource as any)?.response])

  const onUpdateData = (index: number, value: object) => {
    setTableData(old =>
      old?.map((row, i) => {
        if (index === i) {
          return {
            ...row,
            ...value
          }
        } else {
          return row
        }
      })
    )
  }

  if (loading) {
    return (
      <Container className={css.loadingErrorNoData}>
        <PageSpinner />
      </Container>
    )
  }

  if (error?.message) {
    return (
      <Container className={css.loadingErrorNoData}>
        <PageError message={error.message} onClick={() => refetchEnvironments()} />
      </Container>
    )
  }

  if (!tableData?.length) {
    return (
      <Container className={css.loadingErrorNoData}>
        <NoDataCard
          icon="warning-sign"
          message={getString('cv.activitySources.harnessCD.environment.noData')}
          buttonText={getString('retry')}
          onClick={() => refetchEnvironments()}
        />
      </Container>
    )
  }

  const onNext = () => {
    const environments = tableData.reduce((acc: any, curr) => {
      if (curr.selected && curr.environment) {
        acc[curr.id] = {
          id: curr.id,
          name: curr.name,
          appId: curr.appId,
          appName: curr.appName,
          environment: curr.environment
        }
      }
      return acc
    }, {})
    if (Object.keys(environments).length) {
      props.onSubmit?.({ environments })
    }
  }

  return (
    <Container className={css.main}>
      <Text margin={{ top: 'large', bottom: 'large' }} color={Color.BLACK}>
        {getString('cv.activitySources.harnessCD.environment.infoText')}
      </Text>
      <Formik
        initialValues={{ selectedEnvironments: props.initialValues.selectedEnvironments || [] }}
        onSubmit={onNext}
      >
        {(formik: FormikProps<{ selectedEnvironments: Array<TableData> }>) => {
          return (
            <FormikForm>
              <Table<TableData>
                onRowClick={(rowData, index) => onUpdateData(index, { selected: !rowData.selected })}
                columns={[
                  {
                    Header: getString('cv.activitySources.harnessCD.environment.harnessEnv'),
                    accessor: 'name',

                    width: '33%',
                    Cell: function RenderApplications(tableProps) {
                      const rowData: TableData = tableProps?.row?.original as TableData

                      return (
                        <Layout.Horizontal spacing="small">
                          <input
                            style={{ cursor: 'pointer' }}
                            type="checkbox"
                            checked={rowData.selected}
                            onChange={e => {
                              onUpdateData(tableProps.row.index, { selected: e.target.checked })
                            }}
                          />
                          <Icon name="cd-main" />
                          <Text color={Color.BLACK}>{rowData.name}</Text>
                        </Layout.Horizontal>
                      )
                    },
                    disableSortBy: true
                  },
                  {
                    Header: getString('cv.activitySources.harnessCD.harnessApps'),
                    accessor: 'appName',

                    width: '30%',
                    Cell: RenderColumnApplication,

                    disableSortBy: true
                  },
                  {
                    Header: (
                      <TableColumnWithFilter
                        columnName={getString('cv.activitySources.harnessCD.environment.env')}
                        onFilter={filterValue => setFilter(filterValue)}
                        appliedFilter={filter}
                      />
                    ),
                    accessor: 'environment',

                    width: '36%',
                    Cell: function EnvironmentCell({ row, value }) {
                      return (
                        <Layout.Horizontal>
                          <Icon name="harness" margin={{ right: 'small', top: 'small' }} size={20} />
                          <EnvironmentSelect
                            item={value}
                            options={environmentOptions}
                            onSelect={val => {
                              onUpdateData(row.index, { environment: val })
                            }}
                            onNewCreated={(val: EnvironmentResponseDTO) => {
                              setEnvironmentOptions([{ label: val.name, value: val.identifier }, ...environmentOptions])
                              onUpdateData(row.index, { environment: { label: val.name, value: val.identifier } })
                            }}
                          />
                        </Layout.Horizontal>
                      )
                    },

                    disableSortBy: true
                  }
                ]}
                data={tableData || []}
                pagination={{
                  itemCount: (data?.resource as any)?.total || 0,
                  pageSize: (data?.resource as any)?.pageSize || PAGE_LIMIT,
                  pageCount: Math.ceil((data?.resource as any)?.total / PAGE_LIMIT) || -1,
                  pageIndex: page || 0,
                  gotoPage: pageNumber => {
                    setPage(pageNumber)
                    if (pageNumber) {
                      setOffset(pageNumber * PAGE_LIMIT + 1)
                    } else {
                      setOffset(0)
                    }
                  }
                }}
              />
              <SubmitAndPreviousButtons onPreviousClick={props.onPrevious} onNextClick={() => formik.submitForm()} />
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default SelectEnvironment
