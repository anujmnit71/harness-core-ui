/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Container,
  ExpressionAndRuntimeType,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  MultiTypeInputType,
  Utils
} from '@wings-software/uicore'
import { Checkbox } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { useVariablesExpression } from '../../../PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ConditionalExecutionOption } from './ConditionalExecutionPanelUtils'
import { ModeEntityNameMap } from './ConditionalExecutionPanelUtils'
import css from './ConditionalExecutionPanel.module.scss'

interface ConditionalExecutionConditionProps {
  formikProps: FormikProps<ConditionalExecutionOption>
  mode: Modes
  isReadonly: boolean
  enableConfigureOptions?: boolean
}

const MultiTypeMonacoTextFieldFixedTypeComponent = (props: { readonly: boolean; name: string }) => {
  const { expressions } = useVariablesExpression()
  const { readonly, name } = props

  return (
    <Container style={{ flexGrow: 1 }}>
      <MonacoTextField name={name} expressions={expressions} disabled={readonly} />
    </Container>
  )
}

export default function ConditionalExecutionCondition(props: ConditionalExecutionConditionProps): React.ReactElement {
  const { getString } = useStrings()
  const { formikProps, mode, isReadonly, enableConfigureOptions = true } = props

  // Helps to reset the ExpressionAndRuntimeType controlled component when the value is changed due to
  // external factors - example - enable disable toggle
  const [conditionMultiInputResetKey, setConditionMultiInputKey] = React.useState(Utils.randomId())

  const conditionValue = formikProps.values?.condition
  const isDisabled = !formikProps.values.enableJEXL || isReadonly

  const [multiType, setMultiType] = useState<MultiTypeInputType>(getMultiTypeFromValue(conditionValue))

  const expressionAndRuntimeTypeComponent = (
    <ExpressionAndRuntimeType
      key={conditionMultiInputResetKey}
      name={'condition'}
      value={conditionValue}
      fixedTypeComponentProps={{
        readonly: isDisabled,
        name: 'condition'
      }}
      fixedTypeComponent={MultiTypeMonacoTextFieldFixedTypeComponent}
      style={{ flexGrow: 1 }}
      allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
      onChange={val => formikProps.setFieldValue('condition', val)}
      onTypeChange={setMultiType}
    />
  )

  return (
    <>
      <Checkbox
        name="enableJEXL"
        checked={formikProps.values.enableJEXL}
        disabled={isReadonly}
        className={cx(css.blackText, { [css.active]: formikProps.values.enableJEXL })}
        labelElement={
          <span data-tooltip-id="conditionalExecution">
            {getString('pipeline.conditionalExecution.condition', { entity: ModeEntityNameMap[mode] })}
            <HarnessDocTooltip tooltipId="conditionalExecution" useStandAlone={true} />
          </span>
        }
        onChange={e => {
          const isChecked = e.currentTarget.checked
          formikProps.setFieldValue('enableJEXL', isChecked)
          if (!isChecked) {
            // Reset form
            setConditionMultiInputKey(Utils.randomId())
            formikProps.setFieldValue('condition', null)
            setMultiType(MultiTypeInputType.FIXED)
          }
        }}
      />
      <Container
        padding={{ top: 'small', left: 'large' }}
        className={cx(
          { [css.disabled]: isDisabled },
          { [css.conditionInputContainerForMultiTypeFixed]: multiType === MultiTypeInputType.FIXED },
          css.conditionInputContainer
        )}
      >
        {enableConfigureOptions ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {expressionAndRuntimeTypeComponent}
            {multiType === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={conditionValue as string}
                type={getString('string')}
                variableName={'condition'}
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formikProps.setFieldValue('condition', value)}
                isReadonly={isDisabled}
              />
            )}
          </div>
        ) : (
          expressionAndRuntimeTypeComponent
        )}
      </Container>
    </>
  )
}
