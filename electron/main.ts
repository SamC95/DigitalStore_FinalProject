import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'

var ACCESS_KEY = "";
var ACCESS_TOKEN = "";

// Retrieves required data from database file
/* 
NOTE - If project has been downloaded from Github, Access.db is NOT included. 
        Please assign your own access key and token for the IGDB API into an sqlite3 .db file 
        of the same name to gain access to required data.

        This does NOT apply to final project submission where Access.db will be included.
*/
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
            resolve({ ACCESS_KEY, ACCESS_TOKEN })
        }, 50)
    })
}

async function accountCreation(username: any, emailAddress: any, password: any) {
    // Imports the bcrypt library and sets a salt quantity for encrypting the password
    const bcrypt = require('bcrypt')
    const hashSalt = 10;

    const hashedPassword = await bcrypt.hash(password, hashSalt);

    // Opens the account database so that the user details can be added to it 
    const sqplite3 = require('sqlite3').verbose();
    let accountDatabase = new sqplite3.Database('./AccountDatabase.db', sqplite3.OPEN_READWRITE, (error: { message: any; }) => {
        if (error) {
            console.error(error.message)
        }
        console.log('Connected to the Account database')
    })

    // Waits for the generateUserID function to complete so that a random unique 7 digit account id number has been assigned
    const accountId = await generateUserID(accountDatabase)

    // sql query for inserting the user's provided details into the database alongside the ID that has been assigned to them
    let sql = 'INSERT INTO Users (AccountID, Username, EmailAddress, Password) VALUES (?, ?, ?, ?)'

    // the variables that will be used in the sql query
    const params = [accountId, username, emailAddress, hashedPassword]

    // Runs the sql query and either logs an error if unsuccessful or a success message
    accountDatabase.run(sql, params, (error: { message: any; }) => {
        if (error) {
            console.error(error.message);
        }
        else {
            console.log('User ' + username + ' added to the database with hashed password')
        }

        // Closes the database after it has been used as needed
        accountDatabase.close()
    })
}

async function generateUserID(accountDatabase: { get: (arg0: string, arg1: number, arg2: (error: { message: any; }, row: any) => void) => void; }) {
    var isUnique = false;
    var newId = 0;

    // Loops through process of creating a random 7 digit and checking if it exists in the database 
    // until the random number does not exist on the database.

    // DEVNOTE -- In a scenario where there are a lot of users (i.e. in the 7 digit amount) then
    // this could potentially be a bottleneck on the application if the loop were to get stuck
    // checking values repeatedly for a long period of time until it finds a unique one
    while (isUnique == false) {
        newId = Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;

        const sql = 'SELECT COUNT(*) as count FROM Users WHERE AccountID = ?'

        const isUniquePromise = new Promise<boolean>((resolve, reject) => {
            accountDatabase.get(sql, newId, (error: { message: any; }, row: any) => {
                if (error) {
                    reject(error)
                }
                else {
                    resolve(row.count === 0);
                }
            })
        })

        isUnique = await isUniquePromise

        await new Promise(resolve => setTimeout(resolve, 50))
    }

    return newId;
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

// Handles API request for when the user provides a search request on the store page
/*
NOTE : version_parent = null - Removes any separate editions of the same product
       platforns = (6) - Only retrieve results that are available on PC (Microsoft Windows)
       keywords != (413) - Removes unofficial games from the retrieved results
       themes != (42) - Removes explicit material from the retrieved results
       limit 20 - Limits the amount of retrieved results to 20
*/
ipcMain.handle('product-search', async (_event, userSearch) => {
    try {
        await retrieveAccess()

        fetch(
            "https://api.igdb.com/v4/games", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: "fields *; search " + '"' + userSearch + '";' +
                "where version_parent = null & platforms = (6) & keywords != (413) & themes != (42); limit 20;"
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

ipcMain.handle('account-create', async (_event, username, emailAddress, password) => {
    try {
        await accountCreation(username, emailAddress, password)
    }
    catch (error) {
        console.error(error)
    }
})
