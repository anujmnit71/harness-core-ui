/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Card, Layout } from '@harness/uicore'
import React from 'react'
// import FlagToggleSwitch from '@cf/components/EditFlagTabs/FlagToggleSwitch'
import css from './TargetingRulesTab.module.scss'

// interface TargetingRulesTabProps {}

const TargetingRulesTab = () => {
  return (
    <Layout.Vertical padding={{ left: 'xlarge', right: 'xlarge' }} height="100%">
      <Layout.Vertical spacing="small">
        <Card elevation={0}>{/* <FlagToggleSwitch /> */}</Card>
        <Card>ON default rules section</Card>
        <Card>OFF rules section</Card>
      </Layout.Vertical>

      <Layout.Horizontal padding="medium" spacing="small" className={css.actionButtons}>
        <Button
          type="submit"
          text="Save Changes"
          variation={ButtonVariation.PRIMARY}
          //   text={getString('save')}
          //   onClick={event => {
          //     if (gitSync?.isGitSyncEnabled && !gitSync?.isAutoCommitEnabled) {
          //       event.preventDefault()
          //       setIsGitSyncModalOpen(true)
          //     }
          //   }}
        />
        <Button
          variation={ButtonVariation.TERTIARY}
          text="Cancel"
          //   text={getString('cancel')}
          //   onClick={(e: MouseEvent) => {
          //     e.preventDefault()
          //     onCancelEditHandler()
          //     formikProps.handleReset()
          //   }}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default TargetingRulesTab
