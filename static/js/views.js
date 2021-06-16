import { Model } from "./model.js";

// load script id innerHTML with handlebars
function loadPage(htmlId, variables) {
  const str = document.getElementById(htmlId, variables).innerHTML;
  document.getElementById("element").innerHTML = Handlebars.compile(str)(
    variables
  );
}

// render #!/users
function renderUsersPage() {
  // get users from modal
  const users = Model.get_users();
  loadPage("users-details", {
    users: users,
  });
}

// render #!/observations
function renderObservations() {
  // get observations from modal
  const observations = Model.get_observations();
  loadPage("observations-details", {
    observations: observations,
  });
}

// render #!/submit
function renderSubmit() {
  loadPage("submit-form", {});
  // get from data
  document.getElementById("form").addEventListener("submit", (event) => {
    const formData = new FormData(document.querySelector("form"));
    Model.add_observation(formData).then((reason) => {
      // failed reason
      if (reason.status === "failed") {
        document.getElementById("failed-dialog").innerHTML = JSON.stringify(
          reason
        );
        // open failed modal
        document.getElementById("failed-dialog").showModal();
        // wait 1000 ms
        setTimeout(() => {
          document.getElementById("failed-dialog").close();
        }, 1000);
      } else {
        // success -> update from API
        Model.update_observations().then(() => {
          window.location.href = "#!/users/0";
        });
      }
    });
    event.preventDefault();
  });
}

// render single user page
function renderUserPage() {
  const userId = location.hash.split("users/")[1];
  // get observations
  const observations = Model.get_user_observations(parseInt(userId));
  loadPage("user-details", {
    user: Model.get_user(parseInt(userId)),
    observations: observations,
  });
}

// render single observation page
function renderObservationPage() {
  const observationId = location.hash.split("observations/")[1];
  // get one observation
  const observation = Model.get_observation(parseInt(observationId));
  const userId = observation.participant;
  loadPage("observation-details", {
    observation: Model.get_observation(parseInt(observationId)),
    user: Model.get_user(parseInt(userId)),
  });
}

// render default page
function renderDefaultLeaderboardPage() {
  loadPage("default", {
    users: Model.get_leaderboard_users(10),
    observations: Model.get_recent_observations(10),
  });
}

// render main function
function render() {
  if (location.hash == "#!/users") {
    // #!/users
    renderUsersPage();
  } else if (location.hash == "#!/observations") {
    // #!/observations
    renderObservations();
  } else if (location.hash == "#!/submit") {
    // #!/submit
    renderSubmit();
  } else if (location.hash.startsWith("#!/users")) {
    // #!/users/xxx
    renderUserPage();
  } else if (location.hash.startsWith("#!/observations")) {
    // #!/observations/xxx
    renderObservationPage();
  } else {
    // default
    renderDefaultLeaderboardPage();
  }
}

// when trigger location change, rerender the page
// switch the page when url changes
window.addEventListener(
  "hashchange",
  (event) => {
    render();
  },
  false
);

window.addEventListener("load", () => {
  Model.update_observations().then(() => {
    Model.update_users().then(() => {
      render();
    });
  });
});
