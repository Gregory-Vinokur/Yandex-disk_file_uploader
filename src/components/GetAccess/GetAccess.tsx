import { useEffect } from 'react';
import { BASE_PATH, CLIENT_ID, REDIRECT_URI } from '../../constants/constans';

const GetAccess = () => {
  const isLoggedIn = localStorage.getItem('ya_token');
  const login = () => {
    const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}${BASE_PATH}`;
    window.location.href = yandexAuthUrl;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));

    if (params.get('access_token')) {
      localStorage.setItem('ya_token', params.get('access_token') as string);
      const basePath = BASE_PATH !== undefined ? BASE_PATH : '';
      window.location.href = basePath;
    }
  }, []);

  return (
    <button onClick={login} disabled={Boolean(isLoggedIn)}>
      {isLoggedIn ? 'Доступ получен' : 'Получить доступ к Яндекс диску'}
    </button>
  );
};

export default GetAccess;
