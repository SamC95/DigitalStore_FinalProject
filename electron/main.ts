import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'

var ACCESS_KEY = "";
var ACCESS_TOKEN = "";

function delay(ms: number | undefined) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/* 
Retrieves required data to be able to make an API call from database file

NOTE - If project has been downloaded from Github, Access.db is NOT included. 
        Please assign your own access key and token for the IGDB API into an sqlite3 .db file 
        of the same name to gain access to required data.

        This does NOT apply to final project submission where Access.db will be included.

        TODO - IMPLEMENT DYNAMIC RETRIEVAL OF ACCESS TOKEN SO THAT THE PROGRAM CAN DYNAMICALLY
               RETRIEVE A NEW TOKEN WHEN THE PRIOR ONE EXPIRES
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
    const sqlite3 = require('sqlite3').verbose();
    let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
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
    // Should not be an issue for this program's use case however
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

async function retrieveDetails(username: any, emailAddress: any) {
    // Pre-requisite of sqlite3
    const sqlite3 = require('sqlite3').verbose()

    return new Promise((resolve, reject) => {
        // Opens account database
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                console.error(error.message)
            }
            console.log('Connected to the Account database')


            let sql = 'SELECT Username, EmailAddress FROM Users WHERE Username = ? OR EmailAddress = ?';

            accountDatabase.get(sql, [username, emailAddress], (error: { message: any; }, row: any) => {
                if (error) {
                    console.error(error.message);
                    reject(error.message)
                }
                else {
                    const userExists = !!row;

                    resolve(userExists)
                }

                accountDatabase.close()
            });
        });
    });
}

async function checkLoginDetails(username: any, password: any) {
    const sqlite3 = require('sqlite3').verbose()
    const bcrypt = require('bcrypt')

    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                console.error(error.message)
            }
            console.log('Connected to the Account database')

            let sql = 'SELECT Username, Password FROM Users WHERE Username = ?';

            accountDatabase.get(sql, [username], async (error: { message: any; }, row: any) => {
                if (error) {
                    console.error(error.message)
                    reject(error.message)
                }
                else {
                    if (row) {
                        const hashedPassword = row.Password;

                        try {
                            const doesPasswordMatch = await bcrypt.compare(password, hashedPassword);

                            resolve(doesPasswordMatch);
                        }
                        catch (bcryptError: any) {
                            console.error('Error validating details: ', bcryptError)
                            reject(bcryptError.message)
                        }
                    }
                    else {
                        resolve(false)
                    }
                }

                accountDatabase.close()
            })
        })
    })
}

// Retrieves a product's details from the database if it already exists there
async function getGameById(productId: any) {
    const sqlite3 = require('sqlite3').verbose();

    interface GameData {
        id: number,
        name: string,
        releaseDate: string,
        cover: string;
    }

    return new Promise((resolve, reject) => {
        let productDatabase = new sqlite3.Database('./ProductDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                console.error(error.message)
            }

            const sqlQuery = 'SELECT id, name, releaseDate, cover FROM Products WHERE id = ?';

            productDatabase.get(sqlQuery, [productId], (error: { message: any; }, row: GameData) => {
                if (error) {
                    console.error(error.message)
                    reject(error);
                }
                else {
                    if (row) {
                        productDatabase.close()
                        resolve(row)
                    }
                    else {
                        productDatabase.close()
                        resolve(null)
                    }
                }
            });
        });
    });
}

// Inserts or Updates product details into an SQL database, for a specific product based on its ID
async function saveProductDetails(productDetails: any) {
    const sqlite3 = require('sqlite3').verbose();
    const { id, name, releaseDate, cover } = productDetails;

    return new Promise((resolve, reject) => {
        let productDatabase = new sqlite3.Database('./ProductDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                console.error(error.message)
            }

            const newProductQuery = 'INSERT INTO Products (id, name, releaseDate, cover) VALUES (?, ?, ?, ?)';

            const existingProductQuery = 'UPDATE Products SET name = ?, releaseDate = ?, cover = ? WHERE id = ?'

            productDatabase.get('SELECT id FROM Products WHERE id = ?', [id], (error: any, row: any) => {
                if (error) {
                    console.error(error);
                }
                else if (row) {
                    productDatabase.run(existingProductQuery, [name, releaseDate, cover, id], function (error: any) {

                        if (error) {
                            reject(error)
                        }
                        else {
                            resolve(id);
                        }
                    });
                }
                else {
                    productDatabase.run(newProductQuery, [id, name, releaseDate, cover], function (error: any) {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(id)
                        }
                    })
                }
            })
        })
    })
}

// Gets the cover data for a product from the database
async function getImageIdFromDatabase(productId: any) {
    const sqlite3 = require('sqlite3').verbose();

    return new Promise((resolve, reject) => {
        let productDatabase = new sqlite3.Database('./ProductDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                console.error(error.message)
            }

            const sqlQuery = 'SELECT image_id FROM Products WHERE id = ?';

            productDatabase.get(sqlQuery, [productId], (error: { message: any; }, row: any) => {
                if (error) {
                    console.error(error.message)
                    reject(error)
                }
                else {
                    if (row) {
                        productDatabase.close()
                        resolve(row.image_id)
                    }
                    else {
                        productDatabase.close()
                        resolve(null)
                    }
                }
            });
        });
    });
}

// Saves cover images for each product into their respective rows in the database
async function saveImageIdToDatabase(productId: any, imageId: any) {
    const sqlite3 = require('sqlite3').verbose();

    return new Promise((resolve, reject) => {
        let productDatabase = new sqlite3.Database('./ProductDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any }) => {
            if (error) {
                console.error(error.message)
            }

            const newIdQuery = 'UPDATE Products SET image_id = ? WHERE id = ?';

            productDatabase.run(newIdQuery, [imageId, productId], function (error: any) {
                if (error) {
                    reject(error)
                }
                else {
                    resolve(productId)
                }
            })
        })
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
            contextIsolation: false,
            //devTools: false, // Prevents the user from opening browser developer mode
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

// Handles API request for when the user provides a search request on the store page
/*
NOTE : version_parent = null - Removes any separate editions of the same product
       platforms = (6) - Only retrieve results that are available on PC (Microsoft Windows)
       keywords - Removes unofficial or unwanted tags from the retrieved results
       themes != (42) - Removes explicit material from the retrieved results
       limit 50 - Limits the amount of retrieved results to 50
*/
ipcMain.handle('product-search', async (_event, userSearch) => {
    try {
        // Retrives the api key from the database
        await retrieveAccess()

        // Performs the API request
        const response = await fetch(
            "https://api.igdb.com/v4/games", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: "fields *; search " + '"' + userSearch + '";' +
                "where version_parent = null & platforms = (6) & keywords != (413, 24124, 27185, 1603, 2004) & themes != (42); limit 50;"
        })

        // If the response is an error, display that error
        if (!response.ok) {
            throw new Error('Error Status: ' + response.status)
        }

        const data = await response.json();

        const gameList = [];

        for (const game of data) {
            let gameInfo = await getGameById(game.id)

            if (!gameInfo) {
                gameInfo = {
                    id: game.id,
                    name: game.name,
                    releaseDate: game.first_release_date,
                    cover: game.cover
                }

                await saveProductDetails(gameInfo)
            }

            gameList.push(gameInfo)
        }

        return Promise.resolve(gameList);
    }
    catch (error) {
        console.error(error);
    }
})

// Handles the API search when the user selects a genre from the vertical navigation bar
ipcMain.handle('genre-search', async (_event, selectedGenre, numOfResults) => {
    try {
        await retrieveAccess()
        console.log(selectedGenre)

        delay(1000)

        const response = await fetch(
            "https://api.igdb.com/v4/games", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: `fields *;
                where total_rating > 85 & genres = (${selectedGenre}) & version_parent = null & platforms = (6) & keywords != (413, 24124, 27185, 1603, 2004) & themes != (42); limit ${numOfResults};`
        })

        const retrievedData = await response.json();

        const gameList = [];

        for (const game of retrievedData) {
            let gameInfo = await getGameById(game.id)

            if (!gameInfo) {
                gameInfo = {
                    id: game.id,
                    name: game.name,
                    releaseDate: game.first_release_date,
                    cover: game.cover
                }

                await saveProductDetails(gameInfo)
            }

            gameList.push(gameInfo)
        }

        return Promise.resolve(gameList)
    }
    catch (error) {
        console.error(error)
    }
})

// Handles the new releases option of the vertical navigation bar
ipcMain.handle('get-new-releases', async (_event, currentDate, monthAgoDate) => {
    try {
        await retrieveAccess()

        const response = await fetch(
            "https://api.igdb.com/v4/games", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: `fields *;
                    where total_rating_count > 2 & first_release_date < ${currentDate} & first_release_date > ${monthAgoDate} & platforms = (6) & version_parent = null &
                    keywords != (413, 24124, 27185, 1603, 2004) & themes != (42); limit 30;`
        })
        const newReleaseData = await response.json();

        const gameList = [];

        for (const game of newReleaseData) {
            let gameInfo = await getGameById(game.id)

            if (!gameInfo) {
                gameInfo = {
                    id: game.id,
                    name: game.name,
                    releaseDate: game.first_release_date,
                    cover: game.cover
                }

                await saveProductDetails(gameInfo)
            }

            gameList.push(gameInfo)
        }

        /* const gameList = newReleaseData.map((game: {
            cover: any; first_release_date: any; id: any; name: any;
        }) => ({
            id: game.id,
            name: game.name,
            releaseDate: game.first_release_date,
            cover: game.cover
        })); */

        return Promise.resolve(gameList)
    }
    catch (error) {
        console.error(error)
    }
})

/* 
Gets search results for products with a release date between the current date and two months ahead
Search conditions are similar to other search functions, however we use the "hypes" modifier to ensure
that we are receiving results that are products with a reasonable level of popularity/awareness amongst
consumers rather than receiving entirely unknown products
 */
ipcMain.handle('get-upcoming', async (_event, currentDate, upcomingDate) => {
    try {
        await retrieveAccess()

        const response = await fetch(
            "https://api.igdb.com/v4/games", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: `fields *;
                    where hypes > 2 & first_release_date > ${currentDate} & first_release_date < ${upcomingDate} & platforms = (6) & version_parent = null &
                    keywords != (413, 24124, 27185, 1603, 2004) & themes != (42); limit 30;`
        })
        const upcomingData = await response.json();

        const gameList = [];

        // After initial data has been retrieved from the API, we check if data with this ID already
        // exists in ProductDatabase, if it does then we use it to create the product object, if it doesn't
        // we make the object as normally by using the API data we retrieved and then saving the appropriate
        // data points that are relevant to the application into the database.
        for (const game of upcomingData) {
            let gameInfo = await getGameById(game.id)

            if (!gameInfo) {
                gameInfo = {
                    id: game.id,
                    name: game.name,
                    releaseDate: game.first_release_date,
                    cover: game.cover

                }

                console.log(gameInfo)
                await saveProductDetails(gameInfo) // Saving the data should help us reduce load on the API in other components
            }

            gameList.push(gameInfo)
        }
        return Promise.resolve(gameList)
    }
    catch (error) {
        console.error(error)
    }
})

ipcMain.handle('get-featured', async (_event, currentDate, monthAgoDate) => {
    try {
        await retrieveAccess()

        const response = await fetch(
            "https://api.igdb.com/v4/games", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: `fields *;
                where total_rating > 70 & total_rating_count > 2 & first_release_date < ${currentDate} & first_release_date > ${monthAgoDate} & platforms = (6) & version_parent = null & 
                keywords != (413, 24124, 27185, 1603, 2004) & themes != (42); limit 5;`
        })

        const featuredData = await response.json();

        const gameList = featuredData.map((game: {
            cover: any, id: any, name: any, artworks: any, screenshots: any;
        }) => ({
            id: game.id,
            name: game.name,
            cover: game.cover,
            artwork: game.artworks,
            screenshot: game.screenshots
        }));

        return Promise.resolve(gameList)

    }
    catch (error) {
        console.error(error)
    }
})

ipcMain.handle('get-covers', async (_event, game) => {
    try {

        const imageIdFromDatabase = await getImageIdFromDatabase(game)

        if (imageIdFromDatabase) {
            console.log("Retrieved Image ID from database: ", imageIdFromDatabase)
            return Promise.resolve([{ imageId: imageIdFromDatabase }])
        }

        delay(1000)

        const response = await fetch(
            "https://api.igdb.com/v4/covers", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: "fields image_id;" +
                "where game = " + game + ";"
        })

        delay(1000)
        const coverData = await response.json();

        const imageList = [];

        if (!response.ok) {
            throw new Error('Failed to fetch covers: ' + response.status);
        }

        if (Array.isArray(coverData)) {
            for (const imageData of coverData) {
                const imageId = imageData.image_id

                if (imageData.image_id !== undefined && imageId !== null) {
                    imageList.push({
                        imageId: imageData.image_id
                    });

                    await saveImageIdToDatabase(game, imageId);
                }
            }
        } else {
            // Gives error message if the data format is not an array as expected
            console.error('Cover data is not an array:', coverData);
        }

        return Promise.resolve(imageList)
    }
    catch (error) {
        console.error(error)
    }
})

ipcMain.handle('get-screenshots', async (_event, game) => {
    try {
        delay(1000)

        const artworkResponse = await fetch(
            'https://api.igdb.com/v4/screenshots', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: "fields image_id;" +
                "where game = " + game + ";"
        });

        const artworkData = await artworkResponse.json()

        const imageList = [];

        // Displays the response from the API if it is an error
        if (!artworkResponse.ok) {
            throw new Error('Failed to fetch artwork: ' + artworkResponse.status);
        }

        if (Array.isArray(artworkData)) {
            for (const artworkItem of artworkData) {
                await delay(250); // Delay before fetching data for each game
                if (artworkItem.image_id !== undefined) {
                    console.log(artworkItem);
                    imageList.push({
                        imageId: artworkItem.image_id,
                    });
                }
            }
        } 
        else {
            // Gives error message if the data format is not an array as expected
            console.error('Artwork data is not an array:', artworkData);
        }

        return imageList;
    }
    catch (error) {
        console.error(error)
    }
})

ipcMain.handle('get-videos', async (_event, productId) => {
    try {
        delay(1000)

        const videoResponse = await fetch(
            'https://api.igdb.com/v4/game_videos', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: "fields video_id;" +
                "where game = " + productId + ";"
        });

        const videoData = await videoResponse.json()

        const videoList = [];

        // Displays the response from the API if it is an error
        if (!videoResponse.ok) {
            throw new Error('Failed to fetch artwork: ' + videoResponse.status);
        }

        if (Array.isArray(videoData)) {
            for (const video of videoData) {
                await delay(250); // Delay before fetching data for each game
                if (video.video_id !== undefined) {
                    console.log(video);
                    videoList.push({
                        videoId: video.video_id,
                    });
                }
            }
        } else {
            // Gives error message if the data format is not an array as expected
            console.error('Video data is not an array:', videoData);
        }

        return videoList;
    }
    catch (error) {
        console.error(error)
    }
})

ipcMain.handle('get-genres', async (_event, genreIds) => {
    try {
        delay(1000)

        const genreResponse = await fetch(
            'https://api.igdb.com/v4/genres', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: "fields name;" +
                "where id = " + `(${genreIds.join(',')})` + ";"
        });

        const genreData = await genreResponse.json()

        const genreList = [];

        // Displays the response from the API if it is an error
        if (!genreResponse.ok) {
            throw new Error('Failed to fetch genre: ' + genreResponse.status);
        }

        if (Array.isArray(genreData)) {
            for (const genre of genreData) {
                await delay(250); // Delay before fetching data for each game
                if (genre.name !== undefined) {
                    console.log(genre);
                    genreList.push({
                        genre: genre.name,
                    });
                }
            }
        } else {
            // Gives error message if the data format is not an array as expected
            console.error('Genre data is not an array:', genreData);
        }

        return genreList;
    }
    catch (error) {
        console.error(error)
    }   
})

ipcMain.handle('get-product-by-id', async (_event, productId) => {
    try {
        await retrieveAccess()
        console.log(productId)

        const response = await fetch(
            "https://api.igdb.com/v4/games", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: "fields *;" + "where id = " + productId + ";"
        })

        if (!response.ok) {
            throw new Error('Error Status: ' + response.status)
        }

        const data = await response.json();

        const productData = data.map((game: {
            id: any, name: any, screenshots: any, videos: any, genres: any,
            first_release_date: any, involved_companies: any, similar_games: any, summary: any;
        }) => ({
            id: game.id,
            name: game.name,
            screenshots: game.screenshots,
            videos: game.videos,
            genres: game.genres,
            releaseDate: game.first_release_date,
            companies: game.involved_companies,
            similarGames: game.similar_games,
            summary: game.summary
        }))

        return productData
    }
    catch (error) {
        console.error(error);
    }
})

// Handles the account creation process
ipcMain.handle('account-create', async (_event, username, emailAddress, password) => {
    try {
        await accountCreation(username, emailAddress, password)
    }
    catch (error) {
        console.error(error)
    }
})

// Used to check that the username and email address do not already exist in the database
ipcMain.handle('check-details', async (_event, username, emailAddress) => {
    try {
        const userExists = await retrieveDetails(username, emailAddress)
        console.log(userExists)

        if (userExists) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.error(error)
    }
})

// Used to check that the details being used to attempt to login exist in the database
ipcMain.handle('login-details', async (_event, username, password) => {
    try {
        const validUser = await checkLoginDetails(username, password)
        console.log(validUser)

        if (validUser) {
            return true
        }
        else {
            return false
        }
    }
    catch (error) {
        console.error(error)
    }
})