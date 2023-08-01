import axios from "axios";
import { nanoid } from 'nanoid';
import { useState, useRef } from 'react';

const getUrlForUpload = 'https://cloud-api.yandex.net/v1/disk/resources/upload';

export const useUpload = (files: File[]) => {
  const accessToken = localStorage.getItem('ya_token');
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const fileUniqueIdsRef = useRef<{ [key: string]: string }>({});

  const uploadFilesToYandexDisk = async () => {
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

    const uploadSingleFile = async (file: File, uploadUrl: string, fileUniqueId: string) => {
      try {
        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total !== null && progressEvent.total !== undefined) {
              const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress((prevProgress) => ({
                ...prevProgress,
                [fileUniqueId]: fileProgress,
              }));
            }
          },
        });
      } catch (error) {
        throw new Error(`Error uploading file "${file.name}": ${(error as Error).message}`);
      }
    };



    try {
      for (const file of files) {
        const uploadUrl = await getUrlForSingleFile(file);
        const fileUniqueId = nanoid();
        fileUniqueIdsRef.current[file.name] = fileUniqueId;
        await uploadSingleFile(file, uploadUrl, fileUniqueId);
      }
    } catch (error) {
      console.error('Error uploading files:', (error as Error).message);
    }
  }

  return { uploadFilesToYandexDisk, progress, fileUniqueIds: fileUniqueIdsRef.current };
};