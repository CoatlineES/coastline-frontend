import api from './api';

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary credentials missing in .env');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'waterproofing-certificates'); 

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  },

  uploadFile: async (file: File): Promise<string> => {
    // Usamos el servidor local para documentos (PDFs, etc) para evitar bloqueos de Cloudinary
    const formData = new FormData();
    formData.append('image', file); 
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.url) {
      return response.data.url;
    }

    throw new Error('Failed to upload file');
  }
};
