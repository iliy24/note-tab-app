import React, { useState, useEffect } from 'react';
import './SaveModal.css';

export default function SaveModal({ isOpen, onClose, onSave, initialData }) {
  const [title, setTitle] = useState("Новый таб");
  const [isPublic, setIsPublic] = useState(false);
  const [comment, setComment] = useState("");
  const [audioFile, setAudioFile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "Новый таб");
      setIsPublic(initialData?.is_public || false);   // ← snake_case
      setComment(initialData?.comment || "");
      setAudioFile(null);                              // ← сброс файла
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, isPublic, comment, audioFile });   // ← без author и avatarFile
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Сохранить как</h2>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Название:
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </label>

          <label>
            Комментарий:
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              rows="3"
            />
          </label>

          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={isPublic} 
              onChange={(e) => setIsPublic(e.target.checked)} 
            />
            Сделать публичным (появится в библиотеке)
          </label>

          <div className="audio-upload-group">
            <label className="audio-upload-btn">
              <input 
                type="file" 
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="hidden-file-input"
              />
              <span className="plus-icon">+</span> 
              <span>{audioFile ? "Файл выбран" : "Добавить аудио"}</span>
            </label>
            {audioFile && (
              <span className="file-name">
                {audioFile.name}
              </span>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Отмена</button>
            <button type="submit" className="btn-save">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}