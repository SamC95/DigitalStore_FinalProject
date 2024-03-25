// FILE THAT HANDLES ANY FUNCTIONS RELATED TO THE CREATION OF ACCOUNTS, LOGIN AND REMOVAL OF ACCOUNTS

import { ipcMain } from "electron";
const sqlite3 = require('sqlite3').verbose()

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

// Checks if the login details given match those on the database, including checking the hashed password using bycrypt
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

// Gets the account id for a specific user account so it can be stored in sessionStorage to be used for managing certain aspects of the product purchase system
ipcMain.handle('getAccountId', async (_event, username) => {
    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                console.error(error.message)
            }

            let sql = 'SELECT AccountID FROM Users WHERE Username = ?';

            accountDatabase.get(sql, [username], async (error: { message: any; }, row: any) => {
                if (error) {
                    console.error(error.message)
                    reject(error.message)
                }
                else {
                    if (row) {
                        const retrievedId = row.AccountID

                        resolve(retrievedId)
                    }
                    else {
                        resolve(false)
                    }
                }

                accountDatabase.close()
            })
        })
    })
})

ipcMain.handle('deleteAccount', async (_event, accountId) => {
    let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
        if (error) {
            console.error(error.message)
        }

        let deleteUserSql = 'DELETE FROM Users WHERE AccountID = ?'

        accountDatabase.run(deleteUserSql, [accountId], function (error: { message: any; }) {
            if (error) {
                console.error(error.message)
            }
            else {
                console.log('Users table row deleted')
            }
        })

        let deletePurchasesSql = 'DELETE FROM UserPurchases WHERE AccountID = ?'

        accountDatabase.run(deletePurchasesSql, [accountId], function (error: { message: any; }) {
            if (error) {
                console.error(error.message)
            }
            else {
                console.log('UserPurchases table row deleted or not found')
            }
        })

        let deleteRecentlyViewedSql = 'DELETE FROM RecentlyViewed WHERE AccountID = ?'

        accountDatabase.run(deleteRecentlyViewedSql, [accountId], function (error: { message: any; }) {
            if (error) {
                console.error(error.message)
            }
            else {
                console.log('RecentlyViewed table row deleted or not found')
            }
        })

        let deleteBasketSql = 'DELETE FROM BasketProducts WHERE AccountID = ?'

        accountDatabase.run(deleteBasketSql, [accountId], function (error: { message: any; }) {
            if (error) {
                console.error(error.message)
            }
            else {
                console.log('BasketProducts table row deleted or not found')
            }
        })
    })
})

ipcMain.handle('removeProduct', async (_event, accountId, productId) => {
    return new Promise((resolve, reject) => {
        let accountDatabase = new sqlite3.Database('./AccountDatabase.db', sqlite3.OPEN_READWRITE, (error: { message: any; }) => {
            if (error) {
                reject(error.message)
            }
            else {
                let removeProductSql = 'DELETE FROM UserPurchases WHERE AccountID = ? AND ProductID = ?'

                accountDatabase.run(removeProductSql, [accountId, productId], function (error: { message: any; }) {
                    if (error) {
                        reject(error.message)
                    }
                    else {
                        resolve('Product removed successfully')
                    }
                })
            }
        })
    })
})