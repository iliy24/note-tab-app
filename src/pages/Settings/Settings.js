
import React, { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import "./Settings.css";

export default function Settings({ onBack, onNavigate }) {
    const [profile, setProfile] = useState({
        username: "",
        display_name: "",
        avatar: null
    }); // Данные текущего пользователя

    const [avatarFile, setAvatarFile] = useState(null); // Новый файл аватарки
    const [previewAvatar, setPreviewAvatar] = useState(null); // Адрес изображения для предпросмотра
    const [isSaving, setIsSaving] = useState(false); // Защита от повторного нажатия «Сохранить»
    const [error, setError] = useState(""); // Сообщение об ошибке

    useEffect(() => {
        let cancelled = false; // Позволяет игнорировать ответ после закрытия страницы

        const loadProfile = async () => {
            try {
                const response = await apiFetch("/profile/"); // Получаем профиль с токеном авторизации

                if (!response.ok) {
                    throw new Error("Не удалось загрузить профиль");
                }

                const data = await response.json(); // Преобразуем ответ Django в объект

                if (cancelled) return;

                setProfile(data); // Заполняем поля формы данными пользователя
                setPreviewAvatar(data.avatar || null); // Показываем сохранённую аватарку
            } catch (err) {
                if (!cancelled) setError(err.message); // Показываем ошибку загрузки
            }
        };

        loadProfile(); // Вызываем загрузку при открытии страницы

        return () => {
            cancelled = true; // Игнорируем устаревший ответ
        };
    }, []);

    useEffect(() => {
        if (!avatarFile) return; // Если пользователь не выбрал файл, ничего не создаём

        const url = URL.createObjectURL(avatarFile); // Создаём временный адрес изображения
        setPreviewAvatar(url); // Показываем фотографию до сохранения

        return () => URL.revokeObjectURL(url); // Освобождаем временный адрес при замене файла
    }, [avatarFile]);

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0]; // Получаем выбранный файл

        if (!file) return; // Если пользователь отменил выбор, ничего не меняем

        if (!file.type.startsWith("image/")) {
            setError("Выберите файл изображения."); // Не принимаем обычные документы и другие файлы
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Размер изображения не должен превышать 5 МБ."); // Ограничиваем размер
            return;
        }

        setError(""); // Убираем старую ошибку
        setAvatarFile(file); // Запоминаем фотографию для отправки в Django
    };

    const handleSave = async () => {
        setIsSaving(true); // Блокируем повторное сохранение
        setError(""); // Очищаем предыдущие ошибки

        const formData = new FormData(); // Создаём данные формы для отправки файла

        formData.append(
            "display_name",
            profile.display_name || ""
        ); // Передаём новое отображаемое имя

        if (avatarFile) {
            formData.append("avatar", avatarFile); // Добавляем фотографию только при её изменении
        }

        try {
            const response = await apiFetch("/profile/", {
                method: "PUT", // Обновляем существующий профиль
                body: formData // Отправляем имя и при необходимости аватарку
            });

            if (!response.ok) {
                const details = await response.text(); // Получаем описание ошибки Django
                throw new Error(details || "Ошибка сохранения");
            }

            const updatedProfile = await response.json(); // Получаем обновлённый профиль

            setProfile(updatedProfile); // Отображаем сохранённые данные
            setAvatarFile(null); // Сбрасываем файл после успешной загрузки
            setPreviewAvatar(updatedProfile.avatar || null); // Используем постоянный адрес аватарки

            alert("Профиль успешно обновлён!");
        } catch (err) {
            console.error("Ошибка сохранения профиля:", err); // Выводим подробности в консоль
            setError("Не удалось сохранить профиль. " + err.message); // Показываем сообщение пользователю
        } finally {
            setIsSaving(false); // Разблокируем кнопку при любом результате
        }
    };

    const handleLogout = () => {
        if (!window.confirm("Выйти из аккаунта?")) return;

        localStorage.removeItem("token"); // Удаляем токен текущей сессии
        window.location.reload(); // Обновляем приложение, чтобы сбросить состояние входа
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(
            "Вы уверены? Аккаунт будет удалён, а табулатуры станут анонимными."
        )) return;

        try {
            const response = await apiFetch("/profile/", {
                method: "DELETE" // Отправляем запрос удаления аккаунта с токеном
            });

            if (!response.ok) {
                throw new Error("Не удалось удалить аккаунт");
            }

            localStorage.removeItem("token"); // Удаляем токен удалённого аккаунта
            alert("Аккаунт удалён.");
            window.location.reload(); // Сбрасываем состояние приложения
        } catch (err) {
            setError(err.message); // Сообщаем об ошибке удаления
        }
    };

    return (
        <div className="settings-page">
            <h2>Настройки профиля</h2>

            <div className="settings-avatar-section">
                <div className="settings-avatar-preview">
                    {previewAvatar ? (
                        <img
                            src={previewAvatar}
                            alt="Аватар пользователя"
                        />
                    ) : (
                        <span>Нет фото</span>
                    )}
                </div>

                <label className="audio-upload-btn">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden-file-input"
                    />
                    <span className="plus-icon">+</span>
                    <span>Сменить аватар</span>
                </label>
            </div>

            <div className="settings-field">
                <label>Логин</label>
                <input
                    type="text"
                    value={profile.username || ""}
                    readOnly
                />
            </div>

            <div className="settings-field">
                <label>Отображаемое имя</label>
                <input
                    type="text"
                    maxLength={100}
                    value={profile.display_name || ""}
                    onChange={(event) =>
                        setProfile(prev => ({
                            ...prev,
                            display_name: event.target.value
                        }))
                    }
                    placeholder="Как вас называть?"
                />
            </div>

            {error && (
                <p role="alert" style={{ color: "#dc2626" }}>
                    {error}
                </p>
            )}

            <button
                className="btn-primary"
                onClick={handleSave}
                disabled={isSaving}
            >
                {isSaving ? "Сохранение..." : "Сохранить изменения"}
            </button>

            <div className="settings-danger-zone">
                <button
                    className="btn-secondary"
                    onClick={handleLogout}
                >
                    Выйти из аккаунта
                </button>

                <button
                    className="btn-danger"
                    onClick={handleDeleteAccount}
                >
                    Удалить аккаунт
                </button>
            </div>
        </div>
    );
}
