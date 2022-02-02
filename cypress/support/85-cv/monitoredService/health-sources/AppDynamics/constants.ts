export const applicationCall =
  '/cv/api/appdynamics/applications?routingId=accountId&accountId=accountId&connectorIdentifier=appdtest&orgIdentifier=default&projectIdentifier=project1&offset=0&pageSize=10000&filter='
export const applicationsResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 7,
    pageItemCount: 7,
    pageSize: 10000,
    content: [
      { name: 'Harness-CI-Manager', id: 1012310 },
      { name: 'Harness-Dev', id: 1012313 },
      { name: 'PR-azure-nc-webapp', id: 1012315 },
      { name: 'PR-azure-nc-webapp-ff-disabled', id: 1013071 },
      { name: 'cv-app', id: 7596 },
      { name: 'cv-app-ng', id: 343254 },
      { name: 'delegate-app-monitoring', id: 1012314 }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'a3c8c50f-4e61-43ac-b535-55a5aa444f7a'
}

export const metricPackCall =
  '/cv/api/metric-pack?routingId=accountId&accountId=accountId&orgIdentifier=default&projectIdentifier=project1&dataSourceType=APP_DYNAMICS'
export const metricPackResponse = {
  metaData: {},
  resource: [
    {
      uuid: 'hv4kpBDuStagUvs8aw659A',
      accountId: 'zEaak-FLS425IEO7OLzMUg',
      orgIdentifier: 'default',
      projectIdentifier: 'TestHealth',
      dataSourceType: 'APP_DYNAMICS',
      identifier: 'Errors',
      category: 'Errors',
      metrics: [
        {
          name: 'Number of Errors',
          type: 'ERROR',
          path: 'Errors|__tier_name__|__metric_filter__|Number of Errors',
          validationPath: 'Overall Application Performance|__tier_name__|Exceptions per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        }
      ],
      thresholds: null
    },
    {
      uuid: '4Q0ZtbHoQY2KtIxVmMJ_9Q',
      accountId: 'zEaak-FLS425IEO7OLzMUg',
      orgIdentifier: 'default',
      projectIdentifier: 'TestHealth',
      dataSourceType: 'APP_DYNAMICS',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        {
          name: 'Average Wait Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Wait Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Errors per Minute',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Errors per Minute',
          validationPath: 'Overall Application Performance|__tier_name__|Errors per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Calls per Minute',
          type: 'THROUGHPUT',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Calls per Minute',
          validationPath: 'Overall Application Performance|__tier_name__|Calls per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Number of Very Slow Calls',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Number of Very Slow Calls',
          validationPath: 'Overall Application Performance|__tier_name__|Number of Very Slow Calls',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: '95th Percentile Response Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|95th Percentile Response Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Average CPU Used (ms)',
          type: 'INFRA',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average CPU Used (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Normal Average Response Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Normal Average Response Time (ms)',
          validationPath: 'Overall Application Performance|__tier_name__|Normal Average Response Time (ms)',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Stall Count',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Stall Count',
          validationPath: 'Overall Application Performance|__tier_name__|Stall Count',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Average Response Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Response Time (ms)',
          validationPath: 'Overall Application Performance|__tier_name__|Average Response Time (ms)',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Number of Slow Calls',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Number of Slow Calls',
          validationPath: 'Overall Application Performance|__tier_name__|Number of Slow Calls',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Average Block Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Block Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        }
      ],
      thresholds: null
    }
  ],
  responseMessages: []
}

export const tiersCall =
  '/cv/api/appdynamics/tiers?routingId=accountId&appName=cv-app&accountId=accountId&connectorIdentifier=appdtest&orgIdentifier=default&projectIdentifier=project1&offset=0&pageSize=10000'
export const tiersResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 10000,
    content: [
      { id: 1415279, name: 'docker-tier' },
      { id: 1130884, name: 'ng-docker-tier' },
      { id: 1495100, name: 'python-tier' }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'c32f423f-f163-49d7-a812-94bfcf7f71a8'
}
