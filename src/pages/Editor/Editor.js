
import React, { useState, useRef, useEffect } from "react";

import TabInput from "./TabInput/TabInput";
import TabArea from "./TabArea/TabArea";
import RhythmControls from "./RhythmControls/RhythmControls";
import Tabs from "./Tabs/Tabs";
import Fretboard from "./Fretboard/Fretboard";
import TechniqueDrawer from "./TechniqueDrawer/TechniqueDrawer";
import SaveModal from "../../components/SaveModal/SaveModal";
import { apiFetch } from "../../api";

import "./Editor.css";


// Создаёт новую пустую секцию табулатуры
const createEmptyTab = (id) => ({
    id,                                                             // Уникальный ID секции внутри редактора
    title: "",                                                      // Название секции
    data: Array.from({ length: 10 }, () => Array(6).fill(null)),    // 10 столбцов по 6 струн, null означает отсутствие ноты
    cursorCol: 0,                                                   // Текущая позиция курсора
    is_public: false,                                               // Начальный статус публичности
    comment: "",                                                    // Комментарий
    audioFile: null                                                 // Прикреплённое аудио
});


export default function Editor({
    openSaveModalRef,
    quickSaveRef,
    editingTabId,
    newCompositionId,
    onDoneEditing
}) {

    // ==========================================
    // СОСТОЯНИЯ РЕДАКТОРА
    // ==========================================

    const [isModalOpen, setIsModalOpen] = useState(false);           // Открыто ли окно сохранения
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);         // Открыта ли панель музыкальных техник

    const [tabs, setTabs] = useState([createEmptyTab(1)]);           // Все секции текущей композиции
    const [activeTabId, setActiveTabId] = useState(1);               // ID выбранной секции
    const nextIdRef = useRef(2);                                     // Следующий свободный ID новой секции

    const [lastNote, setLastNote] = useState(null);                  // Последняя введённая нота для применения техник
    const [history, setHistory] = useState([]);                      // История изменений для Undo
    const [clipboard, setClipboard] = useState(null);                // Буфер копирования секций

    const [serverTabId, setServerTabId] = useState(null);            // ID композиции в базе данных Django
    const [songTitle, setSongTitle] = useState("");                  // Название всей композиции

    const [bpm, setBpm] = useState(120);                              // Темп композиции в ударах в минуту
    const [capo, setCapo] = useState(0);                              // Лад установки каподастра (0–12)
    const [isPlaying, setIsPlaying] = useState(false);               // Выполняется ли воспроизведение

    const intervalRef = useRef(null);                                // Ссылка на таймер воспроизведения
    const audioContextRef = useRef(null);                            // Ссылка на звуковой контекст браузера

    const [saveMode, setSaveMode] = useState("saveAs");              // Режим сохранения: save или saveAs

    const [savedMeta, setSavedMeta] = useState({
        title: "",                                                   // Последнее сохранённое название
        isPublic: false,                                             // Последний сохранённый статус публичности
        comment: "",                                                 // Последний сохранённый комментарий
        audioFile: null                                              // Новый выбранный аудиофайл
    });

    const openStringNotes = [64, 59, 55, 50, 45, 40];               // MIDI-номера открытых струн: E4, B3, G3, D3, A2, E2


    // ==========================================
    // ЗВУК ГИТАРЫ
    // ==========================================

    const playGuitarNote = async (stringIndex, fretNumber) => {
        try {
            if (
                stringIndex < 0 ||
                stringIndex >= openStringNotes.length ||
                fretNumber < 0
            ) return;                                                // Не воспроизводим ноты с некорректными номерами струны или лада

            if (!audioContextRef.current) {
                const AudioContextClass =
                    window.AudioContext || window.webkitAudioContext; // Получаем поддерживаемый браузером класс аудиоконтекста

                if (!AudioContextClass) return;                      // Если браузер не поддерживает Web Audio API, прекращаем выполнение

                audioContextRef.current = new AudioContextClass();   // Создаём аудиоконтекст только при первом воспроизведении
            }

            const audioContext = audioContextRef.current;            // Получаем созданный аудиоконтекст

            if (audioContext.state === "suspended") {
                await audioContext.resume();                         // Разблокируем звук после пользовательского действия
            }

            const midiNote =
                openStringNotes[stringIndex] +
                Number(fretNumber) +
                capo;                                                // Суммируем ноту открытой струны, лад и положение Capo

            const frequency =
                440 * Math.pow(2, (midiNote - 69) / 12);             // Переводим MIDI-ноту в частоту в герцах

            const now = audioContext.currentTime;                    // Текущее время аудиоконтекста
            const duration = 1.4;                                    // Продолжительность звучания в секундах

            const oscillator = audioContext.createOscillator();      // Генератор звуковой волны
            const gain = audioContext.createGain();                  // Регулятор громкости звука

            oscillator.type = "triangle";                            // Треугольная волна даёт относительно мягкий синтезированный тембр
            oscillator.frequency.setValueAtTime(frequency, now);     // Устанавливаем рассчитанную высоту звука

            gain.gain.setValueAtTime(0.0001, now);                    // Начинаем практически с нулевой громкости
            gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);// Быстро повышаем громкость, имитируя щипок струны
            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + duration
            );                                                       // Постепенно уменьшаем громкость до почти полного затухания

            oscillator.connect(gain);                                // Передаём звук генератора в регулятор громкости
            gain.connect(audioContext.destination);                  // Направляем звук в динамики или наушники

            oscillator.start(now);                                   // Начинаем воспроизведение
            oscillator.stop(now + duration);                         // Завершаем звук после заданного времени

            oscillator.onended = () => {
                oscillator.disconnect();                             // Отсоединяем генератор после завершения звука
                gain.disconnect();                                   // Освобождаем аудиоузлы
            };

        } catch (error) {
            console.error("Ошибка воспроизведения ноты:", error);    // Выводим ошибку звука в консоль браузера
        }
    };


    // ==========================================
    // ЗАГРУЗКА КОМПОЗИЦИИ
    // ==========================================

    useEffect(() => {
        if (!editingTabId) return;                                   // Если ID не передан, загружать композицию не нужно

        let cancelled = false;                                       // Флаг защищает от обновления состояния после отмены загрузки

        const loadTab = async () => {
            try {
                const response = await apiFetch(
                    `/tabs/${editingTabId}/`
                );                                                   // Запрашиваем композицию у Django вместе с токеном авторизации

                if (!response.ok) {
                    throw new Error("Ошибка загрузки композиции");   // При неуспешном HTTP-ответе переходим в catch
                }

                const data = await response.json();                  // Преобразуем JSON-ответ Django в объект JavaScript

                if (cancelled) return;                               // Игнорируем ответ, если загрузка уже неактуальна

                const savedData = data.data;                         // Получаем сохранённую структуру табулатуры

                if (savedData && Array.isArray(savedData.sections)) {
                    const loadedTabs = savedData.sections.map(
                        (section, index) => ({
                            id: index + 1,                           // Присваиваем секции последовательный локальный ID
                            title: section.title || "",              // Восстанавливаем название секции
                            data: section.data,                      // Восстанавливаем массив нот
                            cursorCol: 0,                            // Устанавливаем курсор в начало секции
                            is_public: data.is_public,               // Восстанавливаем статус публичности
                            comment: data.comment,                   // Восстанавливаем комментарий
                            audioFile: null                          // Сам File-объект из браузера не восстанавливаем
                        })
                    );

                    if (loadedTabs.length === 0) {
                        loadedTabs.push(createEmptyTab(1));           // Если секций нет, создаём одну пустую
                    }

                    setTabs(loadedTabs);                              // Помещаем все загруженные секции в состояние React
                    setActiveTabId(loadedTabs[0].id);                 // Выбираем первую секцию
                    nextIdRef.current = loadedTabs.length + 1;       // Подготавливаем ID следующей секции

                    setBpm(savedData.bpm ?? 120);                     // Восстанавливаем BPM или используем 120
                    setCapo(savedData.capo ?? 0);                     // Восстанавливаем Capo или используем 0

                } else {
                    const loadedTab = createEmptyTab(1);              // Подготавливаем секцию для старого формата данных

                    loadedTab.data = Array.isArray(savedData)
                        ? savedData
                        : loadedTab.data;                             // Используем старые ноты, если data — массив

                    loadedTab.is_public = data.is_public;            // Восстанавливаем публичность
                    loadedTab.comment = data.comment;                // Восстанавливаем комментарий

                    setTabs([loadedTab]);                             // Загружаем одну секцию
                    setActiveTabId(1);                                // Выбираем эту секцию
                    nextIdRef.current = 2;                            // Следующий ID будет равен 2

                    setBpm(120);                                      // В старом формате BPM по умолчанию равен 120
                    setCapo(0);                                       // В старом формате Capo по умолчанию равен 0
                }

                setServerTabId(data.id);                              // Запоминаем ID композиции в базе
                setSongTitle(data.title || "");                       // Восстанавливаем название композиции

                setSavedMeta({
                    title: data.title || "",                          // Запоминаем сохранённое название
                    isPublic: data.is_public,                         // Запоминаем публичность
                    comment: data.comment || "",                     // Запоминаем комментарий
                    audioFile: null                                   // Новый аудиофайл пока не выбран
                });

                setHistory([]);                                       // Очищаем историю Undo после загрузки
                setLastNote(null);                                    // Сбрасываем последнюю введённую ноту

            } catch (error) {
                if (!cancelled) {
                    console.error("Ошибка загрузки:", error);        // Показываем подробности ошибки в консоли
                    alert("Не удалось загрузить композицию");         // Сообщаем пользователю об ошибке
                }
            }
        };

        loadTab();                                                    // Запускаем функцию загрузки

        return () => {
            cancelled = true;                                        // Помечаем запрос неактуальным при смене ID или размонтировании
        };
    }, [editingTabId]);


    // ==========================================
    // ИСТОРИЯ И СЕКЦИИ
    // ==========================================

    const saveToHistory = () => {
        setHistory(prev => [
            ...prev,                                                 // Сохраняем уже существующие состояния истории
            JSON.parse(JSON.stringify(tabs))                        // Добавляем глубокую копию текущих секций
        ]);
    };


    const handleSelectTab = (tabId, colIndex) => {
        setTabs(prev =>
            prev.map(tab =>
                tab.id === tabId
                    ? {
                        ...tab,                                       // Сохраняем остальные свойства секции
                        cursorCol: colIndex ?? tab.cursorCol         // Меняем позицию курсора, если передан столбец
                    }
                    : tab                                            // Остальные секции не изменяем
            )
        );

        setActiveTabId(tabId);                                       // Делаем выбранную секцию активной
    };


    const handleAddTab = () => {
        saveToHistory();                                             // Запоминаем состояние перед созданием секции

        const newTab = createEmptyTab(nextIdRef.current);           // Создаём пустую секцию с новым ID

        nextIdRef.current += 1;                                      // Увеличиваем счётчик ID

        setTabs(prev => [...prev, newTab]);                          // Добавляем новую секцию в конец массива
        setActiveTabId(newTab.id);                                   // Переключаемся на созданную секцию
        setLastNote(null);                                           // Сбрасываем последнюю введённую ноту
    };


    const handleTitleChange = (tabId, newTitle) => {
        setTabs(prev =>
            prev.map(tab =>
                tab.id === tabId
                    ? { ...tab, title: newTitle }                     // Обновляем название выбранной секции
                    : tab                                            // Названия остальных секций не меняем
            )
        );
    };


    const handleSongTitleChange = (event) => {
        setSongTitle(event.target.value);                            // Записываем название композиции из текстового поля
    };


    // ==========================================
    // ДОБАВЛЕНИЕ НОТ
    // ==========================================

    const handleNoteClick = (stringIndex, fretNumber) => {
        const activeTab = tabs.find(tab => tab.id === activeTabId);   // Получаем выбранную секцию

        if (!activeTab) return;                                      // Если секция отсутствует, ничего не делаем

        playGuitarNote(stringIndex, fretNumber);                     // Воспроизводим выбранную струну и лад с учётом Capo

        saveToHistory();                                             // Сохраняем состояние для возможной отмены

        setLastNote({
            tabId: activeTabId,                                      // Запоминаем секцию введённой ноты
            col: activeTab.cursorCol,                                // Запоминаем столбец
            string: stringIndex                                      // Запоминаем номер струны
        });

        setTabs(prev =>
            prev.map(tab => {
                if (tab.id !== activeTabId) return tab;              // Не меняем другие секции

                const newData = tab.data.map(col => [...col]);       // Копируем все столбцы перед изменением

                newData[tab.cursorCol][stringIndex] = {
                    fret: fretNumber,                                // Записываем номер лада
                    tech: null                                       // Техника игры пока не выбрана
                };

                let newCursorCol = tab.cursorCol;                    // Сохраняем текущую позицию курсора
                let finalData = newData;                             // Подготавливаем обновлённый массив нот

                if (newCursorCol < newData.length - 1) {
                    newCursorCol += 1;                               // Если есть следующий столбец, сдвигаем курсор вправо
                } else {
                    finalData = [
                        ...newData,                                  // Сохраняем предыдущие столбцы
                        Array(6).fill(null)                          // Добавляем пустой столбец для дальнейшего ввода
                    ];

                    newCursorCol += 1;                               // Перемещаем курсор в добавленный столбец
                }

                return {
                    ...tab,                                          // Сохраняем остальные параметры секции
                    data: finalData,                                 // Обновляем ноты
                    cursorCol: newCursorCol                          // Обновляем позицию курсора
                };
            })
        );
    };


    // ==========================================
    // МУЗЫКАЛЬНЫЕ ТЕХНИКИ
    // ==========================================

    const applyTechnique = (tech) => {
        const activeTab = tabs.find(tab => tab.id === activeTabId);   // Получаем выбранную секцию

        if (!activeTab) return;                                      // Без активной секции техника не применяется

        if (
            tech !== "X" &&
            (!lastNote || lastNote.tabId !== activeTabId)
        ) return;                                                    // Обычную технику можно применить только к последней ноте текущей секции

        saveToHistory();                                             // Запоминаем данные до изменения

        setTabs(prev =>
            prev.map(tab => {
                if (tab.id !== activeTabId) return tab;              // Остальные секции не меняем

                const newData = tab.data.map(col => [...col]);       // Создаём копию массива нот

                if (tech === "X") {
                    for (let s = 0; s < 6; s++) {
                        newData[tab.cursorCol][s] = { dead: true };   // Помечаем все шесть струн текущего столбца как приглушённые
                    }

                    return { ...tab, data: newData };                 // Возвращаем секцию с обновлённым столбцом
                }

                const cell = newData[lastNote.col]?.[lastNote.string];// Находим последнюю введённую ноту

                if (!cell || cell.dead) return tab;                  // Не применяем технику к пустой или приглушённой ячейке

                newData[lastNote.col][lastNote.string] = {
                    ...cell,                                         // Сохраняем лад и остальные свойства ноты
                    tech                                             // Добавляем выбранную технику
                };

                return { ...tab, data: newData };                     // Сохраняем изменённые данные секции
            })
        );
    };


    // ==========================================
    // ВСТАВКА СТОЛБЦА
    // ==========================================

    const insertSpace = () => {
        saveToHistory();                                             // Сохраняем историю перед вставкой

        setTabs(prev =>
            prev.map(tab => {
                if (tab.id !== activeTabId) return tab;              // Работаем только с активной секцией

                const newData = tab.data.map(col => [...col]);       // Копируем существующие столбцы
                const emptyColumn = Array(6).fill(null);            // Создаём столбец без нот

                newData.splice(tab.cursorCol, 0, emptyColumn);       // Вставляем пустой столбец в позицию курсора

                return { ...tab, data: newData };                     // Сохраняем обновлённый массив
            })
        );

        setLastNote(null);                                           // Сбрасываем ссылку на последнюю ноту
    };


    // ==========================================
    // ПЕРЕМЕЩЕНИЕ КУРСОРА
    // ==========================================

    const moveCursor = (direction) => {
        setTabs(prev =>
            prev.map(tab => {
                if (tab.id !== activeTabId) return tab;              // Меняем курсор только выбранной секции

                let newCol = tab.cursorCol + direction;              // Вычисляем новую позицию

                if (newCol < 0) newCol = 0;                          // Не допускаем отрицательную позицию

                if (newCol >= tab.data.length) {
                    newCol = tab.data.length - 1;                     // Не позволяем выйти за последний столбец
                }

                return { ...tab, cursorCol: newCol };                 // Сохраняем новую позицию курсора
            })
        );
    };


    // ==========================================
    // ОТМЕНА ДЕЙСТВИЙ
    // ==========================================

    const handleUndo = () => {
        if (history.length === 0) return;                            // Если история пуста, отменять нечего

        const lastState = history[history.length - 1];               // Получаем последнее сохранённое состояние

        setTabs(lastState);                                          // Восстанавливаем массив секций
        setHistory(prev => prev.slice(0, -1));                       // Удаляем использованное состояние из истории
        setLastNote(null);                                           // Сбрасываем последнюю ноту
    };


    // ==========================================
    // ВОСПРОИЗВЕДЕНИЕ КУРСОРА
    // ==========================================

   
const stopPlayback = () => {
    if (intervalRef.current !== null) {
        clearTimeout(intervalRef.current); // Отменяем запланированное воспроизведение следующего столбца
        intervalRef.current = null; // Очищаем ссылку на таймер
    }

    setIsPlaying(false); // Переводим кнопку Play в состояние остановки
};



    
const startPlayback = () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId); // Ищем секцию, выбранную в редакторе

    if (!activeTab || !activeTab.data?.length) return; // Если секция пустая или отсутствует, не запускаем Play

    stopPlayback(); // Останавливаем предыдущий таймер, чтобы не было двух воспроизведений одновременно

    const columns = activeTab.data; // Получаем все столбцы с нотами активной секции

    const lastNoteColumn = columns.reduce((last, column, index) => {
        const hasNotes = column.some(cell => cell !== null); // Проверяем, есть ли хотя бы одна запись в столбце
        return hasNotes ? index : last; // Запоминаем индекс последнего непустого столбца
    }, -1);

    if (lastNoteColumn === -1) return; // Если нот вообще нет, ничего не воспроизводим

    const beatDuration = 60000 / bpm; // Переводим BPM в длительность одного шага в миллисекундах

    let currentColumn = 0; // Начинаем воспроизведение с первого столбца

    setIsPlaying(true); // Сообщаем интерфейсу, что воспроизведение запущено

    const playNextColumn = () => {
        if (currentColumn > lastNoteColumn) {
            stopPlayback(); // Если все столбцы пройдены, останавливаем воспроизведение
            return;
        }

        const columnIndex = currentColumn; // Запоминаем номер воспроизводимого столбца
        const column = columns[columnIndex]; // Получаем шесть ячеек текущего столбца

        setTabs(prev =>
            prev.map(tab =>
                tab.id === activeTabId
                    ? { ...tab, cursorCol: columnIndex } // Перемещаем курсор на воспроизводимый столбец
                    : tab // Остальные секции оставляем без изменений
            )
        );

        column.forEach((cell, stringIndex) => {
            if (!cell || cell.dead) return; // Пустую или приглушённую ячейку пока не озвучиваем

            const fret = Number(cell.fret); // Получаем номер лада записанной ноты

            if (!Number.isInteger(fret) || fret < 0) return; // Пропускаем некорректные значения ладов

            playGuitarNote(stringIndex, fret); // Воспроизводим струну с учётом текущего Capo
        });

        currentColumn += 1; // Переходим к следующему столбцу

        intervalRef.current = setTimeout(
            playNextColumn,
            beatDuration
        ); // Планируем следующий шаг через время, рассчитанное по BPM
    };

    playNextColumn(); // Сразу воспроизводим первый столбец, без начальной задержки
};



    const handleTogglePlay = () => {
        if (isPlaying) {
            stopPlayback();                                          // Если воспроизведение идёт, останавливаем его

            setTabs(prev =>
                prev.map(tab =>
                    tab.id === activeTabId
                        ? { ...tab, cursorCol: 0 }                    // После остановки возвращаем курсор в начало
                        : tab
                )
            );
        } else {
            startPlayback();                                         // Если воспроизведение остановлено, запускаем его
        }
    };


    const handleBpmChange = (nextBpm) => {
        const clamped = Math.max(40, Math.min(240, Number(nextBpm))); // Ограничиваем BPM диапазоном 40–240

        if (!Number.isFinite(clamped)) return;                       // Игнорируем некорректное значение

        if (isPlaying) stopPlayback();                               // Останавливаем Play перед изменением темпа

        setBpm(clamped);                                             // Сохраняем новое значение BPM
    };


    const handleCapoChange = (nextCapo) => {
        const value = Number(nextCapo);                              // Преобразуем входное значение в число

        if (!Number.isFinite(value)) return;                         // Игнорируем некорректное значение

        const newCapo = Math.max(0, Math.min(12, Math.round(value)));// Ограничиваем Capo диапазоном 0–12 ладов

        if (isPlaying) stopPlayback();                               // Останавливаем воспроизведение перед сменой Capo

        setCapo(newCapo);                                            // Сохраняем новый лад каподастра
    };


    // ==========================================
    // ОЧИСТКА ТАЙМЕРА И АУДИО
    // ==========================================

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);                 // Очищаем таймер при закрытии редактора
            }

            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.error);// Закрываем аудиоконтекст и освобождаем звуковые ресурсы
                audioContextRef.current = null;                      // Удаляем ссылку на закрытый контекст
            }
        };
    }, []);


    // ==========================================
    // СОЗДАНИЕ НОВОЙ КОМПОЗИЦИИ
    // ==========================================

    useEffect(() => {
        if (!newCompositionId) return;                               // При первом открытии приложения ничего не сбрасываем

        stopPlayback();                                              // Останавливаем воспроизведение прежней композиции

        setTabs([createEmptyTab(1)]);                                // Создаём одну пустую секцию
        setActiveTabId(1);                                           // Делаем её активной

        setSongTitle("");                                            // Очищаем название композиции
        setServerTabId(null);                                        // Сбрасываем ID записи Django

        setBpm(120);                                                 // Возвращаем стандартный темп
        setCapo(0);                                                  // Убираем каподастр

        setHistory([]);                                              // Очищаем историю изменений
        setLastNote(null);                                           // Удаляем последнюю введённую ноту
        setClipboard(null);                                          // Очищаем буфер секций

        setIsModalOpen(false);                                       // Закрываем окно сохранения
        setIsDrawerOpen(false);                                      // Закрываем панель техник
        setSaveMode("saveAs");                                       // Устанавливаем начальный режим сохранения

        setSavedMeta({
            title: "",                                               // Сбрасываем сохранённое название
            isPublic: false,                                         // Новая композиция по умолчанию приватная
            comment: "",                                             // Очищаем комментарий
            audioFile: null                                          // Сбрасываем новый выбранный файл
        });

        nextIdRef.current = 2;                                       // Следующей секции будет присвоен ID 2

    }, [newCompositionId]);


    // ==========================================
    // УДАЛЕНИЕ И КОПИРОВАНИЕ СЕКЦИЙ
    // ==========================================

    const handleDeleteTab = (tabId) => {
        if (tabs.length === 1) return;                               // Не разрешаем удалять последнюю секцию

        saveToHistory();                                             // Запоминаем состояние для Undo

        setTabs(prev => prev.filter(tab => tab.id !== tabId));       // Удаляем секцию с указанным ID

        if (activeTabId === tabId) {
            const remaining = tabs.filter(tab => tab.id !== tabId);  // Получаем список оставшихся секций
            setActiveTabId(remaining[0]?.id ?? null);                // Выбираем первую оставшуюся секцию
        }

        setLastNote(null);                                           // Сбрасываем последнюю ноту
    };


    const handleCopyTab = (tabId) => {
        const source = tabs.find(tab => tab.id === tabId);           // Ищем секцию, которую нужно скопировать

        if (!source) return;                                         // Если секция не найдена, ничего не делаем

        setClipboard(JSON.parse(JSON.stringify(source)));           // Кладём глубокую копию секции во внутренний буфер
    };


    const handlePasteTab = (tabId) => {
        if (!clipboard) return;                                      // Если ничего не скопировано, вставлять нечего

        saveToHistory();                                             // Сохраняем состояние перед вставкой

        const newTab = {
            ...JSON.parse(JSON.stringify(clipboard)),               // Создаём копию данных из буфера
            id: nextIdRef.current                                    // Присваиваем вставленной секции новый ID
        };

        nextIdRef.current += 1;                                      // Увеличиваем следующий ID

        setTabs(prev => {
            const index = prev.findIndex(tab => tab.id === tabId);   // Ищем место вставки

            if (index === -1) return [...prev, newTab];              // Если место не найдено, добавляем секцию в конец

            const next = [...prev];                                  // Создаём копию массива секций
            next.splice(index + 1, 0, newTab);                       // Вставляем секцию сразу после указанной
            return next;                                             // Сохраняем новый порядок
        });

        setActiveTabId(newTab.id);                                   // Переключаемся на вставленную секцию
        setLastNote(null);                                           // Сбрасываем последнюю ноту
    };


    // ==========================================
    // СОХРАНЕНИЕ КОМПОЗИЦИИ
    // ==========================================

    const handleSaveToServer = async (modalData, mode = "save") => {
        if (tabs.length === 0) return;                               // Не сохраняем композицию без секций

        const compositionData = {
            version: 2,                                              // Версия формата сохранения
            bpm: bpm,                                                // Темп композиции
            capo: capo,                                              // Лад каподастра
            sections: tabs.map(tab => ({
                id: tab.id,                                          // ID секции
                title: tab.title,                                    // Название секции
                data: tab.data                                       // Все столбцы и ноты секции
            }))
        };

        const formData = new FormData();                              // Создаём набор данных для отправки на сервер

        formData.append("title", modalData.title || "Новый таб");     // Добавляем название композиции
        formData.append("is_public", modalData.isPublic ? "true" : "false"); // Добавляем статус публичности
        formData.append("comment", modalData.comment || "");          // Добавляем комментарий
        formData.append("data", JSON.stringify(compositionData));    // Преобразуем секции и настройки в JSON-строку

        if (modalData.audioFile instanceof File) {
            formData.append("audio_file", modalData.audioFile);      // Прикрепляем новый аудиофайл, если он выбран
        }

        const isEditing =
            mode === "save" && serverTabId !== null;                 // Обновляем запись только при обычном сохранении с известным ID

        const apiPath = isEditing
            ? `/tabs/${serverTabId}/`
            : "/tabs/";                                             // Выбираем URL существующей или новой композиции

        const method = isEditing ? "PATCH" : "POST";                  // PATCH частично обновляет запись, POST создаёт новую

        try {
            const response = await apiFetch(apiPath, {
                method,                                             // Передаём выбранный HTTP-метод
                body: formData                                       // Передаём название, публичность, секции и файл
            });

            if (!response.ok) {
                const errorText = await response.text();             // Читаем описание серверной ошибки
                throw new Error(errorText);                          // Передаём ошибку в catch
            }

            const savedTab = await response.json();                  // Получаем сохранённую запись с ID от Django

            setServerTabId(savedTab.id);                             // Запоминаем ID созданной или обновлённой композиции
            setSongTitle(savedTab.title || "");                      // Обновляем название после успешного сохранения

            setSavedMeta({
                title: savedTab.title || "",                         // Запоминаем сохранённое название
                isPublic: savedTab.is_public,                         // Запоминаем сохранённую публичность
                comment: savedTab.comment || "",                     // Запоминаем комментарий
                audioFile: null                                      // Сбрасываем выбранный для загрузки файл
            });

            setIsModalOpen(false);                                   // Закрываем окно сохранения

            if (onDoneEditing) onDoneEditing();                      // Сообщаем App.js о завершении исходного режима редактирования

            alert(
                isEditing
                    ? "Композиция обновлена!"
                    : "Новая композиция сохранена!"
            );                                                       // Показываем результат сохранения

        } catch (error) {
            console.error("Ошибка сохранения:", error);              // Выводим техническую причину в консоль
            alert("Не удалось сохранить композицию: " + error.message); // Показываем пользователю сообщение об ошибке
        }
    };


    // ==========================================
    // КНОПКИ «СОХРАНИТЬ» И «СОХРАНИТЬ КАК»
    // ==========================================

    useEffect(() => {
        if (openSaveModalRef) {
            openSaveModalRef.current = () => {
                setSaveMode("saveAs");                                // Выбираем создание новой копии
                setIsModalOpen(true);                                // Открываем окно названия и настроек
            };
        }

        if (quickSaveRef) {
            quickSaveRef.current = () => {
                if (serverTabId === null) {
                    setSaveMode("save");                              // Для новой композиции выбираем первое сохранение
                    setIsModalOpen(true);                            // Открываем окно, поскольку название ещё не задано
                } else {
                    handleSaveToServer(
                        {
                            ...savedMeta,                            // Используем последние сохранённые настройки
                            title: songTitle || savedMeta.title     // Учитываем новое название в редакторе
                        },
                        "save"                                       // Обновляем уже существующую запись
                    );
                }
            };
        }

        return () => {
            if (openSaveModalRef) openSaveModalRef.current = null;    // Убираем обработчик «Сохранить как» при очистке эффекта
            if (quickSaveRef) quickSaveRef.current = null;          // Убираем обработчик обычного сохранения
        };
    });


    // ==========================================
    // ИНТЕРФЕЙС РЕДАКТОРА
    // ==========================================

    return (
        <>
            <div className="top-content">
                <div className="editor-top-bar">
                    <TabInput
                        value={songTitle}                             // Показываем название композиции
                        onChange={handleSongTitleChange}             // Обновляем название при вводе
                    />
                </div>

                <div className="tabs-scroll-area">
                    <div className="tabs-list-container">
                        {tabs.map((tab, index) => (
                            <TabArea
                                key={tab.id}                          // Уникальный ключ для React
                                tab={tab}                             // Данные текущей секции
                                index={index}                         // Порядковый номер секции
                                isActive={tab.id === activeTabId}     // Отмечаем выбранную секцию
                                onSelect={handleSelectTab}           // Обработчик выбора секции
                                onDelete={handleDeleteTab}           // Обработчик удаления секции
                                onCopy={handleCopyTab}               // Обработчик копирования
                                onPaste={handlePasteTab}             // Обработчик вставки
                                onChangeTitle={handleTitleChange}    // Обработчик переименования
                                hasClipboard={!!clipboard}           // Признак наличия скопированной секции
                            />
                        ))}
                    </div>

                    <div className="tabs-add-btn">
                        <Tabs onAddTab={handleAddTab} />               {/* Кнопка создания новой секции */}
                    </div>
                </div>

                <div className="rhythm-absolute-wrapper">
                    <RhythmControls
                        bpm={bpm}                                     // Текущий темп
                        onBpmChange={handleBpmChange}                // Изменение темпа
                        capo={capo}                                   // Текущее положение каподастра
                        onCapoChange={handleCapoChange}              // Изменение каподастра
                        isPlaying={isPlaying}                         // Статус воспроизведения
                        onTogglePlay={handleTogglePlay}              // Запуск или остановка Play
                    />
                </div>
            </div>

            <div className="fretboard-slot">
                <Fretboard onNoteClick={handleNoteClick} />          {/* Добавление ноты с одновременным звуком */}
            </div>

            <TechniqueDrawer
                onToggle={() => setIsDrawerOpen(!isDrawerOpen)}      // Переключение видимости панели техник
                isOpen={isDrawerOpen}                                 // Текущее состояние панели
                onClose={() => setIsDrawerOpen(false)}                // Закрытие панели
                onTechniqueSelect={applyTechnique}                   // Применение музыкальной техники
                onMoveCursor={moveCursor}                             // Перемещение курсора
                onInsertSpace={insertSpace}                           // Вставка пустого столбца
                onUndo={handleUndo}                                   // Отмена последнего изменения
                canUndo={history.length > 0}                          // Доступность Undo
                activeTechnique={
                    lastNote && lastNote.tabId === activeTabId
                        ? tabs.find(tab => tab.id === activeTabId)
                            ?.data[lastNote.col]?.[lastNote.string]?.tech
                        : null                                       // Получаем технику последней введённой ноты
                }
            />

            <SaveModal
                isOpen={isModalOpen}                                   // Состояние окна сохранения
                onClose={() => setIsModalOpen(false)}                  // Закрытие окна
                onSave={(modalData) =>
                    handleSaveToServer(modalData, saveMode)
                }                                                    // Сохранение с выбранным режимом
                initialData={{
                    title: songTitle,                                 // Подставляем текущее название
                    is_public: savedMeta.isPublic,                    // Подставляем статус публичности
                    comment: savedMeta.comment                       // Подставляем комментарий
                }}
            />
        </>
    );
}
