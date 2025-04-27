from flask import Flask, request, jsonify
import joblib
import os

app = Flask(__name__)

# Load the model from the assets folder
MODEL_PATH = os.path.join('frontend/assets', 'model.joblib')
model = joblib.load(MODEL_PATH)

@app.route('/predict', methods=['POST'])
def predict():
    # Expecting JSON input like: {"temperature": <value>, "humidity": <value>}
    data = request.get_json()
    temperature = data.get('temperature')
    humidity = data.get('humidity')
    
    # Check if inputs are provided
    if temperature is None or humidity is None:
        return jsonify({'error': 'Please provide both temperature and humidity'}), 400
    
    try:
        # Prepare the input as a 2D array for the prediction
        input_features = [[temperature, humidity]]
        prediction = model.predict(input_features)
        return jsonify({'prediction': prediction[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
