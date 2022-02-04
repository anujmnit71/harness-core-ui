/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import {
  Color,
  Container,
  Layout,
  Text,
  Button,
  Card,
  PageBody,
  Popover,
  FontVariation,
  ButtonVariation,
  ButtonSize,
  PillToggle
} from '@wings-software/uicore'
import { Position, Menu, MenuItem, Slider } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import routes from '@common/RouteDefinitions'
import { GET_DATE_RANGE } from '@ce/utils/momentUtils'
import type { RecommendationItem, TimeRangeValue } from '@ce/types'
import { TimeRange, TimeRangeType } from '@ce/types'
import { ViewTimeRange } from '@ce/components/RecommendationDetails/constants'
import { RecommendationOverviewStats, ResourceType, useFetchRecommendationQuery } from 'services/ce/services'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { PAGE_NAMES, USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import CustomizeRecommendationsImg from './images/custom-recommendations.gif'

import RecommendationDetails from '../../components/RecommendationDetails/RecommendationDetails'
import css from './RecommendationDetailsPage.module.scss'

interface ResourceDetails {
  cpu?: string
  memory: string
}
interface ResourceObject {
  limits: ResourceDetails
  requests: ResourceDetails
}
interface ContainerRecommendaitons {
  current: ResourceObject
}
interface RecommendationDetails {
  items: Array<RecommendationItem>
  containerRecommendations: Record<string, ContainerRecommendaitons>
}
interface WorkloadDetailsProps {
  workloadData: WorkloadDataType
  goToWorkloadDetails: () => void
  qualityOfService: string
  setQualityOfService: React.Dispatch<React.SetStateAction<string>>
  cpuAndMemoryValueBuffer: number
  setCpuAndMemoryValueBuffer: React.Dispatch<React.SetStateAction<number>>
}

const WorkloadDetails: React.FC<WorkloadDetailsProps> = props => {
  const { getString } = useStrings()
  const {
    workloadData,
    goToWorkloadDetails,
    qualityOfService,
    setQualityOfService,
    cpuAndMemoryValueBuffer,
    setCpuAndMemoryValueBuffer
  } = props

  return (
    <Container padding="xlarge">
      <Layout.Vertical spacing="large">
        <Layout.Horizontal margin={{ bottom: 'medium' }} flex={{ justifyContent: 'space-between' }}>
          <Text font={{ variation: FontVariation.H5 }}>
            {getString('ce.perspectives.workloadDetails.workloadDetailsText')}
          </Text>
          <Button variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL} onClick={goToWorkloadDetails}>
            {getString('ce.recommendation.detailsPage.viewMoreDetailsText')}
          </Button>
        </Layout.Horizontal>
        <Layout.Vertical margin={{ bottom: 'medium' }}>
          <Text>{getString('ce.recommendation.listPage.filters.clusterName')}</Text>
          <Text color={Color.PRIMARY_7}>{workloadData.clusterName}</Text>
        </Layout.Vertical>
        <Layout.Vertical margin={{ bottom: 'medium' }}>
          <Text>{getString('ce.perspectives.workloadDetails.fieldNames.workload')}</Text>
          <Text color={Color.PRIMARY_7}>{workloadData.resourceName}</Text>
        </Layout.Vertical>

        <Text font={{ variation: FontVariation.H5 }}>
          {getString('ce.recommendation.detailsPage.tuneRecommendations')}
        </Text>
        <Card style={{ padding: 0 }}>
          <Container padding="medium">
            <Text font={{ variation: FontVariation.H6 }}>
              {getString('ce.recommendation.detailsPage.setQoSAndBuffer')}
            </Text>
          </Container>
          <Container padding="medium" background={Color.PRIMARY_1}>
            <Text font={{ variation: FontVariation.SMALL_SEMI }} margin={{ bottom: 'small' }}>
              {getString('ce.recommendation.detailsPage.qualityOfService')}
            </Text>
            <PillToggle
              selectedView={qualityOfService}
              options={[
                { label: 'BURSTABLE', value: 'BURSTABLE' },
                { label: 'GURANTEED', value: 'GURANTEED' }
              ]}
              className={css.pillToggle}
              onChange={val => setQualityOfService(val)}
            />
            <Text font={{ variation: FontVariation.SMALL_SEMI }} margin={{ bottom: 'medium', top: 'medium' }}>
              {getString('ce.recommendation.detailsPage.memoryValueBuffer')}
            </Text>
            <Container className={css.sliderContainer}>
              <Text
                font={{ variation: FontVariation.SMALL_SEMI, align: 'right' }}
                margin={{ bottom: 'small', top: 'small' }}
              >
                {`${cpuAndMemoryValueBuffer}%`}
              </Text>
              <Slider
                min={0}
                max={100}
                stepSize={1}
                labelRenderer={false}
                value={cpuAndMemoryValueBuffer}
                onChange={val => setCpuAndMemoryValueBuffer(val)}
                className={css.bufferSlider}
              />
            </Container>
          </Container>
        </Card>
        {/* <Text font="medium">{getString('ce.recommendation.listPage.listTableHeaders.recommendationType')}</Text>
        <Text color="primary5" font="medium">
          {getString('ce.recommendation.detailsPage.resizeText')}
        </Text>
        <Text color="grey800" font="medium">
          {getString('ce.recommendation.detailsPage.howItWorks')}
        </Text>
        <Text color="grey400">{getString('ce.recommendation.detailsPage.recommendationComputation')}</Text>
        <Text color="grey800" font="medium">
          {getString('ce.recommendation.detailsPage.costOptimized')}
        </Text>
        <Text color="grey400">{getString('ce.recommendation.detailsPage.costOptimizedDetails')}</Text>
        <Text color="grey800" font="medium">
          {getString('ce.recommendation.detailsPage.performanceOptimized')}
        </Text>
        <Text color="grey400">{getString('ce.recommendation.detailsPage.performanceOptimizedDetails')}</Text>
        <Text color="grey800" font="medium">
          {getString('common.repo_provider.customLabel')}
        </Text> */}
        <Container padding="medium" background={Color.BLUE_50}>
          <Layout.Horizontal>
            <Text icon="info-messaging" font={{ variation: FontVariation.SMALL }} padding={{ right: 'small' }}>
              {getString('ce.recommendation.detailsPage.customDetails')}
            </Text>
            <img className={css.customImage} src={CustomizeRecommendationsImg} alt="custom-recommendation-img" />
          </Layout.Horizontal>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

// const CostDetails: React.FC<{ costName: string; totalCost: React.ReactNode; isSavingsCost?: boolean }> = ({
//   costName,
//   totalCost,
//   isSavingsCost
// }) => {
//   return (
//     <Layout.Vertical spacing="small">
//       <Text font="normal" color="grey400">
//         {costName}
//       </Text>
//       <Text
//         font="medium"
//         color={isSavingsCost ? 'green600' : 'grey800'}
//         icon={isSavingsCost ? 'money-icon' : undefined}
//         iconProps={{ size: 24 }}
//       >
//         {totalCost}
//       </Text>
//     </Layout.Vertical>
//   )
// }

interface WorkloadDataType {
  clusterName?: string
  namespace?: string
  id?: string
  resourceName?: string
}
// interface RecommendationSavingsComponentProps {
//   recommendationStats: RecommendationOverviewStats
//   workloadData: WorkloadDataType
// }

// const RecommendationSavingsComponent: React.FC<RecommendationSavingsComponentProps> = ({
//   recommendationStats,
//   workloadData
// }) => {
//   const { getString } = useStrings()
//   const { trackEvent } = useTelemetry()
//   const history = useHistory()
//   const { recommendation, accountId, recommendationName } = useParams<{
//     recommendation: string
//     recommendationName: string
//     accountId: string
//   }>()

//   const { totalMonthlyCost, totalMonthlySaving } = recommendationStats

//   return (
//     <Container padding="xlarge" className={css.savingsContainer}>
//       <Container>
//         {totalMonthlyCost ? (
//           <CostDetails
//             costName={getString('ce.recommendation.listPage.monthlySavingsText')}
//             totalCost={
//               <Layout.Horizontal
//                 spacing="xsmall"
//                 style={{
//                   alignItems: 'flex-end'
//                 }}
//                 className={css.costContainer}
//               >
//                 <Text color="green600" className={css.subText}>
//                   {getString('ce.recommendation.listPage.uptoText')}
//                 </Text>
//                 <Text font="medium" color="green600">
//                   {formatCost(totalMonthlySaving)}
//                 </Text>
//               </Layout.Horizontal>
//             }
//             isSavingsCost={true}
//           />
//         ) : null}
//         {totalMonthlySaving ? (
//           <Container padding={{ top: 'xlarge' }}>
//             <CostDetails
//               totalCost={
//                 <Layout.Horizontal
//                   spacing="xsmall"
//                   style={{
//                     alignItems: 'flex-end'
//                   }}
//                 >
//                   <Text font="medium" color="grey800">
//                     {formatCost(totalMonthlyCost)}
//                   </Text>
//                   <Text className={css.subText} color="grey300">
//                     {getString('ce.recommendation.listPage.forecatedCostSubText')}
//                   </Text>
//                 </Layout.Horizontal>
//               }
//               costName={getString('ce.recommendation.listPage.monthlyPotentialCostText')}
//             />
//           </Container>
//         ) : null}
//       </Container>
//       {/* <FlexExpander /> */}
//       <Container
//         padding={{
//           left: 'large'
//         }}
//       >
//         <Layout.Horizontal spacing="huge">
//           <Text color={Color.GREY_400}>{getString('ce.perspectives.workloadDetails.workloadDetailsText')}</Text>
//           <Button
//             className={css.viewDetailsButton}
//             round
//             font="small"
//             minimal
//             intent="primary"
//             text={getString('ce.recommendation.detailsPage.viewMoreDetailsText')}
//             border={true}
//             onClick={() => {
//               trackEvent(USER_JOURNEY_EVENTS.RECOMMENDATION_VIEW_MORE_CLICK, {})
//               workloadData.clusterName &&
//                 workloadData.resourceName &&
//                 workloadData.namespace &&
//                 history.push(
//                   routes.toCERecommendationWorkloadDetails({
//                     accountId,
//                     recommendation,
//                     recommendationName,
//                     clusterName: workloadData.clusterName,
//                     namespace: workloadData.namespace,
//                     workloadName: workloadData.resourceName
//                   })
//                 )
//             }}
//           />
//         </Layout.Horizontal>
//         <Container>
//           <Text color={Color.GREY_400}>{getString('ce.recommendation.listPage.filters.clusterName')}</Text>
//           <Text
//             padding={{
//               top: 'xsmall'
//             }}
//           >
//             {workloadData.clusterName}
//           </Text>
//         </Container>
//         <Container padding={{ top: 'large' }}>
//           <Text color={Color.GREY_400}>{getString('ce.perspectives.workloadDetails.fieldNames.workload')}</Text>
//           <Text
//             padding={{
//               top: 'xsmall'
//             }}
//           >
//             {workloadData.resourceName}
//           </Text>
//         </Container>
//       </Container>
//     </Container>
//   )
// }

const RecommendationDetailsPage: React.FC = () => {
  const { recommendation, accountId, recommendationName } = useParams<{
    recommendation: string
    recommendationName: string
    accountId: string
  }>()
  const { getString } = useStrings()
  const { trackPage, trackEvent } = useTelemetry()
  const history = useHistory()
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({ value: TimeRangeType.LAST_7, label: TimeRange.LAST_7 })

  const [qualityOfService, setQualityOfService] = useState<string>('BURSTABLE')
  const [cpuAndMemoryValueBuffer, setCpuAndMemoryValueBuffer] = useState(0)

  useEffect(() => {
    trackPage(PAGE_NAMES.RECOMMENDATIONS_DETAILS_PAGE, {})
  }, [])

  const timeRangeFilter = GET_DATE_RANGE[timeRange.value]

  const [result] = useFetchRecommendationQuery({
    variables: {
      id: recommendation,
      resourceType: ResourceType.Workload,
      startTime: timeRangeFilter[0],
      endTime: timeRangeFilter[1]
    }
  })

  const { data, fetching } = result

  const recommendationDetails = (data?.recommendationDetails as RecommendationDetails) || {}
  const recommendationStats = data?.recommendationStatsV2 as RecommendationOverviewStats
  const recommendationItems = recommendationDetails?.items || []
  const workloadData = data?.recommendationsV2?.items?.length && data?.recommendationsV2?.items[0]

  const goToWorkloadDetails = () => {
    if (workloadData) {
      trackEvent(USER_JOURNEY_EVENTS.RECOMMENDATION_VIEW_MORE_CLICK, {})
      workloadData.clusterName &&
        workloadData.resourceName &&
        workloadData.namespace &&
        history.push(
          routes.toCERecommendationWorkloadDetails({
            accountId,
            recommendation,
            recommendationName,
            clusterName: workloadData.clusterName,
            namespace: workloadData.namespace,
            workloadName: workloadData.resourceName
          })
        )
    }
  }

  return (
    <>
      <Page.Header
        title={`${getString('ce.recommendation.detailsPage.headerText')} ${recommendationName}`}
        breadcrumbs={
          <Breadcrumbs
            links={[
              {
                url: routes.toCERecommendations({ accountId }),
                label: getString('ce.recommendation.sideNavText')
              },
              {
                url: '',
                label: recommendationName
              }
            ]}
          />
        }
      />
      <PageBody loading={fetching}>
        <Card style={{ width: '100%' }}>
          {/* Use strings */}
          <Layout.Horizontal spacing="medium">
            <Text font={{ variation: FontVariation.H6 }}>
              {getString('ce.recommendation.detailsPage.utilizationDataComputation')}
            </Text>
            <Popover
              position={Position.BOTTOM_LEFT}
              modifiers={{
                arrow: { enabled: false },
                flip: { enabled: true },
                keepTogether: { enabled: true },
                preventOverflow: { enabled: true }
              }}
              content={
                <Menu>
                  {ViewTimeRange.map(viewTimeRange => (
                    <MenuItem
                      onClick={() => {
                        setTimeRange(viewTimeRange)
                      }}
                      text={viewTimeRange.label}
                      key={viewTimeRange.value}
                    />
                  ))}
                </Menu>
              }
            >
              <Text
                color="primary5"
                rightIcon="caret-down"
                rightIconProps={{
                  color: 'primary5'
                }}
                className={css.actionText}
              >
                {timeRange?.label}
              </Text>
            </Popover>
          </Layout.Horizontal>
        </Card>
        {/* {recommendationStats ? (
          <RecommendationSavingsComponent
            recommendationStats={recommendationStats}
            workloadData={workloadData as WorkloadDataType}
          />
        ) : null} */}
        {recommendationItems.length ? (
          <Container className={css.detailsContainer} padding="xxlarge">
            <Layout.Vertical spacing="huge">
              {Object.keys(recommendationDetails.containerRecommendations || {}).map((cRKey, index) => {
                const item = recommendationItems.find(rI => rI.containerName === cRKey) || ({} as RecommendationItem)
                const currentResources = recommendationDetails.containerRecommendations[cRKey].current || {}

                return (
                  <RecommendationDetails
                    key={`${item.containerName}-${index}-${timeRange.label}`}
                    histogramData={item}
                    currentResources={currentResources}
                    timeRange={timeRange}
                    recommendationStats={recommendationStats}
                    qualityOfService={qualityOfService}
                    timeRangeFilter={timeRangeFilter}
                    cpuAndMemoryValueBuffer={cpuAndMemoryValueBuffer}
                  />
                )
              })}
              {/* {recommendationItems.map((item, index) => {
                  const { containerName } = item
                  const currentResources = recommendationDetails?.containerRecommendations[containerName]?.current
                  return (
                    <RecommendationDetails
                      key={`${item.containerName}-${index}-${timeRange.label}`}
                      histogramData={item}
                      currentResources={currentResources}
                      timeRange={timeRange}
                      setTimeRange={setTimeRange}
                    />
                  )
                })} */}
            </Layout.Vertical>
            <WorkloadDetails
              goToWorkloadDetails={goToWorkloadDetails}
              workloadData={workloadData as WorkloadDataType}
              qualityOfService={qualityOfService}
              setQualityOfService={setQualityOfService}
              cpuAndMemoryValueBuffer={cpuAndMemoryValueBuffer}
              setCpuAndMemoryValueBuffer={setCpuAndMemoryValueBuffer}
            />
          </Container>
        ) : null}
      </PageBody>
    </>
  )
}

export default RecommendationDetailsPage
