import React from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { Icon, Button } from '@wings-software/uicore'
import { isNil, isEmpty } from 'lodash-es'
import cx from 'classnames'

import FailureStrategy from '@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy'

import { useStrings } from 'framework/exports'
import type { ExecutionWrapper } from 'services/cd-ng'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerTypes, DrawerSizes } from '../PipelineContext/PipelineActions'
import { StepCommandsWithRef as StepCommands, StepFormikRef } from '../StepCommands/StepCommands'
import { TabTypes } from '../StepCommands/StepCommandTypes'
import { StepPalette } from '../StepPalette/StepPalette'
import { addService, addStepOrGroup, generateRandomString } from '../ExecutionGraph/ExecutionGraphUtil'
import PipelineVariables from '../PipelineVariables/PipelineVariables'
import { PipelineNotifications } from '../PipelineNotifications/PipelineNotifications'
import { PipelineTemplates } from '../PipelineTemplates/PipelineTemplates'
import { ExecutionStrategy } from '../ExecutionStrategy/ExecutionStategy'
import type { StepData } from '../../AbstractSteps/AbstractStepFactory'
import { StepType } from '../../PipelineSteps/PipelineStepInterface'
import { FlowControl } from '../FlowControl/FlowControl'
import { StepWidget } from '../../AbstractSteps/StepWidget'
import SkipCondition from '../SkipCondition/SkipCondition'
import { StageTypes } from '../Stages/StageTypes'

import css from './RightDrawer.module.scss'

export const AlmostFullScreenDrawers: DrawerTypes[] = [
  DrawerTypes.PipelineVariables,
  DrawerTypes.PipelineNotifications,
  DrawerTypes.FlowControl
]

export const RightDrawer: React.FC = (): JSX.Element => {
  const {
    state: {
      pipeline,
      pipelineView: {
        drawerData,
        isDrawerOpened,
        splitViewData: { selectedStageId, stageType }
      },
      pipelineView
    },
    updatePipeline,
    updatePipelineView,
    getStageFromPipeline,
    stepsFactory
  } = React.useContext(PipelineContext)
  const { type, data, ...restDrawerProps } = drawerData
  const { stage: selectedStage } = getStageFromPipeline(selectedStageId || '')
  let stepData = data?.stepConfig?.node?.type ? stepsFactory.getStepData(data?.stepConfig?.node?.type) : null
  const formikRef = React.useRef<StepFormikRef | null>(null)
  const { getString } = useStrings()
  const isAlmostFullscreen = AlmostFullScreenDrawers.includes(type)
  let title: React.ReactNode | null = null

  if (data?.stepConfig?.isStepGroup) {
    stepData = stepsFactory.getStepData(StepType.StepGroup)
  }

  if (stepData) {
    title = (
      <div className={css.title}>
        <Icon name={stepsFactory.getStepIcon(stepData?.type || /* istanbul ignore next */ '')} />
        {stepData?.name}
      </div>
    )
  } else {
    switch (type) {
      case DrawerTypes.FailureStrategy:
        title = (
          <div className={css.title}>
            <Icon name="failure-strategy" size={40} />
            {getString('stageName', selectedStage?.stage)} / {getString('failureStrategy.title')}
          </div>
        )
        break
      case DrawerTypes.SkipCondition:
        title = (
          <div className={css.title}>
            <Icon name="conditional-skip" size={20} />
            {getString('stageName', selectedStage?.stage)} / {getString('skipConditionTitle')}
          </div>
        )
        break
      case DrawerTypes.PipelineNotifications:
        title = getString('notifications')
        break
      default:
        title = null
    }
  }

  const onSubmitStep = (item: ExecutionWrapper): void => {
    const node = data?.stepConfig?.node
    if (node) {
      // Add/replace values only if they are presented
      if (item.name && item.tab !== TabTypes.Advanced) node.name = item.name
      if (item.identifier && item.tab !== TabTypes.Advanced) node.identifier = item.identifier
      if (item.description && item.tab !== TabTypes.Advanced) node.description = item.description
      if (item.skipCondition && item.tab === TabTypes.Advanced) node.skipCondition = item.skipCondition
      if (item.timeout && item.tab !== TabTypes.Advanced) node.timeout = item.timeout
      if (item.failureStrategies && item.tab === TabTypes.Advanced) node.failureStrategies = item.failureStrategies

      // Delete values if they were already added and now removed
      if (node.timeout && !item.timeout && item.tab !== TabTypes.Advanced) delete node.timeout
      if (node.description && !item.description && item.tab !== TabTypes.Advanced) delete node.description
      if (node.skipCondition && !item.skipCondition && item.tab === TabTypes.Advanced) delete node.skipCondition
      if (node.failureStrategies && !item.failureStrategies && item.tab === TabTypes.Advanced)
        delete node.failureStrategies

      if (item.spec && item.tab !== TabTypes.Advanced) {
        node.spec = { ...item.spec }
      }
      data?.stepConfig?.onUpdate?.(item)
      updatePipeline(pipeline)

      // TODO: temporary fix for FF
      // can be removed once the unified solution across modules is implemented
      if (stageType === StageTypes.FEATURE) {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: false,
          drawerData: { type: DrawerTypes.StepConfig }
        })
      }
    }
  }

  return (
    <Drawer
      onClose={async e => {
        e?.persist()

        if (formikRef.current) {
          if (
            // this will not check for form validation when cross icon is clicked to close the modal
            e?.type === 'click' &&
            (e?.target as HTMLElement)?.closest('.bp3-dialog-close-button') &&
            formikRef.current.getValues()
          ) {
            onSubmitStep(formikRef.current.getValues())
          } else {
            // please do not remove the await below.
            // This is required for errors to be populated correctly
            await formikRef.current.submitForm()

            if (!isEmpty(formikRef.current.getErrors())) {
              return
            }
          }
        }

        updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
      }}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={type === DrawerTypes.ExecutionStrategy ? false : true}
      canOutsideClickClose={type === DrawerTypes.ExecutionStrategy ? false : true}
      enforceFocus={true}
      hasBackdrop={true}
      size={DrawerSizes[type]}
      isOpen={isDrawerOpened}
      position={Position.RIGHT}
      title={title}
      data-type={type}
      className={cx(css.main, { [css.almostFullScreen]: isAlmostFullscreen })}
      {...restDrawerProps}
      {...(type === DrawerTypes.FlowControl ? { style: { right: 60, top: 64 }, hasBackdrop: false } : {})}
      isCloseButtonShown={title ? !isAlmostFullscreen : undefined}
      // BUG: https://github.com/palantir/blueprint/issues/4519
      // you must pass only a single classname, not even an empty string, hence passing a dummy class
      // "classnames" package cannot be used here because it returns an empty string when no classes are applied
      portalClassName={isAlmostFullscreen ? css.almostFullScreenPortal : 'pipeline-studio-right-drawer'}
    >
      {isAlmostFullscreen ? (
        <Button
          minimal
          className={css.almostFullScreenCloseBtn}
          icon="cross"
          onClick={() => {
            updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
          }}
        />
      ) : null}
      {type === DrawerTypes.StepConfig && data?.stepConfig?.node && (
        <StepCommands
          step={data.stepConfig.node}
          ref={formikRef}
          stepsFactory={stepsFactory}
          hasStepGroupAncestor={!!data?.stepConfig?.isUnderStepGroup}
          onChange={onSubmitStep}
          isStepGroup={data.stepConfig.isStepGroup}
          hiddenPanels={data.stepConfig.hiddenAdvancedPanels}
        />
      )}
      {type === DrawerTypes.AddStep && selectedStageId && data?.paletteData && (
        <StepPalette
          selectedStage={selectedStage || {}}
          stepsFactory={stepsFactory}
          stageType={stageType as StageTypes}
          onSelect={(item: StepData) => {
            const paletteData = data.paletteData
            if (paletteData?.entity) {
              const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
              const newStepData = {
                step: {
                  type: item.type,
                  name: item.name,
                  identifier: generateRandomString(item.name)
                }
              }
              if (pipelineStage && isNil(pipelineStage.stage.spec.execution)) {
                if (paletteData.isRollback) {
                  pipelineStage.stage.spec.execution = {
                    rollbackSteps: []
                  }
                } else {
                  pipelineStage.stage.spec.execution = {
                    steps: []
                  }
                }
              }
              data?.paletteData?.onUpdate?.(newStepData.step)
              addStepOrGroup(
                paletteData.entity,
                pipelineStage?.stage.spec.execution,
                newStepData,
                paletteData.isParallelNodeClicked,
                paletteData.isRollback
              )
              updatePipeline(pipeline).then(() => {
                updatePipelineView({
                  ...pipelineView,
                  isDrawerOpened: true,
                  drawerData: {
                    type: DrawerTypes.StepConfig,
                    data: {
                      stepConfig: {
                        node: newStepData.step,
                        onUpdate: data?.paletteData?.onUpdate,
                        isStepGroup: false,
                        addOrEdit: 'edit',
                        hiddenAdvancedPanels: data.paletteData?.hiddenAdvancedPanels
                      }
                    }
                  }
                })
              })
              return
            }
            updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
          }}
          onClose={() =>
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: { type: DrawerTypes.AddStep }
            })
          }
        />
      )}
      {/* TODO */}
      {type === DrawerTypes.PipelineVariables && <PipelineVariables />}
      {type === DrawerTypes.Templates && <PipelineTemplates />}
      {type === DrawerTypes.ExecutionStrategy && <ExecutionStrategy selectedStage={selectedStage || {}} />}
      {type === DrawerTypes.PipelineNotifications && <PipelineNotifications />}
      {type === DrawerTypes.FlowControl && <FlowControl />}
      {type === DrawerTypes.FailureStrategy && selectedStageId ? (
        <FailureStrategy
          selectedStage={selectedStage}
          onUpdate={({ failureStrategies }) => {
            const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
            if (pipelineStage && pipelineStage.stage) {
              pipelineStage.stage.failureStrategies = failureStrategies
              updatePipeline(pipeline)
            }
          }}
        />
      ) : null}

      {type === DrawerTypes.SkipCondition && selectedStageId ? (
        <SkipCondition
          selectedStage={selectedStage || {}}
          onUpdate={({ skipCondition }) => {
            const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
            if (pipelineStage && pipelineStage.stage) {
              pipelineStage.stage.skipCondition = skipCondition?.trim()
              updatePipeline(pipeline)
            }
          }}
        />
      ) : null}
      {type === DrawerTypes.ConfigureService && selectedStageId && data?.stepConfig && data?.stepConfig.node && (
        <StepWidget
          initialValues={data.stepConfig.node}
          type={data.stepConfig.node.type}
          factory={stepsFactory}
          onUpdate={item => {
            if (data.stepConfig?.addOrEdit === 'add') {
              const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
              const newServiceData = {
                identifier: item.identifier,
                name: item.name,
                type: StepType.Dependency,
                ...(item.description && { description: item.description }),
                spec: item.spec
              }
              addService(pipelineStage?.stage.spec.serviceDependencies, newServiceData)
              updatePipeline(pipeline)
              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: false,
                drawerData: { type: DrawerTypes.ConfigureService }
              })
              data.stepConfig?.onUpdate?.(newServiceData)
            } else if (data.stepConfig?.addOrEdit === 'edit') {
              const node = data?.stepConfig?.node
              if (node) {
                if (item.identifier) node.identifier = item.identifier
                if (item.name) node.name = item.name
                if (item.description) node.description = item.description
                if (item.spec) node.spec = item.spec

                // Delete values if they were already added and now removed
                if (node.description && !item.description) delete node.description

                updatePipeline(pipeline)
              }
              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: false,
                drawerData: { type: DrawerTypes.ConfigureService }
              })
            }
          }}
        />
      )}
    </Drawer>
  )
}
