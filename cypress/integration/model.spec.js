import {Model} from '../../static/js/model.js';
var assert = chai.assert;
/// <reference types="Cypress" />

describe('Model', function(){

    beforeEach(() => {
        cy.fixture('trees.json').then((json) => {
            Model.set_observations(json.observations);
            Model.set_users(json.users);
        })
    }),

    describe("#get_observations", function(){
        it("get_observations method returns the list of observations", function(){
            let observations = Model.get_observations();
            assert.isArray(observations);
            // check some properties
            assert.property(observations[0], "timestamp");
            assert.property(observations[0], "height");

            cy.fixture('trees.json').then((json) => {
                expect(observations.length).to.equal(json.observations.length);
                expect(observations).to.deep.equal(json.observations);  // same array entries
            })
        });
    });


    describe("#get_users", function(){
        it("returns the list of users", function(){
            let users = Model.get_users();
            assert.isArray(users);
            assert.property(users[0], "first_name");
            assert.property(users[0], "last_name");
            // order of users is not defined so we can't check who's on first
        });
    });


    describe("#get_user", function() {
        it("returns the details of a single user", () =>{
            let user = Model.get_user(0);
            expect(user.first_name).to.equal("Bob");
            expect(user.last_name).to.equal("Bobalooba");
        });

        it("returns null when the user doesn't exist", () => {
            let user = Model.get_user(999);
            expect(user).to.be.null;
        });
    });


    describe("#get_user_observations", function(){
        it("should return just the observations for one user", function(){
            // expected number of observations per user

            cy.fixture('trees.json').then((json) => {

                for (let userid=0; userid<10; userid++) { 
                    let expected_count = 0;
                    for (let j=0; j<json.observations.length; j++) {
                        if (json.observations[j].participant === userid) {
                            expected_count = expected_count + 1;
                        }
                    } 

                    let obs = Model.get_user_observations(userid);
                    expect(obs.length).to.equal(expected_count);
                    for (let i=0; i<obs.length; i++) {
                        expect(obs[i].participant).to.equal(userid);
                    }
                }
            });
        });

        it("should return just the observations ordered by timestamp", function(){
            for (let userid=0; userid<10; userid++) {
                let obs = Model.get_user_observations(userid);
                // observations should be ordered if there is more than one of them
                if (obs.length > 1) {
                    let lasttime = new Date(obs[0].timestamp);
                    for(let i=1; i<obs.length; i++) {
                        let thistime = new Date(obs[i].timestamp);
                        expect(thistime).to.be.below(lasttime)
                        lasttime = thistime;
                    }
                }
            }
        });
    });


    describe("#get_recent_observations", function(){
        it("should return N observations ordered by timestamp", function(){

            for(let N=3; N<10; N++) {
                let obs = Model.get_recent_observations(N);
                expect(obs.length).to.equal(N);
                let lasttime = new Date(obs[0].timestamp);
                for(let i=1; i<obs.length; i++) {
                    let thistime = new Date(obs[i].timestamp);
                    expect(thistime).to.be.below(lasttime)
                    lasttime = thistime;
                }
            
            }
        });
    });

});