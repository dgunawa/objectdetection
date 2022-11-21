import os
import sys
from pathlib import Path

import torch

class DetectorAPI:
    
    @torch.no_grad()
    def __init__(self, model, weight, device, threshold):
        #self.model = torch.hub.load(model, weight, device=device)
        self.model = torch.hub.load(os.getcwd()+'/yolov5', 'custom', path=os.getcwd()+'/yolov5n.pt', source='local')
        self.model.conf = threshold
        self.model.iou = 0.45

    def get_objects(self, image_obj, threshold):
        # Model

        # Images
        imgs = [image_obj]  # batch of images

        # Inference
        results = self.model(imgs, size=320)

        # Results
        results.print()
        #results.save()
        return results.pandas().xyxy[0].to_json(orient="records")
