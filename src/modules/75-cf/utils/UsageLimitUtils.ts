/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ReactNode } from 'react'
import { BannerType } from '@common/layouts/Constants'
import type { CheckFeatureReturn } from 'framework/featureStore/featureStoreUtil'
import { formatToCompactNumber } from '@cf/utils/CFUtils'
import type { UseStringsReturn } from 'framework/strings'

export const getBannerText = (
  getString: UseStringsReturn['getString'],
  monthlyActiveUsers: CheckFeatureReturn,
  additionalLicenseProps: Record<string, any>
): ReactNode => {
  const { isEnterpriseEdition, isFreeEdition, isTeamEdition } = additionalLicenseProps

  const clientMauUsageCount = Number(monthlyActiveUsers?.featureDetail?.count)
  const clientMauPlanLimit = Number(monthlyActiveUsers?.featureDetail?.limit)

  const clientMauUsagePercentage = Math.trunc((clientMauUsageCount / clientMauPlanLimit) * 100)
  const clientMauPlanLimitFormatted = formatToCompactNumber(clientMauPlanLimit)

  const showInfoBanner = clientMauPlanLimit > 0 && clientMauUsagePercentage >= 90 && clientMauUsagePercentage < 100
  const showWarningBanner = clientMauPlanLimit > 0 && clientMauUsagePercentage >= 100

  let message!: string
  let bannerType!: BannerType

  if (isFreeEdition) {
    if (!showInfoBanner) {
      return {
        message: () =>
          getString('cf.planEnforcement.freePlan.approachingLimit', {
            clientMauUsagePercentage,
            clientMauPlanLimitFormatted
          }),
        bannerType: BannerType.INFO
      }
    }

    if (showWarningBanner) {
      return {
        message: getString('cf.planEnforcement.freePlan.upgradeRequired', {
          clientMauPlanLimitFormatted
        }),
        bannerType: BannerType.LEVEL_UP
      }
    }
  }

  if (isTeamEdition || isEnterpriseEdition) {
    if (showInfoBanner) {
      return {
        message: () =>
          getString('cf.planEnforcement.teamEnterprisePlan.approachingLimit', {
            clientMauUsagePercentage
          }),
        bannerType: BannerType.INFO
      }
    }

    if (showWarningBanner) {
      return {
        message: () => getString('cf.planEnforcement.teamEnterprisePlan.upgradeRequired'),
        bannerType: BannerType.LEVEL_UP
      }
    }
  }

  return {
    message,
    bannerType
  }
}
