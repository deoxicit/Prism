import { PinataSDK } from "pinata";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT as string;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY as string;

const pinata = new PinataSDK({ pinataJwt: PINATA_JWT, pinataGateway: PINATA_GATEWAY });

export const uploadToPinata = async (content: string, title: string, image: File | null): Promise<string> => {
  try {
    let imageHash = '';
    if (image) {
      const imageUpload = await pinata.upload.file(image);
      imageHash = imageUpload.IpfsHash;
    }

    const contentUpload = await pinata.upload.json({
      title: title,
      content: content,
      backgroundImageHash: imageHash,
    });

    return contentUpload.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw new Error('Failed to upload content to IPFS');
  }
};