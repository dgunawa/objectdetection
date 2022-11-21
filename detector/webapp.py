
#Import necessary libraries
from flask import Flask, render_template, request, Response

from PIL import Image
import os
from detector_api import DetectorAPI


detector = DetectorAPI('ultralytics/yolov5', 'yolov5s', 'cpu', 0.4)

#Initialize the Flask app
app = Flask(__name__)

# for CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST') # Put any other methods you need here
    return response

@app.route('/test')
def index():
    return "WORKING"

@app.route('/image', methods=['POST'])
def image():
    try:
        image_file = request.files['image']  # get the image

        # Set an image confidence threshold value to limit returned data
        threshold = request.form.get('threshold')
        if threshold is None:
            threshold = 0.5
        else:
            threshold = float(threshold)

        # finally run the image through tensor flow object detection`
        image_object = Image.open(image_file)
        objects = detector.get_objects(image_object, threshold)
        return objects

    except Exception as e:
        print('POST /image error: %e' % e)
        return e

if __name__ == "__main__":
    app.run(debug=False)
