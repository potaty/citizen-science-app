export { Model };

/*
 * Model class to support the Citizen Science application
 * this class provides an interface to the web API and a local
 * store of data that the application can refer to.
 * The API generates two different events:
 *   "modelChanged" event when new data has been retrieved from the API
 *   "observationAdded" event when a request to add a new observation returns
 */

const Model = {
  observations_url: "/api/observations",
  users_url: "/api/users",

  // this will hold the data stored in the model
  data: {
    observations: [],
    users: [],
  },

  // update_users - retrieve the latest list of users
  //    from the server API
  // when the request is resolved, creates a "modelUpdated" event
  // with the model as the event detail
  update_users() {
    return fetch("http://localhost:8010/api/users", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((users) => {
        // change event
        if (JSON.stringify(this.data.users) !== JSON.stringify(users)) {
          const event = new CustomEvent("modelChanged", {
            detail: this,
          });
          window.dispatchEvent(event);
        }
        // save
        this.data.users = users;

        // update event
        const event = new CustomEvent("modelUpdated", {
          detail: this,
        });
        window.dispatchEvent(event);
        return Promise.resolve(users);
      })
      .catch((reason) => {
        return Promise.reject(reason);
      });
  },

  // update_observations - retrieve the latest list of observations
  //   from the server API
  // when the request is resolved, creates a "modelUpdated" event
  // with the model as the event detail
  update_observations() {
    return fetch("http://localhost:8010/api/observations", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((observations) => {
        // events
        if (
          JSON.stringify(this.data.observations) !==
          JSON.stringify(observations)
        ) {
          // change event
          const event = new CustomEvent("modelChanged", {
            detail: this,
          });
          window.dispatchEvent(event);
        }
        // save
        observations.sort(function (x, y) {
          return new Date(x.timestamp) - new Date(y.timestamp);
        });

        // update event
        this.data.observations = observations;
        const event = new CustomEvent("modelUpdated", {
          detail: this,
        });
        window.dispatchEvent(event);
        return Promise.resolve(observations);
      })
      .catch((reason) => {
        return Promise.reject(reason);
      });
  },

  // get_observations - return an array of observation objects
  get_observations: function () {
    return this.data.observations;
  },

  // get_observation - return a single observation given its id
  get_observation: function (observationid) {
    for (var index in this.data.observations) {
      if (this.data.observations[index]["id"] === observationid) {
        return this.data.observations[index];
      }
    }
    return null;
  },

  // set_observations - set the data observation
  set_observations: function (observations) {
    this.data.observations = observations;
  },

  // add_observation - add a new observation by submitting a request
  //   to the server API
  //   formdata is a FormData object containing all fields in the observation object
  // when the request is resolved, creates an "observationAdded" event
  //  with the response from the server as the detail
  add_observation: function (formdata) {
    return fetch("http://localhost:8010/api/observations", {
      method: "POST",
      body: formdata,
    })
      .then((response) => response.json())
      .then((reason) => {
        // update event
        const eventUpdate = new CustomEvent("modelUpdated", {
          detail: reason,
        });
        window.dispatchEvent(eventUpdate);

        // add observation event
        const event = new CustomEvent("observationAdded", {
          detail: reason,
        });
        window.dispatchEvent(event);

        // resolve the reason
        return Promise.resolve(reason);
      })
      .catch((reason) => {
        // error
        return Promise.reject(reason);
      });
  },

  // get_user_observations - return just the observations for
  //   one user as an array
  get_user_observations: function (userid) {
    var observations_list = [];
    for (var index in this.data.observations) {
      // compare with same type
      if (
        parseInt(this.data.observations[index]["participant"]) ===
        parseInt(userid)
      ) {
        observations_list.push(this.data.observations[index]);
      }
    }
    // sort by time
    observations_list.sort(function (x, y) {
      return new Date(y.timestamp) - new Date(x.timestamp);
    });
    return observations_list;
  },

  // get_recent_observations - return the N most recent
  //  observations, ordered by timestamp, most recent first
  get_recent_observations: function (N) {
    var observations = this.data.observations;
    observations.sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    return observations.slice(0, N);
  },

  /*
   * Users
   */
  // get_users - return the array of users
  get_users: function () {
    return this.data.users;
  },

  // get_leaderboard_users - return the top N record count users
  get_leaderboard_users: function (N) {
    const ret = JSON.parse(JSON.stringify(this.data.users));
    // add observation count into user as len
    ret.map((user) => {
      user.len = this.get_user_observations(user.id).length;
    });
    // sort the user by length of his/her observation count
    ret.sort((a, b) => {
      return b.len - a.len;
    });
    return ret.slice(0, N);
  },

  // set_users - set the array of users
  set_users: function (users) {
    this.data.users = users;
  },

  // get_user - return the details of a single user given
  //    the user id
  get_user: function (userid) {
    for (var index in this.data.users) {
      if (this.data.users[index]["id"] === userid) {
        return this.data.users[index];
      }
    }
    return null;
  },
};
