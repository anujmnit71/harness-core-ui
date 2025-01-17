/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { get } from 'lodash-es'
import { AllowedTypes, Container, ExpressionAndRuntimeType, MultiTypeInputType } from '@harness/uicore'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import multiBtnCss from '@common/components/MultiTypeTextArea/MultiTypeTextArea.module.scss'
import css from './MultiTypeExecutionCondition.module.scss'

interface MultiTypeExecutionConditionProps {
  path: string
  allowableTypes?: AllowedTypes
  isInputDisabled?: boolean
  readonly?: boolean
  multiType?: MultiTypeInputType
  setMultiType?: (multiType: MultiTypeInputType) => void
  expressions: string[]
}

function MultiTypeMonacoTextFieldFixedTypeComponent(props: {
  readonly: boolean
  name: string
  expressions: string[]
}): React.ReactElement {
  const { readonly, name, expressions } = props

  return (
    <Container style={{ flexGrow: 1 }}>
      <MonacoTextField name={name} expressions={expressions} disabled={readonly} />
    </Container>
  )
}

export function MultiTypeExecutionCondition(props: MultiTypeExecutionConditionProps): React.ReactElement {
  const { path, allowableTypes, isInputDisabled, readonly, multiType, setMultiType, expressions } = props
  const formik = useFormikContext()

  const conditionValue = get(formik.values, path)

  return (
    <Container className={cx(css.conditionInputContainer)}>
      <ExpressionAndRuntimeType
        name={path}
        value={conditionValue}
        fixedTypeComponentProps={{
          readonly: !!isInputDisabled,
          name: path,
          expressions: expressions
        }}
        fixedTypeComponent={MultiTypeMonacoTextFieldFixedTypeComponent}
        style={{ flexGrow: 1 }}
        allowableTypes={allowableTypes}
        onChange={val => formik?.setFieldValue(path, val)}
        onTypeChange={setMultiType}
        btnClassName={multiType === MultiTypeInputType.FIXED ? multiBtnCss.multiButtonForFixedType : ''}
        multitypeInputValue={multiType}
        disabled={readonly}
      />
    </Container>
  )
}
