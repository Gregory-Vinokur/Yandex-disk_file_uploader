import { useEffect } from 'react';
import { CONSTANTS } from '../../constants/constans';

const GetAccess = () => {
  const isLoggedIn = localStorage.getItem('token');
  const login = () => {
    const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${CONSTANTS.CLIENT_ID}&redirect_uri=${CONSTANTS.REDIRECT_URI}${CONSTANTS.BASE_PATH}`;
    window.location.href = yandexAuthUrl;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));

    if (params.get('access_token')) {
      localStorage.setItem('token', params.get('access_token') as string);
      window.location.href = CONSTANTS.BASE_PATH;
    }
  }, []);

  return (
    <button onClick={login}>
      {isLoggedIn ? 'Доступ получен' : 'Получить доступ к Яндекс диску'}
    </button>
  );
};

export default GetAccess;
