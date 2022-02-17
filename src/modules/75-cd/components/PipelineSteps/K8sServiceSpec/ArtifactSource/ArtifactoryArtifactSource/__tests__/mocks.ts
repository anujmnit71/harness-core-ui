/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const artifacts = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'ArtifactoryRegistry',
        spec: {
          connectorRef: '<+input>',
          imagePath: '<+input>',
          repository: '<+input>',
          tag: '<+input>'
        }
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: '<+input>',
      imagePath: '<+input>',
      repository: '<+input>',
      tag: '<+input>'
    },
    type: 'ArtifactoryRegistry'
  }
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'ArtifactoryRegistry',
          spec: {
            connectorRef: '<+input>',
            imagePath: '<+input>',
            repository: '<+input>',
            tag: '<+input>'
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: '<+input>',
        imagePath: '<+input>',
        repository: '<+input>',
        tag: '<+input>'
      },
      type: 'ArtifactoryRegistry'
    }
  }
}
