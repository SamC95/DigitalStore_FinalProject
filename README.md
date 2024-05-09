# Final Year Project: Game Central
## Digital eCommerce & Games Media Application
By [Sam Clark](https://github.com/SamC95)

This project was my final year project submission in my third year at the University of Westminster

API Keys are not included in the GitHub version of this project. You can get your own API keys on the [Twitch Developers](https://dev.twitch.tv/) page and use the [documentation](https://api-docs.igdb.com/#getting-started) to set them up and store them in the included empty Access.db file.

## Contents
* [Project Aims](https://github.com/SamC95/DigitalStore-FinalProject/tree/main#project-aims)
* [Approach](https://github.com/SamC95/DigitalStore-FinalProject/tree/main#approach)
* [Technologies](https://github.com/SamC95/DigitalStore-FinalProject/tree/main#technologies)
* [Project Planning Diagrams](https://github.com/SamC95/DigitalStore-FinalProject/tree/main#project-planning-diagrams)
* [Implementation](https://github.com/SamC95/DigitalStore-FinalProject/tree/main#implementation)
* [Key Learnings](https://github.com/SamC95/DigitalStore-FinalProject/tree/main#key-learnings)
* [Achievements](https://github.com/SamC95/DigitalStore-FinalProject/tree/main#achievements)
* [Challenges](https://github.com/SamC95/DigitalStore-FinalProject/tree/main#challenges)
* [Conclusions](https://github.com/SamC95/DigitalStore-FinalProject/tree/main#conclusions)
* [Credits](https://github.com/SamC95/DigitalStore-FinalProject/tree/main#credits)

## Project Aims
* Develop an eCommerce Desktop Application using React & Electron
* Implement Back-end functionality using Node.js
* Implement an account system with an SQL database
* Provide clear UI/UX design through the use of CSS
* Utilise the [IGDB](https://www.igdb.com/) API to dynamically retrieve product data using JSON
* Provide functionality to search for and view specific products
* Include a checkout system with a basket and purchases
* Implement a product library that reflects product purchases, with sorting and filtering options
* Retain user activity across sessions (Recently viewed products, current basket)

## Approach

### Planning & Analysis

Prior to any design or development, I started by defining the key goals and researching which languages, frameworks and other tools I will utilise for the application.

This involved:

* Research into the IGDB API service and how I could utilise this to dynamically provide up to date products and data to the application, rather than implementing static pages with pre-defined data.
* Looking at the Electron framework and determining its effectiveness in helping me achieve my design goals compared to other desktop application options.
* Performing analysis on similar contemporary applications to determine essential features and possible UI/UX design inspiration.

After these steps were performed, I created a list of essential, non-essential and luxury requirements; from both a functional and non-functional perspective.

Some examples include:

* Sorting Algorithms for Product Library
* Search by Genre, New / Upcoming Release options
* Consistent UI/UX across application
* Video Player on Product Page for YouTube Links from IGDB API

As well as some features that did not end up being implemented in this version, such as:

* Dark Mode / Light Mode Toggle
* Parental Controls

## Technologies

### Front-end

![Static Badge](https://img.shields.io/badge/HTML5-%23E34F26?style=for-the-badge&logo=HTML5&logoColor=white)  
![Static Badge](https://img.shields.io/badge/CSS3-%231572B6?style=for-the-badge&logo=CSS3&logoColor=white)  
![Static Badge](https://img.shields.io/badge/React-%2361DAFB?style=for-the-badge&logo=React&logoColor=white)  
![Static Badge](https://img.shields.io/badge/TypeScript-%233178C6?style=for-the-badge&logo=TypeScript&logoColor=white)

### Back-end

![Static Badge](https://img.shields.io/badge/Electron-%2347848F?style=for-the-badge&logo=Electron&logoColor=white)  
![Static Badge](https://img.shields.io/badge/Node.js-%235FA04E?style=for-the-badge&logo=Node.js&logoColor=white)  
![Static Badge](https://img.shields.io/badge/SQLite-%23003B57?style=for-the-badge&logo=SQLite&logoColor=white)

### Additional

![Static Badge](https://img.shields.io/badge/IGDB%20API-%239147FF?style=for-the-badge&logo=IGDB&logoColor=white)  
![Static Badge](https://img.shields.io/badge/JSON-%23000000?style=for-the-badge&logo=JSON&logoColor=white)  
![Static Badge](https://img.shields.io/badge/npm-%23CB3837?style=for-the-badge&logo=npm&logoColor=white)  
![Static Badge](https://img.shields.io/badge/Jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)  
![Static Badge](https://img.shields.io/badge/VS%20Code-%23007ACC?style=for-the-badge&logo=Visual%20Studio%20Code&logoColor=white)

## Project Planning Diagrams

### Application Navigation Diagram

This diagram was created to define the expected way in which the user can navigate from page to page in the application.

<img src="https://github.com/SamC95/DigitalStore-FinalProject/assets/132593571/713d8a73-b070-45c1-813f-93f7bb2b3cf2" width="800" />

### UI/UX Storyboards

Several storyboards were created to represent each component in the application, with some annotations to make clear some expected interactions.

#### Start, Login & Create Account

<img src="https://github.com/SamC95/DigitalStore-FinalProject/assets/132593571/a0d2a8e9-6b2c-4b9a-9daa-32bc8f91b5c2" width="400" />

#### Store Home Page

<img src="https://github.com/SamC95/DigitalStore-FinalProject/assets/132593571/587e8eb6-d7d1-4393-87be-ffc09833a3ca" width="400" />

#### Search Results

<img src="https://github.com/SamC95/DigitalStore-FinalProject/assets/132593571/a3956bb7-1f84-44c0-a75c-b2f3bfa8f428" width="400" />

#### Product Library

<img src="https://github.com/SamC95/DigitalStore-FinalProject/assets/132593571/fb0109eb-f23e-4d6c-b247-4f8c73b55344" width="400" />

#### Settings

<img src="https://github.com/SamC95/DigitalStore-FinalProject/assets/132593571/6b48d35f-f103-4460-9e44-596efcd32349" width="400" />

#### Basket & Checkout

<img src="https://github.com/SamC95/DigitalStore-FinalProject/assets/132593571/e912a735-d42f-4a3f-aeb1-85614091de87" width="400" />

## Implementation

### Retrieving Product Data

My approach to developing the application was to implement the initial functionality on the front-end for a feature and then implement the back-end functionality afterwards. This allowed for a pretty effective approach but had its challenges at times. I would say one of the biggest hurdles that I encountered during the development of the application was hitting rate limits that the IGDB API has; as such I had to pivot my design to include an extra database that stores the necessary product details so that I can retrieve a large quantity of products at once for user searches.

Here is the front-end function for retrieving new releases:

```javascript
    async function getNewReleases() {
        try {
            localStorage.removeItem('gameList');
            setError(false);
            setSearching(true);
            setCacheRetrieved(false);

            if (Object.keys(newReleaseCache).length !== 0) {
                console.log('Using cached results for new releases')
                const cachedData = Object.values(newReleaseCache)[0];
                setGameList(cachedData);
                localStorage.setItem('gameList', JSON.stringify(cachedData))
                setSearching(false);
                setCacheRetrieved(true);
            }
            else {
                const [currentDate, monthAgoDate] = await setDates();

                const data = await ipcRenderer.invoke('get-new-releases', currentDate, monthAgoDate)

                if (data.length === 0) {
                    console.log('No data')
                    localStorage.setItem('gameList', JSON.stringify(data))
                }
                else {
                    const updatedGameList = await getCovers(data)
                    newReleaseCache = {
                        cachedKey: updatedGameList
                    }

                    setGameList(updatedGameList)
                    localStorage.setItem('gameList', JSON.stringify(updatedGameList))
                }
            }
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setSearching(false);
            setButtonPressed(true);
        }
    }
```

Here is the back-end function for retrieving the new releases from the API:

```javascript
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
        return Promise.resolve(gameList)
    }
    catch (error) {
        console.error(error)
    }
})
```

### Handling Recently Viewed Products

Another feature I want to highlight is the recently viewed section of the application, this provides an easy way for the user to return to the last five products that they have viewed the product pages for.

I implemented it by setting it up to check the current data for that account in the SQL table for recently viewed products and determining if the product the user is currently viewing already exists in the table row or not. If it does then it pushes the list of products by one up until the currently viewed product and then moves that product to the top of the list. If it does not exist already then the entire list is pushed by one and the new product is appended onto the start of the list.

Here is the code that handles this functionality: 

```javascript
ipcMain.handle('addRecentlyViewed', async (_event, accountId, productId, productName) => {
    return new Promise((resolve, reject) => {
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
                            reject(error.message)
                        }
                        else {
                            resolve('Product added successfully')
                        }
                    })
                }
            }
        })
    })
})
```

### Application Screenshots

Below are a couple screenshots showing some application pages and their UI. I wanted to maintain a consistent design across the application so I set out in my requirements that I would maintain a colour palette of dark grey, white and purple across the application; with the exception of any product covers or images. This ensured that each page in the application feels like a natural extension rather than having clashing designs.

#### Search Results:

<img src="https://github.com/SamC95/DigitalStore-FinalProject/assets/132593571/7140c166-b277-4cc6-b19b-dccda7a1b45e" width="800" />

#### Product Page:

<img src="https://github.com/SamC95/DigitalStore-FinalProject/assets/132593571/79971c28-dc45-4baa-b9c6-57c433c64c0f" width="800" />

## Key Learnings

* Understand the critical importance of proper project planning & design phases; as well as being able to be pinpoint essential and non-essential features to ensure that tight deadlines are met.
* Able to utilise React & TypeScript more effectively after having only had limited or no experience with them previously. As this was my first time developing an application using TypeScript and the React experience I had previously was limited to pre-defined GOV.UK components.
* Better understanding of utilising SQL databases to store and retrieve data for a wider range of different purposes compared to prior coursework projects.
* Learnt to use the Electron framework and some of its features like ipcMain/ipcRenderer to communicate between the front-end and back-end of the application effectively.
* Gained more experience with utilising APIs to display data dynamically, and how to properly make use of the JSON data provided by the API within my application.
* Gained more understanding of how to utilise CSS more effectively to design the UI of the application.

## Achievements

* This is the first time that I have developed an application of this scale and I believe I was able to meet my core design & planning goals effectively; including the use of an account system and displaying the appropriate stored data to the user by utilising their unique account id number as a basis for what data is retrieved from the database.
* Maintained a consistent design and ensured that the application worked consistently with as little bugs as possible, and in the event that there were any situations where data may not load due to bugs or API errors; these were appropriately covered through error handling to ensure a good user experience.
* Utilised new languages or frameworks that I had no prior experience with (Electron framework, Node.js, TypeScript) or ones that I only had relatively limited experience with (React, CSS, SQL).

## Challenges

The biggest challenges I faced around the development of the application were related to the IGDB API and ensuring that I was properly retrieving the data I wanted; as well as adjusting my approach with storing the data received so that API rate limits could be avoided as much as possible. Learning how to properly utilise the languages, frameworks and other tools that I decided to use was another key challenge that resulted in some hurdles that I had to overcome during development. I would say the last major challenge was designing the overall style of the application and ensuring that the UI met my initial storyboards as closely as possible.

I also wanted to implement unit testing more effectively but ran into some issues getting it to work consistently due to ContextIsolation changing the behaviour of how ipcRenderer communicates which would result in errors during jest testing. This is an issue I would have liked to resolve and properly implement given more time but I still thoroughly tested my application with manual testing and test cases to ensure that functionality was working as intended.

## Conclusions

Working on this project taught me a few key lessons. I feel that it effectively taught me the importance of proper planning and being flexible with design goals by prioritising what is most important to include. It also taught me that some unexpected roadblocks can occur in development and the importance of properly assigning extra time to account for these situations, an example being when I needed to adjust my usage of the API to store the data into a database to reduce load on the API; this is something that I did not realise during planning would be a hurdle.

There were some small bugs that I was not able to resolve due to time constraints, such as some rare instances where API rate limits still occur on searches, however this is uncommon and if it does occur then the product will only be missing its cover art and all functionality works as intended otherwise. There is also a very rare bug where the SQL database is locked when viewing a product page resulting in some unexpected behaviour with the recently viewed products; however this does not cause any crashes or other unintended consequences.

There were some features that I would have liked to include, such as parental controls to filter results to only a certain maximum age bracket. As well as some aspects of the program that I feel that I could improve with more time, such as making the UI a bit less basic looking and improving the basket and checkout section of the application so that it looks more professional. However, overall I am happy with the final outcome of the application and how I was able to implement the design goals I laid out in the planning an design phases.

## Credits

Credit to [Twitch](https://twitch.tv) for the use of the The Internet Game Database (IGDB) API.

Credit for Icons & Logos used in the application belong to: [Icons8](https://icons8.com/icons), [FlatIcon](https://www.flaticon.com) and [Hubspot](https://blog.hubspot.com/website/css-loading-animation)

Initial Electron Setup was based on an Electron Boilerplate.

All Products retrieved from the IGDB API are Copyright of their respective owners and the application was not designed for commercial purposes, only academic ones.

