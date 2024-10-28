from flask import jsonify

def register_routes(app):
    @app.route('/api/hello', methods=['GET'])
    def hello_world():
        return jsonify({"message": "Hello from Flask Docker!"})