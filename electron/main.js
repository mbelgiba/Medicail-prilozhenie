const { app, BrowserWindow } = require('electron');
const path = require('path');

// Функция для создания главного окна приложения
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: "DamuKids - Медицинская система",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    // Убираем стандартную рамку Windows, если хотим сделать свой дизайн (пока оставим true для удобства)
    frame: true,
    show: false // Скрываем окно до полной загрузки
  });

  // В режиме разработки мы подключаемся к локальному React-серверу
  // В продакшене здесь будет путь к скомпилированному index.html
  const isDev = true; // Поменяй на false при финальной сборке

  if (isDev) {
    const startUrl = 'http://localhost:3000';
    
    // Функция с повторными попытками подключения (Fix for ERR_CONNECTION_REFUSED)
    const loadWithRetry = (retryCount = 0) => {
      mainWindow.loadURL(startUrl).catch((err) => {
        if (retryCount < 30) { // Пробуем 30 раз по 1 секунде (React может запускаться долго)
          console.log(`Ожидание React-сервера... Попытка ${retryCount + 1}/30`);
          setTimeout(() => loadWithRetry(retryCount + 1), 1000);
        } else {
          console.error('Не удалось подключиться к React-серверу. Проверьте, запущен ли он.', err);
        }
      });
    };

    loadWithRetry();
    // mainWindow.webContents.openDevTools(); // Раскомментируй, если нужна консоль разработчика
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/build/index.html'));
  }

  // Показываем окно только когда оно полностью готово (убирает белое мигание при запуске)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// Когда Electron готов, создаем окно
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Закрываем программу, если все окна закрыты (кроме macOS, там свои стандарты)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});