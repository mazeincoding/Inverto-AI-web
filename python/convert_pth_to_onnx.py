import torch
import torch.onnx
import os
import sys

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml_utils import load_model, device

def convert_pth_to_onnx(pth_path, onnx_path, input_shape=(3, 224, 224)):
    # Load the PyTorch model
    model = load_model(pth_path)
    model.eval()

    # Create a dummy input tensor on the same device as the model
    dummy_input = torch.randn(1, *input_shape).to(device)

    # Export the model to ONNX
    torch.onnx.export(model,               # model being run
                      dummy_input,         # model input (or a tuple for multiple inputs)
                      onnx_path,           # where to save the model
                      export_params=True,  # store the trained parameter weights inside the model file
                      opset_version=11,    # the ONNX version to export the model to
                      do_constant_folding=True,  # whether to execute constant folding for optimization
                      input_names=['input'],   # the model's input names
                      output_names=['output'], # the model's output names
                      dynamic_axes={'input' : {0 : 'batch_size'},    # variable length axes
                                    'output' : {0 : 'batch_size'}})
    
    print(f"Model converted and saved to {onnx_path}")

if __name__ == "__main__":
    # Set paths
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    pth_filename = 'final_handstand_detector_07.pth'
    onnx_filename = 'handstand_detector.onnx'
    
    pth_path = os.path.join(models_dir, pth_filename)
    onnx_path = os.path.join(models_dir, onnx_filename)

    # Check if the .pth file exists
    if not os.path.exists(pth_path):
        raise FileNotFoundError(f"Model file not found: {pth_path}")

    # Convert the model
    convert_pth_to_onnx(pth_path, onnx_path)