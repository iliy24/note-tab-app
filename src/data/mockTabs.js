// src/data/mockTabs.js

export const MOCK_TABS = [
  {
    id: 1,
    title: "Hallelujah",
    author: "John Doe",
    avatar: "https://i.pravatar.cc/80?img=12", // временная картинка из интернета
    date: "2026-10-12",
    comment: "Аккорды для начинающих, каподастр на 2 ладу",
    isPublic: true,
    hasAudio: true,
  },
  {
    id: 2,
    title: "Wish You Were Here",
    author: "John Doe",
    avatar: "https://i.pravatar.cc/80?img=12",
    date: "2026-10-10",
    comment: "Классика Pink Floyd, соло в конце",
    isPublic: false,
    hasAudio: true,
  },
  {
    id: 3,
    title: "", // Пустое название — проверим, как работает "Без названия"
    author: "John Doe",
    avatar: "https://i.pravatar.cc/80?img=12",
    date: "2026-10-08",
    comment: "", // Пустой комментарий — проверим, что он скроется
    isPublic: false,
    hasAudio: false, // Нет аудио — проверим, что кнопка Play скроется
  },
];