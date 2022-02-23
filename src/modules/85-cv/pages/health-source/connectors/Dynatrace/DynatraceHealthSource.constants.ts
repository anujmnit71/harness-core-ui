/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { HealthSourceFieldNames } from '@cv/pages/health-source/common/utils/HealthSource.constants'

export const DynatraceHealthSourceFieldNames = {
  ...HealthSourceFieldNames,
  METRIC_SELECTOR: 'metricSelector',
  DYNATRACE_SELECTED_SERVICE: 'selectedService',
  ACTIVE_METRIC_SELECTOR: 'activeMetricSelector'
}

export const QUERY_CONTAINS_SERVICE_VALIDATION_PARAM = 'builtin:service'
