/// <reference types="cypress" />
/// <reference path="../../cypress/support/component.ts" />

import { Suspense, useMemo } from "react";
import { ChatWidget } from "./ChatWidget";
import { mockData } from "./test/mocks/mocks";

export function ChatWidgetWrapper({ data }: { data: any }) {
  const key = useMemo(() => Date.now(), []); // fuerza un nuevo suspense

  return (
    <Suspense fallback={<div role="loading-chat">Cargando...</div>}>
      <ChatWidget key={key} data={data} />
    </Suspense>
  );
}

describe("<ChatWidget />", () => {
  beforeEach(() => {
    cy.viewport(800, 600); // Opcional, por si el diálogo se oculta por tamaño
  });

  it("should render defualt opener if the children is not passed", () => {
    cy.mount(<ChatWidget data={mockData} />);

    cy.get("[data-cy='default-opener'").should("exist").should("be.visible");
    cy.get("[data-testid='open-chat-children']").should("not.exist");
  });

  it("should render children if is passed", () => {
    cy.mount(
      <ChatWidget data={mockData}>
        <div>Hello</div>
      </ChatWidget>
    );

    cy.get("[data-cy='default-opener']").should("not.exist");
    cy.get("[data-testid='open-chat-children']")
      .should("exist")
      .should("be.visible");
    cy.get("[data-testid='open-chat-children']").should("contain", "Hello");
  });

  it("should not render children if is not valid", () => {
    cy.mount(
      <ChatWidget data={mockData}>
        <div>Hello</div>
        <div>Hello</div>
      </ChatWidget>
    );
    cy.get("[data-cy='default-opener']").should("exist").should("be.visible");
    cy.get("[data-testid='open-chat-children']").should("not.exist");
  });
  it("should not render children if is not valid", () => {
    cy.mount(
      <ChatWidget data={mockData}>hello this is not a valid element</ChatWidget>
    );
    cy.get("[data-cy='default-opener']").should("exist").should("be.visible");
    cy.get("[data-testid='open-chat-children']").should("not.exist");
  });

  it("should open the chatInterface with default opener", () => {
    cy.mount(<ChatWidget data={mockData} />);
    cy.get("[data-cy='default-opener']").should("exist").should("be.visible");
    cy.get("[role='opener-chat']").click();
    cy.get("[role='dialog']").should("be.visible");
  });

  it("should be able to open the chatInterface with custom opener", () => {
    cy.mount(
      <ChatWidget data={mockData}>
        <div>Hello</div>
      </ChatWidget>
    );

    cy.get("[data-cy='default-opener']").should("not.exist");
    cy.get("[data-testid='open-chat-children']")
      .should("exist")
      .should("be.visible");

    cy.get("[data-testid='open-chat-children']").should("contain", "Hello");
    cy.get("[data-testid='open-chat-children']").click();
    cy.get("[role='dialog']").should("be.visible");
  });

  it("should render the default loader when the chatInterface is loading", () => {
    cy.mount(<ChatWidgetWrapper data={mockData} />);
    cy.get("[data-cy='default-opener']").should("exist").should("be.visible");
    cy.get("[role='opener-chat']").click();
    cy.get("[role='loading-chat']").should("be.visible");
    cy.get("[role='dialog']").should("be.visible");
  });

  it("should render the Loader in default opener when the chatInterface is loading", () => {
    const Loader = () => {
      return <div role="loading-chat">Loading</div>;
    };

    cy.mount(<ChatWidget data={mockData} Loader={<Loader></Loader>} />);
    cy.get("[data-cy='default-opener']").should("exist").should("be.visible");
    cy.get("[role='opener-chat']").click();
    cy.get("[role='loading-chat']")
      .should("be.visible")
      .should("contain", "Loading");
    cy.get("[role='dialog']").should("not.exist");
  });

  it("should render the default loader in children when the chatInterface is loading", () => {
    cy.mount(
      <ChatWidget data={mockData}>
        <div>Hello</div>
      </ChatWidget>
    );

    cy.get("[data-cy='default-opener']").should("not.exist");
    cy.get("[data-testid='open-chat-children']")
      .should("exist")
      .should("be.visible");
    cy.get("[data-testid='open-chat-children']").should("contain", "Hello");
    cy.get("[data-testid='open-chat-children']").click();
    cy.get("[role='loading-chat']").should("be.visible");
    cy.get("[role='dialog']").should("be.visible");
  });

  it("should render the Loader in children when the chatInterface is loading", () => {
    const Loader = () => {
      return <div role="loading-chat">Loading</div>;
    };
    cy.mount(
      <ChatWidget data={mockData} Loader={<Loader></Loader>}>
        <div>Hello</div>
      </ChatWidget>
    );

    cy.get("[data-cy='default-opener']").should("not.exist");
    cy.get("[data-testid='open-chat-children']")
      .should("exist")
      .should("be.visible");
    cy.get("[data-testid='open-chat-children']").should("contain", "Hello");
    cy.get("[data-testid='open-chat-children']").click();
    cy.get("[role='loading-chat']")
      .should("be.visible")
      .should("contain", "Loading");
    cy.get("[role='dialog']").should("exist");
  });

  it("should render the initial questions", () => {
    cy.mount(
      <ChatWidget
        huggingface="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"
        data={mockData}
        initialQuestions={[{ question: "Hello" }]}
      />
    );
    cy.get("[data-cy='default-opener']").should("exist").should("be.visible");
    cy.get("[role='opener-chat']").click();
    cy.get("[role='dialog']").should("be.visible");
    cy.get("[role='dialog']").within(() => {
      cy.get("[aria-label='initial-questions']").should("be.visible");
      cy.get("[aria-label='initial-questions']").within(() => {
        cy.get("[role='listitem']").should("have.length", 1);
        cy.get("[role='listitem']").first().should("contain", "Hello");
      });
    });
  });

  it("should not render the initial questions if they are not passed", () => {
    cy.mount(
      <ChatWidget
        huggingface="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"
        data={mockData}
      />
    );
    cy.get("[data-cy='default-opener']").should("exist").should("be.visible");
    cy.get("[role='opener-chat']").click();
    cy.get("[role='dialog']").should("be.visible");
    cy.get("[role='dialog']").within(() => {
      cy.get("[aria-label='initial-questions']").should("not.exist");
    });
  });

  it.only("should call the onSendMessage function when we click on one of the initial questions", () => {
    cy.mount(
      <ChatWidget
        huggingface="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"
        data={mockData}
        initialQuestions={[{ question: "Hello" }]}
      />
    );
    cy.get("[data-cy='default-opener']").should("exist").should("be.visible");
    cy.get("[role='opener-chat']").click();
    cy.get("[role='dialog']").should("be.visible");
    cy.get("[role='dialog']").within(() => {
      cy.get("[aria-label='initial-questions']").within(() => {
        cy.get("[role='listitem']").first().click();
      });
    });

    cy.get("[aria-label='initial-questions']").should("not.exist");
    cy.get("[role='messages']").within(() => {
      cy.get("[aria-label='message text']").should("have.length", 2);
      cy.get("[aria-label='message text']")
        .last()
        .should("contain.text", "Hello");
    });
  });
});
