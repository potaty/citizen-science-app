from bottle import Bottle, static_file, request, response, run, HTTPError
import os
import json

from jsonmodel import JSONModelPlugin

app = Bottle()

def url(path):

    return 'http://' + request.urlparts[1] + path

@app.route('/')
def index():
    """Deliver the index page as a static file"""

    return static_file("index.html", root=os.path.join(os.path.dirname(__file__), "views"))

@app.get('/api/reset', name='reset')
def api_reset(model):
    """If requested, reset the database 
    to ensure that tests are consistent"""

    model.reset()

    return {'status': 'reset'}

@app.get('/api', name='api')
def api_main():

    return {
        'observations': url(app.get_url('observations')),
        'users': url(app.get_url('users'))
    }

@app.get('/api/observations', name='observations')
def list_observations(model):
    """Return a JSON list of observations"""

    obs = model.get_observations()
    response.content_type = "application/json"
    return json.dumps(obs)

@app.get('/api/observations/<id>', name='observation')
def get_observation(model, id):
    """Get an individual observation as JSON"""

    obs = model.get_observation(id)
    if not obs:
        return HTTPError(404, 'Observation not found')
    else:
        return obs

@app.post('/api/observations')
def create_observation(model):
    """Handle POST to create new observation"""

    fields = ['participant', 'temperature', 'weather', 'wind',  
                'height', 'girth', 'location',
                'leaf_size', 'leaf_shape', 'bark_colour', 'bark_texture']
    data = {}
    # copy over form fields to data, don't worry about missing fields,
    # since add_observation will warn about them
    for field in fields:
        if field in request.forms and request.forms.get(field) != "":
            data[field] = request.forms.get(field)

    result = model.add_observation(data)

    return result

@app.get('/api/users', name='users')
def list_users(model):

    users = model.get_users()
    response.content_type = "application/json"
    return json.dumps(users)

@app.get('/api/users/<id>', name='user')
def get_user(model, id):

    user = model.get_user(id)
    if not user:
        return HTTPError(404, 'User not found')
    else:
        response.content_type = "application/json"
        return json.dumps(user)

@app.route('/static/<filename:path>')
def static(filename):
    return static_file(filename=filename, root='static')


if __name__ == '__main__':
    # install the JSONmodel plugin

    # ensure that Javascript files are served with the right Content Type
    # fixes an issue on some Windows machines
    import mimetypes
    if not mimetypes.types_map.get('.jsx'):
        mimetypes.add_type("application/javascript", ".js")

    app.install(JSONModelPlugin("trees.json"))

    run(app=app, debug=True, reloader=True, port=8010)

