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
      // Максимальное количество одновременных загрузок в пачке
      const MAX_CONCURRENT_UPLOADS = 5;

      // Цикл по файлам для загрузки
      for (let i = 0; i < files.length; i += MAX_CONCURRENT_UPLOADS) {
        // Выбираем файлы для текущей пачки не более MAX_CONCURRENT_UPLOADS
        const batchFiles = files.slice(i, i + MAX_CONCURRENT_UPLOADS);

        // Создаем массив задач (промисов) для загрузки каждого файла в пачке
        const batchUploads = batchFiles.map(async (file) => {
          // Получаем URL для загрузки текущего файла
          const uploadUrl = await getUrlForSingleFile(file);

          // Создаем уникальный идентификатор для файла
          const fileUniqueId = nanoid();

          // Записываем уникальный идентификатор файла в объект fileUniqueIdsRef
          fileUniqueIdsRef.current[file.name] = fileUniqueId;

          // Загружаем текущий файл на сервер с использованием полученных данных
          return uploadSingleFile(file, uploadUrl, fileUniqueId);
        });

        // Ожидаем завершения всех задач загрузки в текущей пачке перед переходом к следующей пачке
        await Promise.all(batchUploads);
      }
    } catch (error) {
      console.error('Error uploading files:', (error as Error).message);
    }
  }

  return { uploadFilesToYandexDisk, progress, fileUniqueIds: fileUniqueIdsRef.current };
};