import { useRef, useState } from 'react';
import styles from './Uploader.module.css';
import { MdCloudUpload, MdDelete } from 'react-icons/md';
import { AiFillFileImage } from 'react-icons/ai';
import GetAccess from '../GetAccess/GetAccess';
import { uploadFilesToYandexDisk } from './../../helpers/uploadFilesToYandexDisk';

const Uploader = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [drag, setDrag] = useState(false);
  const [filesCount, setFilesCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (!files) {
        setFiles(Array.from(e.target.files));
      } else {
        const updatedFiles: File[] = [...files, ...Array.from(e.target.files)];
        setFiles(updatedFiles);
      }
    }
  };

  const removeFile = (fileIndex: number) => {
    if (files) {
      const updatedFiles = files.filter((_, index) => index !== fileIndex);
      setFiles(updatedFiles);
    }
  };

  const dragStartHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  };

  const dragLeaveHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
  };

  const onDropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    const dropFiles = [...e.dataTransfer.files];
    if (!files) {
      setFiles(dropFiles);
    } else {
      const updatedFiles: File[] = [...Array.from(files), ...dropFiles];
      setFiles(updatedFiles);
    }
    setDrag(false);
  };

  return (
    <main>
      <GetAccess />
      <form
        className={styles.form}
        onClick={() => fileInputRef.current?.click()}
        onDragStart={dragStartHandler}
        onDragLeave={dragLeaveHandler}
        onDragOver={dragStartHandler}
        onDrop={onDropHandler}
      >
        <input
          type="file"
          className="input-field"
          onChange={handleFileInput}
          hidden
          multiple
          ref={fileInputRef}
        />
        {drag ? (
          <div>Отпустите файлы, чтобы загрузить их</div>
        ) : (
          <>
            <MdCloudUpload color="#1475cf" size={60} />
            <p>Выберите или перетащите файлы для загрузки:</p>
          </>
        )}
      </form>
      <p className={styles.files__count}>Файлов выбрано: {files.length}/100</p>
      <p className={styles.files__count}>Файлов загружено: {filesCount}/100</p>
      <section className={styles.uploaded__row}>
        {!files.length && (
          <span className={styles.upload__content}>Файлы не выбраны</span>
        )}
        {files &&
          files.map((file, index) => (
            <div key={index} className={styles.content__desc}>
              <span>{index + 1}.</span>
              <AiFillFileImage color="#1475cf" />
              <span className={styles.upload__content}>{file.name}</span>
              <MdDelete onClick={() => removeFile(index)} />
            </div>
          ))}
      </section>
      {files.length > 100 && <span>Нельзя загрузить больше 100 файлов!</span>}
      {filesCount >= 100 && <span>Достигнут лимит загрузки файлов!</span>}
      {filesCount < 100 && (
        <button
          onClick={() =>
            uploadFilesToYandexDisk(files).then(() => {
              setFilesCount(files.length);
              setFiles([]);
            })
          }
        >
          Загрузить файлы на Яндекс диск
        </button>
      )}
    </main>
  );
};

export default Uploader;
