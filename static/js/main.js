import { Model } from "./model.js";

function redraw() {
  let content = "<h2>API Test</h2><ul>";
  content += "<li><a href='/api/observations'>List of Observations</a></li>";
  content += "<li><a href='/api/users'>List of Users</a></li>";
  content += "<li><a href='/api/users/1'>Detail of one user</a></li>";
  content +=
    "<li><a href='/api/observations/1'>Detail of one observation</a></li>";
  content += "</ul>";
  // update the page
  document.getElementById("element").innerHTML = content;
}

window.onload = function () {
  redraw();
};
