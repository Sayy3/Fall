#!/usr/bin/python3
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load the machine learning model
model = joblib.load('svm_model.pkl')

# Define a route for receiving fall data and making predictions


@app.route('/predict', methods=['POST'])
def predict():
    # Receive fall data from the client
    fall_status = request.json['fallStatus']

    # Make prediction
    result = model.predict([[fall_status]])[0]

    # Return prediction result
    return jsonify({'result': 'F' if result == 'F' else ''})


if __name__ == '__main__':
    app.run(debug=True)
