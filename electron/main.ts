import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'

var ACCESS_KEY = "";
var ACCESS_TOKEN = "";

// Retrieves required data from database file
async function retrieveAccess() {
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('./Access.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
        if (error) {
            console.error(error.message)
        }
        console.log('Connected to the Access database')
    })

    let sql = 'SELECT ACCESS_KEY, ACCESS_TOKEN FROM AccessData WHERE NAME = "Retrieve_Data"'

    db.all(sql, [], (error: any, rows: any[]) => {
        if (error) {
            throw error;
        }
        rows.forEach((row: { ACCESS_KEY: any; ACCESS_TOKEN: any; }) => {
            ACCESS_KEY = row.ACCESS_KEY
            ACCESS_TOKEN = row.ACCESS_TOKEN

        })
    })
    return new Promise((resolve) => {
        setTimeout(() => {
            ACCESS_KEY != "";
            ACCESS_TOKEN != "";
            resolve({ACCESS_KEY, ACCESS_TOKEN})
        }, 50)
    })
}


// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
            // devTools: false, // Prevents the user from opening browser developer mode
        },
        width: 450,
        height: 600,
        minWidth: 450,
        minHeight: 600,
        center: true,
        frame: false,
        movable: true,
        focusable: true, // Allows draggable window without disabling buttons and other elements
        minimizable: true,
        maximizable: false,
        resizable: true,
    })


    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(process.env.DIST, 'index.html'))
    }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(createWindow)

// Controls the minimise button on the application
ipcMain.on("minimiseApp", () => {
    win?.minimize();
});

// Controls the maximise button on the application
// If the application is already maximised it will instead
// revert to its unmaximised state
ipcMain.on("maximiseApp", () => {
    if (win?.isMaximized()) {
        win?.unmaximize();
    }
    else {
        win?.maximize();
    }
});

// Controls the close button of the application, this will
// close the app entirely and end the current run of the program
ipcMain.on("closeApp", () => {
    win?.close();
});

// Resizes the window based on specified dimensions
// to dynamically adjust the size based on the current window
ipcMain.on("resizeWindow", (_event, dimensions) => {
    win?.setSize(dimensions.width, dimensions.height)
});

// Re-centers the window to help with the resizing effect
ipcMain.on("centerWindow", () => {
    win?.center();
})

// Re-defines the minimum size of the window depending on
// which window is active
ipcMain.on("defineMinSize", (_event, dimensions) => {
    win?.setMinimumSize(dimensions.width, dimensions.height)
})

// Used to open a link to an external website, 
// uses the user's set default browser
ipcMain.on("openLink", (_event, link) => {
    require('electron').shell.openExternal(link)
})

// API request to IGDB to retrieve data
ipcMain.handle('api-test', async (_event) => {
    try {
        await retrieveAccess()

        fetch(
            "https://api.igdb.com/v4/games",
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client-ID': ACCESS_KEY,
                    'Authorization': 'Bearer ' + ACCESS_TOKEN,
                },
                body: "fields *;"
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
            })
            .catch(error => {
                console.error(error)
            });
    }
    catch (error) {
        console.error(error)
    }
});