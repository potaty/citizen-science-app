/// <reference types="Cypress" />

// form fields that are either inputs or selects
const inputs = ["temperature", "height", "girth", "location"];
const selects = [
  "weather",
  "wind",
  "leaf_size",
  "leaf_shape",
  "bark_colour",
  "bark_texture",
];

describe("Form Submission", function () {
  beforeEach(function () {
    // reset the server database between tests
    cy.request("http://localhost:8010/api/reset");
  });

  it("get the observation submission page", function () {
    cy.visit("http://localhost:8010/#!/submit");
    // page contains a form
    cy.get("form");
  });

  it("has the right fields in the form", function () {
    cy.visit("http://localhost:8010/#!/submit");
    // page contains a form
    cy.get("form").within(function () {
      // and it has all of the required fields

      cy.get('input[name="participant"]');

      for (let i = 0; i < inputs.length; i++) {
        cy.get('input[name="' + inputs[i] + '"]');
      }
      for (let i = 0; i < selects.length; i++) {
        cy.get('select[name="' + selects[i] + '"]');
      }
    });
  });

  it("shows the user view including the new observation when the form is submitted", function () {
    const obs = {
      temperature: 13,
      weather: "sunny",
      wind: "strong",
      location: "Marsfield",
      height: 24,
      girth: 2.85,
      leaf_size: "large",
      leaf_shape: "divided",
      bark_colour: "red",
      bark_texture: "crinkles",
    };

    cy.visit("http://localhost:8010/#!/submit");
    cy.wait(100);

    cy.get('input[name="participant"]').then(($input) => {
      if ($input.attr("type") === "text") {
        cy.get($input).type("0");
      } else {
        cy.get($input).should("have.value", "0");
      }
    });

    for (let i = 0; i < inputs.length; i++) {
      cy.get('input[name="' + inputs[i] + '"]').type(obs[inputs[i]]);
    }

    for (let i = 0; i < selects.length; i++) {
      cy.get('select[name="' + selects[i] + '"]').select(obs[selects[i]]);
    }
    cy.get("form").submit();

    // now check that the page is updated to the observation
    cy.location().should((loc) => {
      expect(loc.hash).to.equal("#!/users/0");
    });
    cy.contains("Bob Bobalooba");
    cy.contains(obs.location);
    cy.contains(obs.weather);
  });

  it("shows the list of errors when an incomplete form is submitted", function () {
    const obs = {
      weather: "sunny",
      wind: "strong",
      height: 24,
      girth: 2.85,
      leaf_size: "large",
      leaf_shape: "divided",
      bark_colour: "red",
      bark_texture: "crinkles",
    };

    cy.visit("http://localhost:8010/#!/submit");
    cy.wait(100);

    cy.get('input[name="participant"]').then(($input) => {
      if ($input.attr("type") === "text") {
        cy.get($input).type("0");
      } else {
        cy.get($input).should("have.value", "0");
      }
    });

    for (let i = 0; i < inputs.length; i++) {
      if (obs[inputs[i]] !== undefined) {
        cy.get('input[name="' + inputs[i] + '"]').type(obs[inputs[i]]);
      }
    }

    for (let i = 0; i < selects.length; i++) {
      cy.get('select[name="' + selects[i] + '"]').select(obs[selects[i]]);
    }
    cy.get("form").submit();

    // now check that the page is updated to the observation
    cy.contains("Missing required field: temperature");
    cy.contains("Missing required field: location");
  });
});
