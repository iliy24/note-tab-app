import React, { useState } from 'react';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  // 1. Состояния (state)
  const [isLogin, setIsLogin] = useState(true); // true = вход, false = регистрация
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // Если окно закрыто, ничего не рендерим
  if (!isOpen) return null;

  // 2. Обработка обычного входа/регистрации
  const handleSubmit = async (e) => {
    e.preventDefault(); // Запрещаем браузеру перезагружать страницу при отправке формы
    setError(''); // Очищаем старые ошибки

    // Выбираем URL: либо логин, либо регистрация
    const url = isLogin 
      ? 'http://127.0.0.1:8001/api/login/' 
      : 'http://127.0.0.1:8001/api/register/';
      
    const body = isLogin 
      ? { username, password }
      : { username, password, email };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Говорим серверу, что шлем JSON
        body: JSON.stringify(body) // Превращаем JS-объект в строку JSON
      });

      const data = await res.json();

      if (res.ok) {
        // Успех! Сохраняем токен в память браузера (localStorage)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        onAuthSuccess(); // Сообщаем главному компоненту (App), что мы вошли
        onClose();       // Закрываем модалку
      } else {
        // Если бэкенд вернул ошибку (например, неверный пароль)
        setError(data.error || 'Ошибка: проверьте введенные данные');
      }
    } catch (err) {
      setError('Сервер недоступен');
    }
  };

  // 3. Обработка входа через соцсети (редирект)
  const handleSocialLogin = (provider) => {
    // Мы не делаем fetch! Мы просто перекидываем браузер по адресу бэкенда,
    // который перенаправит нас на Google или VK.
    window.location.href = `http://127.0.0.1:8001/api/auth/login/${provider}/`;
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isLogin ? 'Вход в аккаунт' : 'Регистрация'}</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Логин (никнейм):
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </label>
          
          {!isLogin && (
            <label>
              Email (необязательно):
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
          )}
          
          <label>
            Пароль:
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>

          <button type="submit" className="btn-primary">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Создать' : 'Войти'}
          </button>
        </div>

        <div className="auth-divider">или</div>

        <div className="social-login">
          <button type="button" onClick={() => handleSocialLogin('google-oauth2')} className="btn-social btn-google">
            Войти через Google
          </button>
          <button type="button" onClick={() => handleSocialLogin('vk-oauth2')} className="btn-social btn-vk">
            Войти через VK
          </button>
        </div>
      </div>
    </div>
  );
}