import json
from bottle import PluginError
import inspect
import datetime

class JSONModelPlugin:

    name = "jsonmodel"
    api = 2

    def __init__(self, jsonfile):
        self.jsonfile = jsonfile
        self.model = Model(self.jsonfile)
    
    def setup(self, app):

         for other in app.plugins:
            if not isinstance(other, JSONModelPlugin): continue
            if other.keyword == self.keyword:
                raise PluginError("Found another JSONmodel plugin with "\
                "conflicting settings (non-unique keyword).")


    def apply(self, callback, context):

        # Test if the original callback accepts a 'model' keyword.
        # Ignore it if it does not need a database handle.
        args = inspect.getargspec(context.callback)[0]
        if 'model' not in args:
            return callback

        def wrapper(*args, **kwargs):

            kwargs['model'] = self.model
            rv = callback(*args, **kwargs)
            return rv

        # Replace the route callback with the wrapped one.
        return wrapper


class Model:

    def __init__(self, jsonfile): 
        """Load data from a JSON file to initialise the 
        data store"""

        self.jsonfile = jsonfile
        self.reset()

    def reset(self):
        """reload the data from the JSON file"""

        with open(self.jsonfile) as fd:
            self.data = json.load(fd)
            print("loaded data from ", self.jsonfile)

    def get_observations(self):
        return self.data['observations']

    def get_users(self):
        return self.data['users']

    def add_observation(self, observation):
        """Add a new observation to the store"""

        fields = ['participant', 'temperature', 'weather', 'wind',  
                  'height', 'girth', 'location',
                  'leaf_size', 'leaf_shape', 'bark_colour', 'bark_texture']

        errors = []
        print(observation)
        for field in fields:
            if not field in observation:
                errors.append("Missing required field: " + field)

        if not errors == []:
            return {'status': "failed", 'errors': errors}
        else:
            # create a new id (incremental)
            observation['id'] = len(self.data['observations']) + 1
            # add timestamp
            observation['timestamp'] = datetime.datetime.now().isoformat()
            # observation['participant'] = int(observation['participant'])
            observation['temperature'] = int(observation['temperature'])
            observation['height'] = int(observation['height'])
            observation['girth'] = float(observation['girth'])
            self.data['observations'].append(observation)

            return {'status': 'success', 'observation': observation}

    def get_observation(self, oid):
        """Return a single observation from the data store 
        given the id or None if no observation with this id exists"""

        for obs in self.data['observations']:
            if str(obs['id']) == str(oid):
                return obs
        return None

    def get_user(self, uid):
        """Return a single user record from the data store
        given the id or None if no user with this id exists"""


        for user in self.data['users']:
            if str(user['id']) == str(uid):
                return user
        
        return None
