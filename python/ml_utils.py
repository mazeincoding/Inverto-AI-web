import torch
import os
import json
from model_config import create_model
from data_processing import data_transforms

# Set up the device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model(model_path):
    metadata_path = model_path.replace('.pth', '_metadata.json')
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        model_name = metadata['architecture']
    else:
        print(f"Warning: No metadata found for {model_path}. Using default model.")
        model_name = 'resnet50'
    
    model = create_model(model_name)
    model.load_state_dict(torch.load(model_path, map_location=device))
    return model.to(device)

def get_transform():
    return data_transforms['val']

def predict(model, image):
    with torch.no_grad():
        output = model(image)
    
    probability = 1 - output.item()  # Flip the probability
    is_handstand = probability >= 0.5  # Flip the threshold
    return is_handstand, probability