/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useRef, useEffect } from 'react'
import { Container, Layout, Text, Button, Icon, Popover, FontVariation, Color } from '@wings-software/uicore'
import copy from 'copy-to-clipboard'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import moment from 'moment'
import { useStrings } from 'framework/strings'

import { convertNumberToFixedDecimalPlaces } from '@ce/utils/convertNumberToFixedDecimalPlaces'
import {
  getCPUValueInReadableForm,
  getMemValueInReadableForm,
  getRecommendationYaml,
  getMemoryValueInGBFromExpression,
  getCPUValueInCPUFromExpression
} from '@ce/utils/formatResourceValue'
import { RecommendationItem, TimeRangeValue, ResourceObject, QualityOfSerive } from '@ce/types'
import type { RecommendationOverviewStats } from 'services/ce/services'

import formatCost from '@ce/utils/formatCost'
import { RecommendationType, ChartColors } from './constants'
import RecommendationTabs from './RecommendationTabs'
import RecommendationDiffViewer from '../RecommendationDiffViewer/RecommendationDiffViewer'
import RecommendationHistogram, { CustomHighcharts } from '../RecommendationHistogram/RecommendationHistogram'
import limitLegend from './images/limit-legend.svg'
import requestLegend from './images/request-legend.svg'
import histogramImg from './images/histogram.gif'
import {
  RecommendationDetailsSavingsCard,
  RecommendationDetailsSpendCard
} from '../RecommendationDetailsSummaryCards/RecommendationDetailsSummaryCards'
import css from './RecommendationDetails.module.scss'

interface RecommendationDetailsProps {
  histogramData: RecommendationItem
  currentResources: ResourceObject
  timeRange: TimeRangeValue
  recommendationStats: RecommendationOverviewStats
  qualityOfService: string
  timeRangeFilter: string[]
  cpuAndMemoryValueBuffer: number
}

const RecommendationDetails: React.FC<RecommendationDetailsProps> = ({
  histogramData,
  currentResources,
  timeRange,
  recommendationStats,
  qualityOfService,
  timeRangeFilter,
  cpuAndMemoryValueBuffer
}) => {
  const [cpuReqVal, setCPUReqVal] = useState(50)
  const [memReqVal, setMemReqVal] = useState(50)
  const [memLimitVal, setMemLimitVal] = useState(95)

  const { cpu: cpuCost, memory: memoryCost } = histogramData.containerRecommendation?.lastDayCost || {}

  const [reRenderChart, setRerenderChart] = useState(false)

  const { getString } = useStrings()

  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationType>(
    RecommendationType.CostOptimized
  )
  const currentCPUResource = getCPUValueInCPUFromExpression(currentResources.requests.cpu || 1)
  const currentMemResource = getMemoryValueInGBFromExpression(currentResources.requests.memory)

  const cpuReqValue = Number(histogramData?.cpuHistogram.precomputed[cpuReqVal])
  const memReqValue = Number(histogramData?.memoryHistogram.precomputed[memReqVal])
  const memLimitValue = Number(histogramData?.memoryHistogram.precomputed[memLimitVal])

  const perfCPUReqValue = Number(histogramData?.cpuHistogram.precomputed[95])
  const perfMemReqValue = Number(histogramData?.memoryHistogram.precomputed[95])

  const costOptimisedCPUReqValue = Number(histogramData?.cpuHistogram.precomputed[50])
  const costOptimisedMemReqValue = Number(histogramData?.memoryHistogram.precomputed[50])

  const isLastDayCostDefined = cpuCost && memoryCost

  const numCPUCost = Number(cpuCost)
  const numMemCost = Number(memoryCost)

  const currentSavings = isLastDayCostDefined
    ? (((currentCPUResource - getCPUValueInCPUFromExpression(cpuReqValue)) / currentCPUResource) * numCPUCost +
        ((currentMemResource - getMemoryValueInGBFromExpression(memReqValue)) / currentMemResource) * numMemCost) *
      30
    : -1

  const performanceOptimizedSavings = isLastDayCostDefined
    ? (((currentCPUResource - getCPUValueInCPUFromExpression(perfCPUReqValue)) / currentCPUResource) * numCPUCost +
        ((currentMemResource - getMemoryValueInGBFromExpression(perfMemReqValue)) / currentMemResource) * numMemCost) *
      30
    : -1

  const costOptimizedSavings = isLastDayCostDefined
    ? (((currentCPUResource - getCPUValueInCPUFromExpression(costOptimisedCPUReqValue)) / currentCPUResource) *
        numCPUCost +
        ((currentMemResource - getMemoryValueInGBFromExpression(costOptimisedMemReqValue)) / currentMemResource) *
          numMemCost) *
      30
    : -1

  const isCostOptimizedCustomized =
    selectedRecommendation === RecommendationType.CostOptimized && currentSavings !== costOptimizedSavings

  const isPerfOptimizedCustomized =
    selectedRecommendation === RecommendationType.PerformanceOptimized && currentSavings !== performanceOptimizedSavings

  const cpuChartRef = useRef<CustomHighcharts>()
  const memoryChartRef = useRef<CustomHighcharts>()

  const setCPUChartRef: (chart: CustomHighcharts) => void = chart => {
    cpuChartRef.current = chart
  }

  const setMemoryChartRef: (chart: CustomHighcharts) => void = chart => {
    memoryChartRef.current = chart
  }

  const resetReqLimitMarkers: (reqCpu: number, reqMem: number, limitMem: number) => void = (
    reqCpu,
    reqMem,
    limitMem
  ) => {
    cpuChartRef.current && cpuChartRef.current.rePlaceMarker(reqCpu)
    memoryChartRef.current && memoryChartRef.current.rePlaceMarker(reqMem, limitMem)
  }

  const resetToDefaultRecommendation: (recommendation: RecommendationType) => void = (
    recommendation: RecommendationType
  ) => {
    if (recommendation === RecommendationType.CostOptimized) {
      setCPUReqVal(50)
      setMemReqVal(50)
      setMemLimitVal(95)
      resetReqLimitMarkers(50, 50, 90)
    } else if (recommendation === RecommendationType.PerformanceOptimized) {
      setCPUReqVal(95)
      setMemReqVal(95)
      setMemLimitVal(95)
      resetReqLimitMarkers(95, 95, 95)
    }
    setRerenderChart(state => !state)
  }

  useEffect(() => {
    if (qualityOfService === QualityOfSerive.GUARANTEED) {
      setMemLimitVal(memReqVal)
    } else {
      setMemLimitVal(95)
    }
  }, [qualityOfService])

  useEffect(() => {
    resetReqLimitMarkers(cpuReqVal, memReqVal, memLimitVal)
  }, [selectedRecommendation, cpuReqVal, memReqVal, memLimitVal])

  const updateCPUChart: (val: number) => void = val => {
    const {
      cpuHistogram: { precomputed }
    } = histogramData
    setCPUReqVal(val)
    const value = precomputed[val]

    cpuChartRef.current?.series[0].update({
      type: 'column',
      zones: [
        {
          value: convertNumberToFixedDecimalPlaces(value, 2) + 0.0001,
          color: ChartColors.BLUE
        },
        {
          color: ChartColors.GREY
        }
      ]
    })
  }

  const updateMemoryChart: (val: [number, number]) => void = val => {
    const {
      memoryHistogram: { precomputed }
    } = histogramData
    const [reqVal, limitVal] = val
    setMemReqVal(reqVal)
    setMemLimitVal(limitVal)

    const reqValHistogram = precomputed[reqVal]
    const limitValHistogram = precomputed[limitVal]

    memoryChartRef.current?.series[0].update({
      type: 'column',
      zones: [
        {
          value: convertNumberToFixedDecimalPlaces(reqValHistogram, 2) + 1,
          color: ChartColors.BLUE
        },
        {
          value: convertNumberToFixedDecimalPlaces(limitValHistogram, 2) + 1,
          color: ChartColors.GREEN
        },
        {
          color: ChartColors.GREY
        }
      ]
    })
  }

  return (
    <Container className={css.mainContainer} background="white" padding="large">
      {/* <Text color="grey800" font="medium">
        {histogramData.containerName}:
      </Text> */}
      <Layout.Horizontal spacing="large" padding={{ top: 'large' }}>
        <RecommendationDetailsSpendCard
          withRecommendationAmount={formatCost(
            recommendationStats?.totalMonthlyCost - recommendationStats?.totalMonthlySaving
          )}
          withoutRecommendationAmount={formatCost(recommendationStats?.totalMonthlyCost)}
          title={`${getString('ce.recommendation.listPage.monthlyPotentialCostText')}`}
          spentBy={moment(timeRangeFilter[1]).format('MMM DD')}
        />
        <RecommendationDetailsSavingsCard
          amount={formatCost(recommendationStats?.totalMonthlySaving)}
          title={getString('ce.recommendation.listPage.monthlySavingsText')}
          iconName="money-icon"
          amountSubTitle={`(${Math.floor(
            (recommendationStats?.totalMonthlySaving / recommendationStats?.totalMonthlyCost) * 100
          )}%)`}
          subTitle={`${moment(timeRangeFilter[0]).format('MMM DD')} - ${moment(timeRangeFilter[1]).format('MMM DD')}`}
        />
      </Layout.Horizontal>
      <RecommendationTabs
        costOptimizedSavings={costOptimizedSavings}
        performanceOptimizedSavings={performanceOptimizedSavings}
        currentSavings={currentSavings}
        selectedRecommendation={selectedRecommendation}
        setSelectedRecommendation={setSelectedRecommendation}
        setCPUReqVal={setCPUReqVal}
        setMemReqVal={setMemReqVal}
        setMemLimitVal={setMemLimitVal}
        isPerfOptimizedCustomized={isPerfOptimizedCustomized}
        isCostOptimizedCustomized={isCostOptimizedCustomized}
      />
      <section className={css.diffContainer}>
        <Text padding="xsmall" font={{ variation: FontVariation.TABLE_HEADERS, align: 'center' }} background="grey100">
          {getString('ce.recommendation.detailsPage.resourceChanges')}
        </Text>
        <section className={css.diffHeader}>
          <Text padding={{ left: 'small' }} className={css.heading} color="grey800" font={{ size: 'small' }}>
            {getString('ce.recommendation.detailsPage.currentResources')}
          </Text>

          <Layout.Horizontal
            border={{
              left: true,
              top: true,
              right: true,
              color: Color.GREEN_700,
              width: 2
            }}
          >
            <Text
              padding={{ left: 'small' }}
              font={{ size: 'small' }}
              className={css.heading}
              color="grey800"
              style={{
                flex: 1
              }}
            >
              {getString('ce.recommendation.detailsPage.recommendedResources', {
                recommendationType: selectedRecommendation
              })}
            </Text>
            <Icon
              name="duplicate"
              color="primary5"
              onClick={() => {
                const yamlVal = getRecommendationYaml(cpuReqValue, memReqValue, memLimitValue)
                copy(yamlVal)
              }}
              className={css.copyIcon}
              size={13}
            />
          </Layout.Horizontal>
        </section>

        <RecommendationDiffViewer
          recommendedResources={{
            limits: {
              memory: getMemValueInReadableForm(
                ((100 + cpuAndMemoryValueBuffer) / 100) * histogramData?.memoryHistogram.precomputed[memLimitVal]
              )
            },
            requests: {
              memory: getMemValueInReadableForm(
                ((100 + cpuAndMemoryValueBuffer) / 100) * histogramData?.memoryHistogram.precomputed[memReqVal]
              ),
              cpu: getCPUValueInReadableForm(
                ((100 + cpuAndMemoryValueBuffer) / 100) * histogramData?.cpuHistogram.precomputed[cpuReqVal]
              )
            }
          }}
          currentResources={currentResources}
          qualityOfService={qualityOfService}
        />
      </section>
      <Container className={css.timeframeContainer}>
        <Layout.Horizontal
          background="grey100"
          style={{
            alignItems: 'baseline',
            justifyContent: 'center'
          }}
        >
          <Text
            margin={{
              right: 'xsmall'
            }}
            font={{ variation: FontVariation.TABLE_HEADERS }}
          >
            {selectedRecommendation === RecommendationType.CostOptimized
              ? getString('ce.recommendation.detailsPage.costOptimizedCaps')
              : getString('ce.recommendation.detailsPage.performanceOptimizedCaps')}
          </Text>
          <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            position={Position.BOTTOM_LEFT}
            usePortal={false}
            modifiers={{
              arrow: { enabled: false },
              flip: { enabled: true },
              keepTogether: { enabled: true },
              preventOverflow: { enabled: true }
            }}
            content={
              <Container padding="medium" className={css.histogram}>
                <Layout.Horizontal spacing="medium">
                  <img width="235" src={histogramImg} />
                  <Text>{getString('ce.recommendation.detailsPage.histogramTextDetails1')}</Text>
                </Layout.Horizontal>
                <Text
                  padding={{
                    top: 'small'
                  }}
                >
                  {getString('ce.recommendation.detailsPage.histogramTextDetails2')}
                </Text>
              </Container>
            }
          >
            <Text color={Color.PRIMARY_5} className={css.actionText} font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('ce.recommendation.detailsPage.histogramText')}
            </Text>
          </Popover>
          <Text padding="xsmall" font={{ variation: FontVariation.TABLE_HEADERS, align: 'center' }}>
            {getString('ce.recommendation.detailsPage.timeChangeText')}
          </Text>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.actionText}>
            {timeRange?.label}
          </Text>
        </Layout.Horizontal>
      </Container>
      <Container className={css.histogramContainer}>
        <RecommendationHistogram
          reRenderChart={reRenderChart}
          updateMemoryChart={updateMemoryChart}
          updateCPUChart={updateCPUChart}
          histogramData={histogramData}
          selectedRecommendation={selectedRecommendation}
          cpuReqVal={cpuReqVal}
          memReqVal={memReqVal}
          memLimitVal={memLimitVal}
          onCPUChartLoad={setCPUChartRef}
          onMemoryChartLoad={setMemoryChartRef}
        />
      </Container>
      <Container className={css.legendContainer}>
        <Container>
          {isPerfOptimizedCustomized || isCostOptimizedCustomized ? (
            <Button
              onClick={() => {
                resetToDefaultRecommendation(selectedRecommendation)
              }}
              icon="reset-icon"
              withoutBoxShadow={true}
              intent="none"
            >
              {getString('ce.recommendation.detailsPage.resetRecommendationText', {
                recommendationType: selectedRecommendation
              })}
            </Button>
          ) : null}
        </Container>
        <img src={requestLegend} />
        <Text style={{ fontSize: 14 }}>{getString('ce.recommendation.detailsPage.reqPercentileLegendText')}</Text>
        <img src={limitLegend} />
        <Text style={{ fontSize: 14 }}>{getString('ce.recommendation.detailsPage.limitPercentileLegendText')}</Text>
      </Container>
    </Container>
  )
}

export default RecommendationDetails
