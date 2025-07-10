/* eslint-disable no-undef */
import React from "react";
<reference types="cypress" />

/*
    PATH:
    1. uploads pdf
    2. pdf renders
    3. dismiss tooltips
    4. zoom in and out of pdf
    5. highlight text in pdf
    6. sidebar and input renders
    7. dismiss tooltips
    8. add a new pdf
    9. image snip in pdf
    10. sidebar and input renders
    11. enter history page
    12. revisit old pdf
*/

describe('PDF Upload and Interaction Flow', () => {
    // Necessary for handling fetch requests as cypress only handles frontend functionality
    // catches requests being called through user flow and inputs pre made data
    beforeEach(() => {
      cy.intercept('POST', '/upload-PDF', {
        statusCode: 200,
        body: { success: true, message: 'test' },
      }).as('uploadFile');

      cy.intercept('GET', '/retrieve_history/*', {
        statusCode: 404,
        body: { error: 'test' },
      });

      cy.intercept('GET', `/get-pdf/${encodeURIComponent('sample.pdf')}`, {
        statusCode: 200,
        fixture: 'sample.pdf',
        headers: { 'Content-Type': 'application/pdf' }
      }).as('getPdfBlob');
  
      cy.intercept('POST', '/upload_history/*', {
        statusCode: 200,
        body: { success: true, message: 'test' },
      });

      cy.intercept('POST', '/user_id', {
        statusCode: 200,
        body: { userId: '1', message: 'test' }
      });
  
      cy.intercept('POST', '/explain-highlight', (req) => {
        req.reply({
          statusCode: 200,
          body: { explanation: 'test' },
        });
      }).as('explainHighlight');
    });
  
    it('PDF Upload, tutorial, zoom buttons, highlighting, sidebar, mode buttons, add new button', () => {
      cy.visit('/');
      cy.get('[data-testid="dropzone"]').should('be.visible');

      cy.get('[data-testid="dropzone"] button').should('contain.text', 'Choose PDF File');
  
      cy.get('[data-testid="dropzone"] input[type="file"]').selectFile('cypress/fixtures/sample.pdf', {
        action: 'drag-drop',
        force: true
      });
  
      cy.wait('@uploadFile').its('response.statusCode').should('eq', 200);
      cy.get('[data-testid="dropzone"]').should('not.exist');

      cy.get('button').contains('Dismiss').click();
      cy.get('[data-testid="zoom-in-button"]').should('be.visible').and('be.enabled').click();
      cy.get('[data-testid="zoom-out-button"]').should('be.visible').and('be.enabled').click();
  
      cy.get('body')
        .trigger('mousedown', { button: 0, clientX: 299, clientY: 299 }).wait(1000)
        .trigger('mousemove', { clientX: 501, clientY: 201 }).wait(1000)
        .trigger('mouseup', { force: false });

      cy.get('[aria-label="confirm highlight"]', { timeout: 10000 })
        .should('be.visible')
        .click();

      cy.get('button').contains('Dismiss').click();

      cy.wait('@explainHighlight').its('response.statusCode').should('eq', 200);  

      cy.get('button').contains('Definition').should('be.visible');
      cy.get('button').contains('Real world analogy').should('be.visible').click();
      cy.get('button').contains('ELI5').should('be.visible').click();

      cy.get('[data-testid="snip"]').should('be.visible').and('be.enabled').click();

      cy.get('body')
        .trigger('mousedown', { button: 0, clientX: 299, clientY: 299 }).wait(1000)
        .trigger('mousemove', { clientX: 501, clientY: 201 }).wait(1000)
        .trigger('mouseup', { force: false });

      cy.get('[aria-label="confirm highlight"]', { timeout: 10000 })
        .should('be.visible')
        .click();

      cy.wait('@explainHighlight').its('response.statusCode').should('eq', 200);  

      cy.get('[aria-label="Add New"]').should('be.visible').click();
      cy.get('[data-testid="dropzone"]').should('be.visible');
    });
    
    it('history page into previous pdf', () => {
        cy.get('[aria-label="View History"]').should('be.visible').click();
    
        cy.get('p').contains('sample.pdf').should('be.visible').click();

        cy.wait('@getPdfBlob').its('response.statusCode').should('eq', 200);
        
        cy.get('button').contains('Definition').should('be.visible');
        cy.get('button').contains('Real world analogy').should('be.visible');
        cy.get('button').contains('ELI5').should('be.visible');
      });
  });