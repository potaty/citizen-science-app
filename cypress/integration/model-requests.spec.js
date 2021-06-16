import { Model } from "../../static/js/model.js";
var assert = chai.assert;
/// <reference types="Cypress" />

/*
 * Tests that involve making requests to the server
 * note that the Python server must be running for these
 * tests to work.
 */

describe("Model API Requests", function () {
  before(() => {
    // request main page to set the URL context
    cy.visit("http://localhost:8010/");
  });

  describe("#update_observations", () => {
    it("dispaches a modelUpdated event when the model is updated", (done) => {
      function handler(e) {
        let model = e.detail;
        // event detail should be the model
        expect(model).to.eq(Model);

        let observations = model.get_observations();
        assert.isArray(observations);
        // check some properties
        assert.property(observations[0], "timestamp");
        assert.property(observations[0], "height");
        window.removeEventListener("modelUpdated", handler);
        done();
      }
      window.addEventListener("modelUpdated", handler);

      Model.update_observations();
    });
  });

  describe("#update_users", function () {
    it("should eventually trigger a modelChanged event with updated users", function (done) {
      function handler(e) {
        let model = e.detail;
        // event detail should be the model
        expect(model).to.eq(Model);

        let users = model.get_users();
        assert.isArray(users);
        assert.property(users[0], "first_name");
        assert.property(users[0], "last_name");
        window.removeEventListener("modelUpdated", handler);
        done();
      }
      window.addEventListener("modelUpdated", handler);

      Model.update_users();
    });
  });

  describe("#add_observation", () => {
    it("adds a new observation when the data is good", (done) => {
      const obs = {
        participant: "1",
        temperature: 15,
        weather: "raining",
        wind: "none",
        location: "Marsfield",
        height: 20,
        girth: 1.0,
        leaf_size: "medium",
        leaf_shape: "divided",
        bark_colour: "brown",
        bark_texture: "smooth",
      };
      // convert to a formData instance
      let formData = new FormData();
      for (let key in obs) {
        formData.append(key, obs[key]);
      }
      function handler(e) {
        expect(e.detail.status).to.eq("success");
        const newobs = e.detail.observation;
        expect(newobs.participant).to.eq(obs.participant);
        expect(newobs.id).to.be.above(1);
        window.removeEventListener("observationAdded", handler);
        done();
      }
      window.addEventListener("observationAdded", handler);

      Model.add_observation(formData);
    });

    it("returns errors when the data is bad", (done) => {
      const obs = {
        weather: "raining",
        wind: "none",
        location: "Marsfield",
        height: 20,
        girth: 1.0,
        leaf_size: "medium",
        leaf_shape: "divided",
        bark_colour: "brown",
        bark_texture: "smooth",
      };
      // convert to a formData instance
      let formData = new FormData();
      for (let key in obs) {
        formData.append(key, obs[key]);
      }
      function handler(e) {
        expect(e.detail.status).to.eq("failed");
        const errors = e.detail.errors;
        expect(errors.length).to.eq(2);
        window.removeEventListener("observationAdded", handler);
        done();
      }
      window.addEventListener("observationAdded", handler);

      Model.add_observation(formData);
    });
  });
});
