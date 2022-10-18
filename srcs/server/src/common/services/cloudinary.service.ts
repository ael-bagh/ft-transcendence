import { Injectable, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService  {

  onModuleInit() {
	console.log("CloudinaryService.onModuleInit()");
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(image: string, saveAs: string) {
    const { secure_url } = await cloudinary.uploader.upload(image, {
      folder: 'matcha',
      public_id: saveAs,
      transformation: [
        {
          width: 500,
          crop: 'scale',
        },
        {
          quality: 'auto',
        },
      ],
    });
    return secure_url;
  }
}
