/// <reference types="Cypress" />

describe("Site Pages", function () {
  beforeEach(function () {
    // reset the server database between tests
    cy.request("http://localhost:8010/api/reset");
  });

  describe("Main Page", function () {
    it("successfully loads", function () {
      cy.visit("http://localhost:8010/");
    });

    it("has links to views for observations and users", function () {
      cy.visit("http://localhost:8010/");
      cy.wait(100);
      cy.get("a[href='#!/users']");
      cy.get("a[href='#!/observations']");
      cy.get("a[href='#!/submit']");
    });

    it("contains a list of recent observations", function () {
      cy.visit("http://localhost:8010/");
      cy.wait(100);
      cy.contains("Recent Observations");
      // contains links to the most recent observations, check for a few
      let recent = [166, 121, 1, 177, 228, 159];
      for (let i = 0; i < recent.length; i++) {
        cy.get("a[href='/#!/observations/" + recent[i] + "']");
      }
    });

    it("contains a list of the top 10 users", function () {
      cy.visit("http://localhost:8010/");
      cy.wait(100);

      let topusers = [84, 43, 46, 21, 45, 49, 4, 52, 87, 18];

      for (let i = 0; i < topusers.length; i++) {
        cy.get("a[href='/#!/users/" + topusers[i] + "']");
      }
    });
  });

  describe("Observations page", function () {
    it("successfully loads", function () {
      cy.visit("http://localhost:8010/#!/observations");
    });

    it("contains a list of observations", function () {
      cy.visit("http://localhost:8010/#!/observations");
      cy.wait(100);
      cy.fixture("trees.json").then((json) => {
        for (let i = 0; i < json.observations.length; i++) {
          let observation = json.observations[i];
          cy.get("a[href='/#!/observations/" + observation.id + "']")
            .should("contain", observation.location)
            .should("contain", observation.weather);
        }
      });
    });
  });

  describe("Users page", function () {
    it("successfully loads", function () {
      cy.visit("http://localhost:8010/#!/users");
    });

    it("contains a list of users", function () {
      cy.visit("http://localhost:8010/#!/users");
      cy.wait(100);
      cy.fixture("trees.json").then((json) => {
        for (let i = 0; i < json.users.length; i++) {
          let user = json.users[i];
          cy.get("a[href='/#!/users/" + user.id + "']")
            .should("contain", user.first_name)
            .should("contain", user.last_name);
        }
      });
    });
  });

  describe("Individual User Page", function () {
    it("successfully loads", function () {
      cy.visit("http://localhost:8010/#!/users/1");
    });

    it("contains user details", function () {
      cy.fixture("trees.json").then((json) => {
        // just check 10 user pages
        for (let i = 0; i < 10; i++) {
          let user = json.users[i];

          cy.visit("http://localhost:8010/#!/users/" + user.id);
          cy.wait(100);
          cy.contains(user.first_name);
          cy.contains(user.last_name);
        }
      });
    });

    it("contains a list of user observations", function () {
      cy.fixture("trees.json").then((json) => {
        let userid = 89;
        let expected = [];
        for (let j = 0; j < json.observations.length; j++) {
          if (json.observations[j].participant === userid) {
            expected.push(json.observations[j]);
          }
        }

        cy.visit("http://localhost:8010/#!/users/" + userid);
        cy.wait(100);
        for (let i = 0; i < expected.length; i++) {
          cy.get("a[href='/#!/observations/" + expected[i].id + "']");
        }
      });
    });
  });
});
