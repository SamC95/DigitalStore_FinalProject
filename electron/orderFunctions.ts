// FILE FOR ALL THE FUNCTIONS RELATED TO ORDERING PRODUCTS AND RETRIEVING PRODUCTS FROM THE DATABASE WITHOUT API CALLS INVOLVED

import { ipcMain } from "electron";
const sqlite3 = require('sqlite3').verbose()

async function generateOrderID(accountDatabase: { get: (arg0: string, arg1: number, arg2: (error: { message: any; }, row: any) => void) => void; }) {
    var isUnique = false;
    var newId = 0;

    // Loops through process of creating a random 9 digit and checking if it exists in the database 
    // until the random number does not exist on the database.
    while (isUnique == false) {
        newId = Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000;

        const sql = 'SELECT COUNT(*) as count FROM UserPurchases WHERE OrderID = ?'

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

ipcMain.handle('addToBasket', async (_event, accountId, productId, productName, productCover, productPrice, productGenres) => {
    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                reject(error.message)
            }
            else { // Check if the product already exists in the basket specifically for this account
                let checkBasketSql = 'SELECT * FROM BasketProducts WHERE AccountID = ? AND ProductID = ?'

                accountDatabase.get(checkBasketSql, [accountId, productId], async (error: { message: any; }, row: any) => {
                    if (error) {
                        reject(error.message)
                    }
                    else {
                        if (!row) { // If there is no match in the database, add the product to the basket for this account
                            let addToBasketSql = 'INSERT INTO BasketProducts (AccountID, ProductID, ProductName, ' +
                                'ProductCover, ProductPrice, ProductGenres) VALUES (?, ?, ?, ?, ?, ?)'

                            let values = [accountId, productId, productName, productCover, productPrice, productGenres]

                            accountDatabase.run(addToBasketSql, values, function (error: { message: any; }) {
                                if (error) {
                                    reject(error.message)
                                }
                                else {
                                    resolve(`Product ${productId} added to basket for this account`)
                                }
                            })
                        }
                        else {
                            resolve(`Product ${productId} already exists in basket database for this account`)
                        }
                    }
                })
            }
        })
    })
})

ipcMain.handle('checkBasket', async (_event, accountId, productId) => {
    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                reject(error.message)
            }
            else { // Checks if a specific product exists for that user in the basket, used to disable the add to basket button
                let checkBasketSql = 'SELECT * FROM BasketProducts WHERE AccountID = ? AND ProductID = ?'

                accountDatabase.get(checkBasketSql, [accountId, productId], async (error: { message: any; }, row: any) => {
                    if (error) {
                        reject(error.message)
                    }
                    else {
                        if (!row) {
                            resolve(false)
                        }
                        else {
                            resolve(true)
                        }
                    }
                })
            }
        })
    })
})

ipcMain.handle('checkAccountPurchases', async (_event, accountId, productId) => {
    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                reject(error.message)
            }
            else { // Checks if a specific product exists for that user in the purchase database, used to disable the add to basket button
                let checkPurchasesSql = 'SELECT * FROM UserPurchases WHERE AccountID = ? AND ProductID = ?'

                accountDatabase.get(checkPurchasesSql, [accountId, productId], async (error: { message: any; }, row: any) => {
                    if (error) {
                        reject(error.message)
                    }
                    else {
                        if (!row) {
                            resolve(false)
                        }
                        else {
                            resolve(true)
                        }
                    }
                })
            }
        })
    })
})

ipcMain.handle('getUserBasket', async (_event, accountId) => {
    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                reject(error.message)
            }
            else { // Retrieves all rows where the table has the specified account id number
                let userBasketSql = 'SELECT ProductID, ProductName, ProductCover, ProductPrice, ProductGenres FROM BasketProducts WHERE AccountID = ?'

                accountDatabase.all(userBasketSql, [accountId], async (error: { message: any; }, rows: any) => {
                    if (error) {
                        reject(error.message)
                    }
                    else {
                        if (!rows) { // If no match then returns null
                            resolve(null)
                        }
                        else { // If match then we map the data to an object to be passed to the component
                            const basketList = rows.map((row: {
                                ProductID: any; ProductName: any;
                                ProductCover: any; ProductPrice: any; ProductGenres: any;
                            }) => ({
                                ProductID: row.ProductID,
                                ProductName: row.ProductName,
                                ProductCover: row.ProductCover,
                                ProductPrice: row.ProductPrice,
                                ProductGenres: JSON.parse(row.ProductGenres)
                            }));

                            resolve(basketList)
                        }
                    }
                })
            }
        })
    })
})

ipcMain.handle('removeFromBasket', async (_event, accountId, productId) => {
    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                reject(error.message)
            }
            else { // Deletes the specific product that the user has removed from the basket
                let removalSql = 'DELETE FROM BasketProducts WHERE AccountID = ? AND ProductID = ?';

                accountDatabase.run(removalSql, [accountId, productId], function (error: { message: any; }) {
                    if (error) {
                        reject(error.message)
                    }
                    else {
                        resolve('Product successfully removed')
                    }
                })
            }
        })
    })
})

ipcMain.handle('addPurchase', async (_event, accountId, productId, productName, productCover, productGenres, costOfPurchase) => {
    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, async (error: { message: any; }) => {
            if (error) {
                reject(error.message)
            }
            else {
                const orderId = await generateOrderID(accountDatabase) // Creates an order number for each purchased product

                let addPurchaseSql = 'INSERT INTO UserPurchases (AccountID, ProductID, ProductName, ' +
                    'ProductCover, ProductGenres, OrderID, CostOfPurchase) VALUES (?, ?, ?, ?, ?, ?, ?)'

                let values = [accountId, productId, productName, productCover, productGenres, orderId, costOfPurchase]

                accountDatabase.run(addPurchaseSql, values, function (error: { message: any; }) { // Inserts the product details into the UserPurchases table of the database
                    if (error) {
                        reject(error.message)
                    }
                    else {
                        resolve(`Product ${productId} added to owned products for this account with Order id: ${orderId}`)
                    }
                })
            }
        })
    })
})