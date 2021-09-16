/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import {
  Layout,
  Container,
  StepsProgress,
  Intent,
  Button,
  Card,
  Color,
  Icon,
  Text,
  ButtonVariation
} from '@wings-software/uicore'

import { String, useStrings } from 'framework/strings'
import type { ConnectedArgoGitOpsInfoDTO } from 'services/cd-ng'
import type { BaseProviderStepProps } from '../types'
import css from './TestConnection.module.scss'

export enum Status {
  // WAIT = 'WAIT',
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

type TestConnectionProps = BaseProviderStepProps

export default function TestConnection(props: TestConnectionProps): React.ReactElement {
  const [currentStep] = useState(1)
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.PROCESS)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const url = (props?.prevStepData?.spec as ConnectedArgoGitOpsInfoDTO)?.adapterUrl
  const stepName = `Connecting to Adapter URL: ${url}`

  const { getString } = useStrings()
  const handleSuccess = (): void => {
    props.onClose?.()
  }

  const launchArgoDashboard = (): void => {
    const provider = props?.prevStepData
    props.onLaunchArgoDashboard?.(provider)
  }

  const validateAdapterURL = (): void => {
    let updatedURL = url
    if (updatedURL) {
      updatedURL += url.endsWith('/') ? `api/version` : `/api/version`
    }

    fetch(updatedURL)
      .then(() => {
        setCurrentStatus(Status.DONE)
        setCurrentIntent(Intent.SUCCESS)
      })
      .catch(() => {
        setCurrentStatus(Status.ERROR)
        setCurrentIntent(Intent.DANGER)
      })
  }

  useEffect(() => {
    validateAdapterURL()
  }, [])

  return (
    <Layout.Vertical className={css.stepContainer}>
      <div className={css.heading}>Test Connection</div>

      <Container className={css.connectorForm}>
        <Container style={{ minHeight: 460 }}>
          <Layout.Vertical spacing="large" className={css.stepFormContainer}>
            <StepsProgress
              steps={[stepName]}
              intent={currentIntent}
              current={currentStep}
              currentStatus={currentStatus}
            />

            {(currentStatus === Status.DONE || currentStatus === Status.ERROR) && (
              <div className={cx(css.validationStatus, { [css.success]: currentStatus === Status.DONE })}>
                {currentStatus === Status.DONE ? (
                  'Connection Successful'
                ) : (
                  <Card className={css.card}>
                    <Text color={Color.RED_700} font={{ weight: 'semi-bold' }} style={{ marginBottom: '16px' }}>
                      Could not connect to the Adapter URL: &nbsp;
                      <a href={url} target="_blank" rel="noreferrer">
                        {url}
                      </a>
                    </Text>
                    <div className={css.issueInfo}>
                      <Icon color={Color.GREY_700} name="info" style={{ marginRight: '8px' }}></Icon>
                      <String stringID="cd.connectionIssueInfo" useRichText />
                    </div>

                    <div className={css.issueSuggestion}>
                      <Icon color={Color.GREY_700} name="lightbulb" style={{ marginRight: '8px' }}></Icon>
                      <String stringID="cd.connectionIssueSuggestion" useRichText />
                    </div>
                  </Card>
                )}
              </div>
            )}
          </Layout.Vertical>
        </Container>

        <Layout.Horizontal spacing="large">
          {currentStatus === Status.ERROR && (
            <Button
              variation={ButtonVariation.SECONDARY}
              text={getString('back')}
              icon="chevron-left"
              onClick={() => props?.previousStep?.(props?.prevStepData)}
              data-name="commonGitBackButton"
            />
          )}
          <Button
            variation={currentStatus === Status.ERROR ? ButtonVariation.PRIMARY : ButtonVariation.SECONDARY}
            text={getString('finish')}
            onClick={handleSuccess}
            className={css.nextButton}
          />

          {currentStatus === Status.DONE && (
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('cd.launchArgo')}
              onClick={launchArgoDashboard}
              className={css.nextButton}
            />
          )}
        </Layout.Horizontal>
      </Container>
    </Layout.Vertical>
  )
}
