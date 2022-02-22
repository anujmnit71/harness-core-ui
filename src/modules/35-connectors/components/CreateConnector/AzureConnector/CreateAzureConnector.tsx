/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildGcpPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import AzureAuthentication from './StepAuth/AzureAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

const CreateAzureConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  const commonProps = pick(props, ['isEditMode', 'setIsEditMode', 'accountId', 'orgIdentifier', 'projectIdentifier'])
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.Azure)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.Azure))}
    >
      <ConnectorDetailsStep
        type={Connectors.Azure}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        mock={props.mock}
      />
      <AzureAuthentication
        name={getString('details')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...commonProps}
      />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildGcpPayload}
        hideModal={props.onClose}
        onConnectorCreated={props.onSuccess}
        connectorInfo={props.connectorInfo}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep={true}
        isLastStep={true}
        type={Connectors.Azure}
        onClose={props.onClose}
        stepIndex={TESTCONNECTION_STEP_INDEX}
      />
    </StepWizard>
  )
}

export default CreateAzureConnector
