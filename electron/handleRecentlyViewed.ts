// FILE USED TO HANDLE THE RECENTLY VIEWED SECTION OF THE VERTICAL NAVIGATION BAR, KEEPS TRACK OF RECENTLY VIEWED PRODUCTS ON AN ACCOUNT BASIS

import { ipcMain } from "electron";
const sqlite3 = require('sqlite3').verbose()

// Used to set up a recently viewed row for an account when it logs in for the first time
ipcMain.handle('setupRecentlyViewed', async (_event, accountId) => {
    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                console.error(error.message)
            }

            let accountCheckSql = 'SELECT * FROM RecentlyViewed WHERE AccountID = ?';

            accountDatabase.get(accountCheckSql, [accountId], async (error: { message: any; }, row: any) => {
                if (error) {
                    reject(error.message)
                }
                else {
                    if (!row) { // If the row doesn't exist, insert new row with the account id
                        let accountAddSql = 'INSERT INTO RecentlyViewed (accountId) VALUES (?)';

                        accountDatabase.run(accountAddSql, [accountId], async (error: { message: any; }) => {
                            if (error) {
                                accountDatabase.close()
                                reject(error.message)
                            }
                            else {
                                accountDatabase.close()
                                resolve('Row added successfully.');
                            }
                        });
                    }
                    else {
                        accountDatabase.close()
                        resolve('Row already exists.');
                    }
                }
            })
        })
    })
})

ipcMain.handle('addRecentlyViewed', async (_event, accountId, productId, productName) => {
    console.log(accountId, productId, productName)

    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                reject(error.message)
            }
            else {
                // Retrieve the data from the database for the current account
                let accountRowSql = 'SELECT * FROM RecentlyViewed WHERE AccountID = ?';

                accountDatabase.get(accountRowSql, [accountId], async (error: { message: any; }, row: any) => {
                    if (error) {
                        reject(error.message)
                    }
                    else {
                        let existingIndex = -1;
                        for (let i = 1; i <= 5; i++) { // Checks to see if the product already exists in the list 
                            if (row[`ProductID${i}`] === productId) {
                                existingIndex = i;
                                break;
                            }
                        }

                        if (existingIndex !== -1) { // If the product does exist, we only push the products up until the position of that product
                            for (let i = existingIndex; i > 1; i--) {
                                let prevProductId = row[`ProductID${i - 1}`];
                                let prevProductName = row[`ProductName${i - 1}`];

                                let updateRowSql = `UPDATE RecentlyViewed SET ProductID${i} = ?, ProductName${i} = ? WHERE AccountID = ?`;
                                accountDatabase.run(updateRowSql, [prevProductId, prevProductName, accountId])
                            }

                            let updateExistingSql = `UPDATE RecentlyViewed SET ProductID1 = ?, ProductName1 = ? WHERE AccountID = ?`;
                            accountDatabase.run(updateExistingSql, [productId, productName, accountId], async (error: { message: any; }) => {
                                if (error) { // After the products up to the current product have been pushed, we move the product to the top of the list
                                    reject(error.message)
                                }
                                else {
                                    resolve('Product moved to top of list')
                                }
                            })
                        }
                        else { // If there is no match, we push the entire list by one, and place the new product at the top of the list
                            for (let i = 5; i > 1; i--) {
                                let prevProductId = row[`ProductID${i - 1}`];
                                let prevProductName = row[`ProductName${i - 1}`];

                                let updateRowSql = `UPDATE RecentlyViewed SET ProductID${i} = ?, ProductName${i} = ? WHERE AccountID = ?`;
                                accountDatabase.run(updateRowSql, [prevProductId, prevProductName, accountId])
                            }

                            // Adds new product to database
                            let newProductSql = `UPDATE RecentlyViewed SET ProductID1 = ?, ProductName1 = ? WHERE AccountID = ?`;
                            accountDatabase.run(newProductSql, [productId, productName, accountId], async (error: { message: any; }) => {
                                if (error) {
                                    accountDatabase.close();
                                    reject(error.message)
                                }
                                else {
                                    accountDatabase.close();
                                    resolve('Product added successfully')
                                }
                            })
                        }
                    }
                })
            }
        })
    })
})

ipcMain.handle('getRecentlyViewed', async (_event, accountId) => {
    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                reject(error.message)
            }
            else { // Get the recently viewed products for the specific user
                let recentlyViewedSql = 'SELECT * FROM RecentlyViewed WHERE AccountID = ?';

                accountDatabase.get(recentlyViewedSql, [accountId], async (error: { message: any; }, row: any) => {
                    if (error) {
                        reject(error.message)
                    }
                    else {
                        const recentlyViewedProducts = [];

                        for (let i = 1; i <= 5; i++) { // Push each of the products onto an array based on their database position
                            if (row[`ProductID${i}`]) {
                                recentlyViewedProducts.push({
                                    id: row[`ProductID${i}`],
                                    name: row[`ProductName${i}`]
                                });
                            }
                        }

                        accountDatabase.close()
                        resolve(recentlyViewedProducts)
                    }
                })
            }
        })
    })
})