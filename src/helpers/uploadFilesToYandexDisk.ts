import axios from "axios";

const getUrlForUpload = 'https://cloud-api.yandex.net/v1/disk/resources/upload';

export const uploadFilesToYandexDisk = async (files: File[]) => {
  const accessToken = localStorage.getItem('ya_token');
  const getUrlForSingleFile = async (file: File) => {
    try {
      const response = await axios.get(getUrlForUpload, {
        headers: {
          Authorization: `OAuth ${accessToken}`,
        },
        params: {
          path: `${file.name}`,
          overwrite: true,
        },
      });
      return response.data.href;
    } catch (error) {
      throw new Error(`Error getting upload URL for file "${file.name}": ${(error as Error).message}`);
    }
  };

  const uploadSingleFile = async (file: File, uploadUrl: string) => {
    try {
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
      console.log(`File "${file.name}" uploaded successfully.`);
    } catch (error) {
      throw new Error(`Error uploading file "${file.name}": ${(error as Error).message}`);
    }
  };

  try {
    for (const file of files) {
      const uploadUrl = await getUrlForSingleFile(file);
      await uploadSingleFile(file, uploadUrl);
    }
    console.log('All files uploaded successfully!');
  } catch (error) {
    console.error('Error uploading files:', (error as Error).message);
  }
};