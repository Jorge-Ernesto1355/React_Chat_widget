// cypress/support/index.d.ts

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Comando para verificar el banner del chat
     */
    checkBanner(): Chainable<void>;
    checkMessages(): Chainable<void>;
  }
}
