/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconName } from '@wings-software/uicore'
import cx from 'classnames'
import { Node, NodeType } from '../Node'
import css from '../../Diagram/node/NodeStart/NodeStart.module.scss'
export class EndNode extends Node {
  protected type = NodeType.EndNode
  // constructor(options: NodeInterface) {
  //   super({
  //     identifier: options.identifier,
  //     name: options.name
  //   } as NodeInterface)
  // }
  protected defaultIcon: IconName = 'stop'
  protected secondaryIcon: IconName = 'pipeline'
  protected selectedColour = 'var(--diagram-stop-node)'
  protected unSelectedColour = 'black'
  protected selectedIconColour = 'black'
  protected unSelectedIconColour = 'black'
  render?(): React.ReactElement {
    return (
      <div className={css.defaultNode}>
        <div
          id={NodeType.EndNode.toString()}
          className={cx(css.nodeStart)}
          style={{ backgroundColor: '#f3f3fa', border: '1px solid #b0b1c4' }}
        >
          <div>
            <Icon name={this.defaultIcon} style={{ color: this.selectedColour }} className={css.icon} />
            {/* <div>
            <div style={{ visibility: props.node.isStart ? 'initial' : 'hidden' }}>
              {props.node.getOutPorts().map(generatePort)}
            </div>
            <div style={{ visibility: props.node.isStart ? 'hidden' : 'initial' }}>
              {props.node.getInPorts().map(generatePort)}
            </div>
          </div> */}
          </div>
        </div>
      </div>
    )
  }
}
