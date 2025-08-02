/// <reference types="cypress" />

describe("template spec", () => {
  it("should render the bubble Chat Widget", () => {
    cy.visit("http://localhost:5173/");

    cy.get("[aria-label='Open chat']")
      .should("be.visible")
      .and("have.attr", "aria-pressed", "false");

    cy.get("[aria-label='opener-chat']")
      .should("be.visible")
      .and("have.attr", "role", "opener-chat")
      .and("have.attr", "width", "35px")
      .and("have.attr", "height", "35px");
  });

  it("should render the Chat Inteface when the bubble is clicked", () => {
    cy.visit("http://localhost:5173/");

    cy.get("[aria-label='Open chat']").click();

    cy.get("[role='dialog']")
      .should("be.visible")
      .and("have.attr", "aria-modal", "true");
  });

  it("should contain all the elements of the Chat Interface", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[aria-label='Open chat']").click();

    cy.get("[role='dialog']").within(() => {
      cy.get("[role='banner']")
        .should("be.visible")
        .within(() => {
          cy.get("[aria-label='header-title']").contains("AI Assistant");
          cy.get("[aria-label='Powered by information']").contains(
            "Powered by"
          );
          cy.get("[aria-label='service name']")
            .contains("Huggingface")
            .and(
              "have.attr",
              "class",
              "text-xs font-semibold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full"
            );
          cy.get("[aria-label='Close chat']").should("be.visible");
          cy.get("[aria-label='delete messages']").should("be.visible");
        });
    });
    cy.get("[role='dialog']").within(() => {
      cy.get("[role='messages']").within(() => {
        cy.get("[aria-label='message text']")
          .should("be.visible")
          .should(
            "include.text",
            `Hi, I'm an AI assistant. How can I help you today?`
          );
      });
    });

    cy.get("[role='dialog']").within(() => {
      // Form => Input
      cy.get("[aria-label='chat-input']").should("be.visible");
      cy.get("[aria-label='chat-form']").should("be.visible");
      cy.get("[aria-label='send message']").should("be.visible");
    });
  });

  it("should send the  error message when the token or authentications fails", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[aria-label='Open chat']").click();
    cy.get("[aria-label='chat-input']").type("H");
    cy.get("[aria-label='send message']").click();
    cy.intercept(
      "POST",
      "https://router.huggingface.co/hf-inference/models/HuggingFaceTB/SmolLM3-3B/v1/chat/completions",
      {
        statusCode: 401,
        body: {
          error: "Unauthorized",
        },
      }
    ).as("invalidToken");

    cy.get("[aria-label='error message']").should(
      "contain.text",
      "Token expired"
    );
  });

  it("should send the error message when the network fails", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[aria-label='Open chat']").click();
    cy.get("[aria-label='chat-input']").type("H");
    cy.get("[aria-label='send message']").click();
    cy.intercept(
      "POST",
      "https://router.huggingface.co/hf-inference/models/HuggingFaceTB/SmolLM3-3B/v1/chat/completions",
      {
        forceNetworkError: true,
      }
    ).as("networkError");

    cy.get("[aria-label='error message']").should(
      "include.text",
      "Token expired"
    );
  });
  it("should send the erorr message when the user is sending to many request in a short time", () => {
    cy.intercept(
      "POST",
      "https://router.huggingface.co/hf-inference/models/HuggingFaceTB/SmolLM3-3B/v1/chat/completions",
      {
        statusCode: 429,
        body: { error: "Request limit exceeded" },
      }
    ).as("networkError");
    cy.visit("http://localhost:5173/");
    cy.get("[aria-label='Open chat']").click();

    for (let i = 0; i < 5; i++) {
      cy.get("[aria-label='chat-input']").type("H");
      cy.get("[aria-label='send message']").click();
    }

    cy.get("[aria-label='error message']").should(
      "include.text",
      "Token expired"
    );
  });

  it("should close the chat interface when the user clicks outside", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[aria-label='Open chat']").click();
    cy.get("[role='dialog']").should("be.visible");

    cy.get("html").click(10, 10, { force: true });

    cy.get("[role='dialog']").should("not.exist");
  });

  it("should close the chat interface when click on the X button", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[aria-label='Open chat']").click();
    cy.get("[role='dialog']").should("be.visible");
    cy.get("[aria-label='Close chat']").click();
    cy.get("[role='dialog']").should("not.exist");
  });

  it("should place the chat opener icon in the bottom-left corner", () => {
    cy.visit("http://localhost:5173/");

    cy.get('[aria-label="Open chat"]')
      .should("be.visible")
      .then(($el) => {
        const rect = $el[0].getBoundingClientRect();

        // Tolerancia de margen en píxeles (ajústala si usas "bottom-4" = 1rem = 16px)
        expect(rect.left).to.be.lessThan(30); // cerca del borde izquierdo
        expect(window.innerHeight - rect.bottom).to.be.lessThan(30); // cerca del borde inferior
      });
  });

  it("should render a children if is passed", () => {
    cy.visit("http://localhost:5173/");
    cy.get("[aria-label='children']")
      .should("exist")
      .should("be.visible")
      .should("have.class", "bg-blue-500")
      .should("have.class", "text-white")
      .should("have.class", "p-2")
      .should("have.class", "rounded-md");

    cy.get("[aria-label='Open chat']").within(() => {
      cy.get("[aria-label='children']").should("exist").should("be.visible");
    });
  });

  
});
