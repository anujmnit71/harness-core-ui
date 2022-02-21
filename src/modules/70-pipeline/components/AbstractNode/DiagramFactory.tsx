/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { v4 as uuid } from 'uuid'
import { NodeType } from './Node'
import CreateNode from './Nodes/CreateNode/CreateNode'
import DefaultNode from './Nodes/DefaultNode/DefaultNode'
import EndNode from './Nodes/EndNode'
import StartNode from './Nodes/StartNode'
import PipelineGraph from './PipelineGraph/PipelineGraph'
import type { BaseListener, ListenerHandle } from './types'

export class DiagramFactory {
  /**
   * Couples the factory with the nodes it generates
   */
  type = ''
  canCreate = false
  canDelete = false
  nodeBank: Map<string, React.FC>
  listeners: { [id: string]: BaseListener }
  constructor(diagramType: string) {
    this.nodeBank = new Map()
    this.type = diagramType
    this.registerNode(NodeType.Default, DefaultNode)
    this.registerNode(NodeType.StartNode, StartNode)
    this.registerNode(NodeType.CreateNode, CreateNode)
    this.registerNode(NodeType.EndNode, EndNode)
    this.listeners = {}
  }

  getType(): string {
    return this.type
  }

  registerNode(type: string, Component: React.FC): void {
    this.nodeBank.set(type, Component)
  }

  registerListener(listener: BaseListener): ListenerHandle {
    const id = uuid()
    this.listeners[id] = listener
    return {
      id: id,
      listener: listener,
      deregister: () => {
        delete this.listeners[id]
      }
    }
  }
  deregisterListener(listener: BaseListener | ListenerHandle): boolean {
    if (typeof listener === 'object') {
      ;(listener as ListenerHandle).deregister()
      return true
    }
    const handle = this.getListenerHandle(listener)
    if (handle) {
      handle.deregister()
      return true
    }
    return false
  }
  getListenerHandle(listener: BaseListener): ListenerHandle {
    for (const id in this.listeners) {
      if (this.listeners[id] === listener) {
        return {
          id: id,
          listener: listener,
          deregister: () => {
            delete this.listeners[id]
          }
        }
      }
    }
  }
  getNode(type?: string): React.FC<any> | undefined {
    return this.nodeBank.get(type as string)
  }

  deregisterNode(type: string): void {
    const deletedNode = this.nodeBank.get(type)
    if (deletedNode) {
      this.nodeBank.delete(type)
    }
  }

  render(): React.FC<any> {
    const PipelineStudioHOC: React.FC<any> = (props: any): React.ReactElement => (
      <PipelineGraph getNode={this.getNode.bind(this)} {...props} />
    )
    return PipelineStudioHOC
  }
}

const DiagramNodes = {
  [NodeType.Default]: DefaultNode,
  [NodeType.CreateNode]: CreateNode,
  [NodeType.EndNode]: EndNode,
  [NodeType.StartNode]: StartNode
}

export { DiagramNodes, NodeType }
