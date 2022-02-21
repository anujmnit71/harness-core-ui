/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'

export interface UsageLimitBannerTextProps {
  message?: string
}

const UsageLimitBannerText: React.FC<UsageLimitBannerTextProps> = props => {
  const { message } = props

  const isPlanEnforcementEnabled = usePlanEnforcement()
  if (!isPlanEnforcementEnabled) {
    return <></>
  }

  return (
    <>
      <p>usage limit banner text</p>
      <p>{message}</p>
    </>
  )
}
export default UsageLimitBannerText
