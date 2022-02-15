/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { ReactElement, JSXElementConstructor } from 'react'
import { Node, NodeType } from '../Node'
export class DefaultNode extends Node {
  protected type = NodeType.Default
  protected identifier = '123'
  protected name = 'DefaultNode'
  protected defaultIcon: IconName = 'pipeline'
  protected secondaryIcon: IconName = 'pipeline'
  protected selectedColour = 'black'
  protected unSelectedColour = 'black'
  protected selectedIconColour = 'black'
  protected unSelectedIconColour = 'black'
  public render(props: any): ReactElement<any, string | JSXElementConstructor<any>> {
    return <div>{props.name}</div>
  }
}
