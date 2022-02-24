import {
  monitoresServices,
  serviceEnvironmentNoMonitoredServicesResponse
} from '../../support/85-cv/verifyStep/constants'

describe('Verify step add', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.login('test', 'test')

    cy.visitVerifyStepInPipeline()
    cy.fillName('testPipeline_Cypress')
    cy.get('[type="submit"]').click()
  })

  it('should check verify step add inputs are correct as given', () => {
    cy.verifyStepInitialSetup()

    cy.wait('@service')

    // service definition
    cy.wait(1000)
    cy.get('input[name="serviceRef"]').click({ force: true })
    cy.contains('p', 'testService').click({ force: true })

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.wait(1000)
    cy.get('input[name="environmentRef"]').click({ force: true })
    cy.contains('p', 'testEnv').click({ force: true })
    cy.wait(1000)

    cy.verifyStepSelectConnector()

    cy.wait(1000)

    cy.verifyStepSelectStrategyAndVerifyStep()
    cy.wait('@monitoredServices')

    cy.get("input[name='spec.monitoredServiceRef']").should('have.value', 'appd_prod')
    cy.get("input[name='spec.monitoredServiceRef']").should('be.disabled')
    cy.findByText(/^Health Sources$/i).should('exist')
    cy.findByTestId(/healthSourceTable_appd-test/i).should('exist')

    cy.fillName('test_verify')

    cy.get('input[name="spec.type"]').click({ force: true })
    cy.contains('p', 'Rolling Update').click({ force: true })
    cy.get('input[name="spec.spec.sensitivity"]').click({ force: true })
    cy.contains('p', 'High').click({ force: true })
    cy.get('input[name="spec.spec.duration"]').click({ force: true })
    cy.contains('p', '5 min').click({ force: true })

    cy.findByRole('button', { name: /Apply Changes/i }).click()

    cy.wait(2000)

    cy.findByRole('button', { name: /^Save$/i }).click({ force: true })

    cy.wait(500)

    cy.findByText('Pipeline published successfully').should('be.visible')

    cy.wait('@pipelineSave').then(interception => {
      expect(interception.request.body).includes('type: Verify')
      expect(interception.request.body).includes('sensitivity: HIGH')
      expect(interception.request.body).includes('duration: 5m')
      expect(interception.request.body).includes('deploymentTag: <+serviceConfig.artifacts.primary.tag>')
      expect(interception.request.body).includes('timeout: 2h')
    })
  })

  it('should show button to create monitored serices, if no monitoired services is present', () => {
    cy.verifyStepInitialSetup()
    cy.intercept('GET', monitoresServices, serviceEnvironmentNoMonitoredServicesResponse).as('noMonitoredServices')

    cy.wait('@service')

    // service definition
    cy.wait(1000)
    cy.get('input[name="serviceRef"]').click({ force: true })
    cy.contains('p', 'testService').click({ force: true })

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.wait(1000)
    cy.get('input[name="environmentRef"]').click({ force: true })
    cy.contains('p', 'testEnv').click({ force: true })
    cy.wait(1000)

    cy.verifyStepSelectConnector()

    cy.fillField('namespace', 'verify-step')
    cy.wait(1000)

    cy.verifyStepSelectStrategyAndVerifyStep()
    cy.wait('@noMonitoredServices')

    cy.findByRole('button', { name: /Click to autocreate a monitored service/i }).should('exist')
    cy.findByText(/^Health Sources$/i).should('not.exist')
  })

  it('should show monitored service as runtime input, if service and environment is given as runtime', () => {
    cy.verifyStepInitialSetup()
    cy.intercept('GET', monitoresServices, serviceEnvironmentNoMonitoredServicesResponse).as('noMonitoredServices')

    cy.wait('@service')

    // service definition
    cy.wait(1000)
    cy.verifyStepChooseRuntimeInput()

    cy.wait(500)

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.wait(1000)
    cy.verifyStepChooseRuntimeInput()
    cy.wait(500)

    cy.verifyStepSelectConnector()
    cy.wait(1000)

    cy.verifyStepSelectStrategyAndVerifyStep()

    cy.findByRole('button', { name: /Click to autocreate a monitored service/i }).should('not.exist')
    cy.findByText(/^Health Sources$/i).should('not.exist')
    cy.get("input[name='spec.monitoredServiceRef']").should('have.value', '<+input>')
  })

  it('should show monitored service as runtime input, if service is runtime and environment is fixed value', () => {
    cy.verifyStepInitialSetup()

    cy.intercept('GET', monitoresServices, serviceEnvironmentNoMonitoredServicesResponse).as('noMonitoredServices')

    cy.wait('@service')

    // service definition
    cy.wait(1000)
    cy.verifyStepChooseRuntimeInput()
    cy.wait(500)

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.wait(1000)
    cy.get('input[name="environmentRef"]').click({ force: true })
    cy.contains('p', 'testEnv').click({ force: true })
    cy.wait(500)

    cy.verifyStepSelectConnector()

    cy.wait(1000)

    cy.verifyStepSelectStrategyAndVerifyStep()

    cy.findByRole('button', { name: /Click to autocreate a monitored service/i }).should('not.exist')
    cy.findByText(/^Health Sources$/i).should('not.exist')
    cy.get("input[name='spec.monitoredServiceRef']").should('have.value', '<+input>')
  })

  it('should show monitored service as runtime input, if service is fixed and environment is runtime value', () => {
    cy.verifyStepInitialSetup()

    cy.intercept('GET', monitoresServices, serviceEnvironmentNoMonitoredServicesResponse).as('noMonitoredServices')

    cy.wait('@service')

    // service definition
    cy.wait(1000)
    cy.get('input[name="serviceRef"]').click({ force: true })
    cy.contains('p', 'testService').click({ force: true })
    cy.wait(500)

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.wait(1000)
    cy.verifyStepChooseRuntimeInput()
    cy.wait(500)

    cy.verifyStepSelectConnector()

    cy.wait(500)

    cy.verifyStepSelectStrategyAndVerifyStep()

    cy.findByRole('button', { name: /Click to autocreate a monitored service/i }).should('not.exist')
    cy.findByText(/^Health Sources$/i).should('not.exist')
    cy.get("input[name='spec.monitoredServiceRef']").should('have.value', '<+input>')
  })

  it('should show monitored service as <+service.identifier>_<+enviroment.identifier>, if service is fixed and environment is expression value', () => {
    cy.verifyStepInitialSetup()

    cy.intercept('GET', monitoresServices, serviceEnvironmentNoMonitoredServicesResponse).as('noMonitoredServices')

    cy.wait('@service')

    // service definition
    cy.wait(1000)
    cy.get('input[name="serviceRef"]').click({ force: true })
    cy.contains('p', 'testService').click({ force: true })
    cy.wait(500)

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.wait(1000)
    cy.get('.MultiTypeInput--FIXED').click()
    cy.findByText('Expression').click()
    cy.get('input[name="environmentRef"]').clear().type('<+pipeline>')
    cy.wait(500)

    cy.verifyStepSelectConnector()

    cy.wait(500)

    cy.verifyStepSelectStrategyAndVerifyStep()

    cy.findByRole('button', { name: /Click to autocreate a monitored service/i }).should('not.exist')
    cy.findByText(/^Health Sources$/i).should('not.exist')
    cy.get("input[name='spec.monitoredServiceRef']").should(
      'have.value',
      '<+service.identifier>_<+enviroment.identifier>'
    )
  })

  it('should show monitored service as <+service.identifier>_<+enviroment.identifier>, if service is expression and environment is fixed value', () => {
    cy.verifyStepInitialSetup()

    cy.intercept('GET', monitoresServices, serviceEnvironmentNoMonitoredServicesResponse).as('noMonitoredServices')

    cy.wait('@service')

    // service definition
    cy.wait(1000)
    cy.get('.MultiTypeInput--FIXED').click()
    cy.findByText('Expression').click()
    cy.get('input[name="serviceRef"]').clear().type('<+pipeline>')

    cy.wait(500)

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.wait(1000)
    cy.get('input[name="environmentRef"]').click({ force: true })
    cy.contains('p', 'testEnv').click({ force: true })
    cy.wait(500)

    cy.verifyStepSelectConnector()

    cy.wait(500)

    cy.verifyStepSelectStrategyAndVerifyStep()

    cy.findByRole('button', { name: /Click to autocreate a monitored service/i }).should('not.exist')
    cy.findByText(/^Health Sources$/i).should('not.exist')
    cy.get("input[name='spec.monitoredServiceRef']").should(
      'have.value',
      '<+service.identifier>_<+enviroment.identifier>'
    )
  })

  it('should show monitored service as <+service.identifier>_<+enviroment.identifier>, if service and environment are expression', () => {
    cy.verifyStepInitialSetup()

    cy.intercept('GET', monitoresServices, serviceEnvironmentNoMonitoredServicesResponse).as('noMonitoredServices')

    cy.wait('@service')

    // service definition
    cy.wait(1000)
    cy.get('.MultiTypeInput--FIXED').click()
    cy.findByText('Expression').click()
    cy.get('input[name="serviceRef"]').clear().type('<+pipeline>')

    cy.wait(500)

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.wait(1000)
    cy.get('.MultiTypeInput--FIXED').click()
    cy.findByText('Expression').click()
    cy.get('input[name="environmentRef"]').clear().type('<+pipeline>')
    cy.wait(500)

    cy.verifyStepSelectConnector()

    cy.wait(500)

    cy.verifyStepSelectStrategyAndVerifyStep()

    cy.findByRole('button', { name: /Click to autocreate a monitored service/i }).should('not.exist')
    cy.findByText(/^Health Sources$/i).should('not.exist')
    cy.get("input[name='spec.monitoredServiceRef']").should(
      'have.value',
      '<+service.identifier>_<+enviroment.identifier>'
    )
  })

  it('should show required fields message, if service and environment values are not filled', () => {
    cy.verifyStepInitialSetup()

    cy.wait('@service')

    // service definition
    cy.wait(1000)

    cy.contains('span', 'Infrastructure').click({ force: true })

    cy.findByText('Service is required').should('exist')

    cy.get('input[name="serviceRef"]').click({ force: true })
    cy.contains('p', 'testService').click({ force: true })

    cy.findByText('Service is required').should('not.exist')

    cy.wait(500)

    // Infrastructure definition
    cy.contains('span', 'Infrastructure').click({ force: true })
    cy.wait(500)
    cy.findByTestId('execution').click()

    cy.findByText('Environment is required').should('exist')

    cy.get('input[name="environmentRef"]').click({ force: true })
    cy.contains('p', 'testEnv').click({ force: true })

    cy.findByText('Environment is required').should('not.exist')
  })
})
