// FILE FOR ALL THE IPCMAIN FUNCTIONS THAT CALL THE IGDB DATABASE FOR PRODUCT DATA

import { ipcMain } from "electron";

var ACCESS_KEY = "";
var ACCESS_TOKEN = "";
var CLIENT_SECRET = "";
var LAST_UPDATED = "";

function delay(ms: number | undefined) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/* 
Retrieves required data to be able to make an API call from database file

NOTE - If project has been downloaded from Github, Access.db is not included. 
        Please assign your own access key and token for the IGDB API into an sqlite3 .db file 
        of the same database name and table names to gain access to required data.

        This does not apply to final project submission where Access.db will be included.
*/
async function retrieveAccess() {
    const sqlite3 = require('sqlite3').verbose();
    const currentDate = new Date();

    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database('./Access.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                reject(error)
            }
        })

        let sql = 'SELECT ACCESS_KEY, ACCESS_TOKEN, CLIENT_SECRET, LAST_UPDATED FROM AccessData WHERE NAME = "Retrieve_Data"'

        db.get(sql, [], async (error: any, row: any) => {
            if (error) {
                reject(error)
            }

            if (!row) {
                reject(new Error('No data found in table'));
            }

            ACCESS_KEY = row.ACCESS_KEY
            ACCESS_TOKEN = row.ACCESS_TOKEN
            CLIENT_SECRET = row.CLIENT_SECRET
            LAST_UPDATED = row.LAST_UPDATED

            // If the access token has not been updated before (LAST_UPDATED set to null on database) then retrieves a new access token and updates the date appropriately
            if (!LAST_UPDATED) {
                try {
                    const newAccessToken = await refreshAccess(ACCESS_KEY, CLIENT_SECRET);
                    ACCESS_TOKEN = newAccessToken // Update ACCESS_TOKEN with the new access token from the Twitch.tv authentication request

                    // Updates the database with the new access token and the current date/time
                    await db.run('UPDATE AccessData SET ACCESS_TOKEN = ?, LAST_UPDATED = ? WHERE NAME = "Retrieve_Data"', [newAccessToken, currentDate.toISOString()])

                    resolve({ ACCESS_KEY, ACCESS_TOKEN }) // Resolves the function
                }
                catch (error: any) {
                    reject(error)
                }
            }
            else {
                const lastUpdateDate = new Date(LAST_UPDATED)

                // Updates the access token and last updated columns on the database if it has been more than 30 days since the last update
                // We compare the difference between the current time and last update time. (30 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds/second)
                if (currentDate.getTime() - lastUpdateDate.getTime() >= 30 * 24 * 60 * 60 * 1000) {
                    const newAccessToken = await refreshAccess(ACCESS_KEY, CLIENT_SECRET);
                    ACCESS_TOKEN = newAccessToken // Update ACCESS_TOKEN with the new access token from the Twitch.tv authentication request

                    // Updates the database with the new access token and the current date/time
                    await db.run('UPDATE AccessData SET ACCESS_TOKEN = ?, LAST_UPDATED = ? WHERE NAME = "Retrieve_Data"', [newAccessToken, currentDate.toISOString()])
                }
                resolve({ ACCESS_KEY, ACCESS_TOKEN }) // Resolves the function
            }
        })
    })
}

async function refreshAccess(accessKey: any, clientSecret: any) {
    try { // Retrieves a new access token from the Twitch.tv authentication using the access key and client secret in the database
        const response = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${accessKey}&client_secret=${clientSecret}&grant_type=client_credentials`, {
            method: 'POST'
        })

        if (!response.ok) {
            throw new Error(`Failed to refresh access details: ${response.statusText}`)
        }

        const responseData = await response.json(); // Await the response from the request

        return responseData.access_token // Returns the access token that has been retrieved
    }
    catch (error: any) {
        throw new Error(`Failed to refresh access: ${error.message}`)
    }
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

// Gets the product data for the main featured products on the store main page
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

// Gets the cover art for each product
ipcMain.handle('get-covers', async (_event, game) => {
    try {
        // First checks if they exist already in the database
        const imageIdFromDatabase = await getImageIdFromDatabase(game)

        if (imageIdFromDatabase) { // If product cover exists in database then retrieve it from there
            return Promise.resolve([{ imageId: imageIdFromDatabase }])
        }

        delay(1000)
        // If not in database, fetch it from API
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
                    // After the data has been retrieved from the API, store it in the database
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

// Retrieves the video url for a youtube video associated with the product from the API.
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
            throw new Error('Failed to fetch video: ' + videoResponse.status);
        }

        if (Array.isArray(videoData)) {
            for (const video of videoData) {
                await delay(250); // Delay before fetching data for each game
                if (video.video_id !== undefined) {
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

// Retrieves the genres that the product has associated with it
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

// Retrieves the companies involved with the creation of the product
ipcMain.handle('get-involved-companies', async (_event, productId) => {
    try {
        delay(1000)

        const involvedCompanies = await fetch(
            'https://api.igdb.com/v4/involved_companies', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Client-ID': ACCESS_KEY,
                'Authorization': 'Bearer ' + ACCESS_TOKEN,
            },
            body: "fields company, developer, publisher;" +
                "where game = " + productId + ";"
        }); // API returns a company based on id, and boolean results for developer and publisher

        const involvedData = await involvedCompanies.json()

        const companiesList = [];

        // Displays the response from the API if it is an error
        if (!involvedCompanies.ok) {
            throw new Error('Failed to fetch involved companies: ' + involvedCompanies.status);
        }

        if (Array.isArray(involvedData)) {
            for (const data of involvedData) {
                await delay(250); // Delay before fetching data for each game

                if (data.company !== undefined) {
                    const companyResponse = await fetch(
                        'https://api.igdb.com/v4/companies', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Client-ID': ACCESS_KEY,
                            'Authorization': 'Bearer ' + ACCESS_TOKEN,
                        },
                        body: "fields name;" +
                            "where id = " + data.company + ";"
                    });

                    const companyName = await companyResponse.json();

                    companiesList.push({
                        company: companyName[0].name,
                        developer: data.developer,
                        publisher: data.publisher
                    }); // Push each company involved with the product onto list of companies, with the boolean values for developer/publisher

                }
            }
        }
        else {
            // Gives error message if the data format is not an array as expected
            console.error('Company data is not an array:', involvedData);
        }

        return companiesList;
    }
    catch (error) {
        console.error(error)
    }
})

// Retrieves a product based on a specific ID, used when we only want to retrieve a 
// single product rather than a batch of products based on some condition (genre, release date, etc.)
ipcMain.handle('get-product-by-id', async (_event, productId) => {
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
            body: "fields *;" + "where id = " + productId + ";"
        }) // Gets all the fields for the product with the specified ID number

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
        })) // Creates an object of the product with the data that is relevant to the application, filtering out the data that is not relevant

        return productData
    }
    catch (error) {
        console.error(error);
    }
})