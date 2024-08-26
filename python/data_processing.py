import torch
from torchvision import transforms
from PIL import Image
from io import BytesIO
import os
from torch.utils.data import Dataset


def pad_to_square(image, fill=255):
    if isinstance(image, torch.Tensor):
        c, h, w = image.shape
        max_size = max(h, w)
        padded_image = torch.full((c, max_size, max_size), fill, dtype=image.dtype)
        paste_x = (max_size - w) // 2
        paste_y = (max_size - h) // 2
        padded_image[:, paste_y:paste_y+h, paste_x:paste_x+w] = image
        return padded_image
    else:  # PIL Image
        width, height = image.size
        max_size = max(width, height)
        padded_image = Image.new('RGB', (max_size, max_size), color=(fill, fill, fill))
        paste_x = (max_size - width) // 2
        paste_y = (max_size - height) // 2
        padded_image.paste(image, (paste_x, paste_y))
        return padded_image

def convert_avif_to_png(file_path):
    with open(file_path, 'rb') as f:
        avif_data = f.read()
    
    avif_image = Image.open(BytesIO(avif_data))
    return avif_image.convert('RGB')

data_transforms = {
    'train': transforms.Compose([
        transforms.Lambda(pad_to_square),
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.RandomAffine(0, shear=10, scale=(0.8, 1.2)),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
    'val': transforms.Compose([
        transforms.Lambda(pad_to_square),
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ]),
}

def pil_loader(path):
    with open(path, 'rb') as f:
        img = Image.open(f)
        if img.mode == 'P':
            img = img.convert('RGBA')
        return img.convert('RGB')

class CustomImageDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.classes = sorted(os.listdir(root_dir))
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        self.samples = self._make_dataset()

    def _make_dataset(self):
        samples = []
        for target_class in self.classes:
            class_index = self.class_to_idx[target_class]
            target_dir = os.path.join(self.root_dir, target_class)
            for root, _, fnames in sorted(os.walk(target_dir, followlinks=True)):
                for fname in sorted(fnames):
                    path = os.path.join(root, fname)
                    samples.append((path, class_index))
        return samples

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, target = self.samples[idx]
        img = convert_avif_to_png(path)
        
        if self.transform:
            img = self.transform(img)
        
        return img, target