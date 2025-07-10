from flask import jsonify, request, Blueprint
from util import pass_to_google_forms

userid_handler = Blueprint("cookie_handler", __name__)

# endpoint for handling user id
@userid_handler.route('/user_id', methods=["POST"])
def get_id():
    #obtain user id from frontend and send to google forms
    user_id = request.cookies.get('user_id')
    if user_id == "null":
        user_id = "No user_id found."
    pass_to_google_forms(user_id)
    return jsonify(message="Success"), 200
