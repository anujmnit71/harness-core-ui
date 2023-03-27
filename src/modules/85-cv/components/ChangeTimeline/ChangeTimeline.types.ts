/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { ChangeSourceTypes as ChangeSourceTypeRequest } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { SecondaryEventsResponse } from 'services/cv'
import type { ChangeSourceTypes } from './ChangeTimeline.constants'
import type { AnnotationMessage } from './components/TimelineRow/components/Annotation/Annotation.types'

export interface ChangeTimelineProps {
  useMonitoredServiceChangeTimeline?: boolean
  monitoredServiceIdentifier?: string
  timeFormat?: string
  serviceIdentifier?: string | string[]
  environmentIdentifier?: string | string[]
  changeCategories?: ('Deployment' | 'Infrastructure' | 'Alert')[]
  changeSourceTypes?: ChangeSourceTypeRequest[]
  startTime?: number
  endTime?: number
  onSliderMoved?: React.Dispatch<React.SetStateAction<ChangesInfoCardData[] | null>>
  selectedTimePeriod?: SelectOption
  selectedTimeRange?: { startTime: number; endTime: number }
  hideTimeline?: boolean
  duration?: SelectOption
  monitoredServiceIdentifiers?: string[]
  addAnnotation?: (annotationMessage?: AnnotationMessage) => void
  sloWidgetsData?: SecondaryEventsResponse[]
  sloWidgetsDataLoading?: boolean
  fetchSecondaryEvents?: () => Promise<void>
  isSLOChartTimeline?: boolean
}

export interface ChangesInfoCardData {
  key: ChangeSourceTypes
  count?: number
  message: string
}
