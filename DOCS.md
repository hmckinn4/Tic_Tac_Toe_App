DOCS


Plan:

Components:
Redis Data base

Node Express backend 

JavaScript Front End.



 System design / Overview:

Database Schema:  

Game (table) Id (column)
Players (column) 
Player1’s moves (column)  (column, array of a vertices) int 
Player2’s moves (column)  (column, array of a vertices) int 
Winner (column, consists of a player)
Loser (column, consists of a player)


Player (table)
ID (column)
Wins (column) int 
Losses(column) int


Logic:

Each player (table) has  moves (column). The front end renders the board. If box 1 in the board is clicked by player 1 for instance, the number 1 is sent to the player's moves column.

Each player's moves should be an array of vertices for that game. There should be an array of vertices which contains every combinatorial winning sequence. For example, if the matrix / graph is represented as 
123
456
789

Then any 3 adjacent matrices / vertices would win.

So the program would iterate, after every decision of the player (button / box click) over the player's moves (which is an array of matrices / vertices). If any 3 adjacent matches one of the winning sequences (all 3 number combinations stored in an array) .

If vertex / matrix has been used (box on the board has been clicked) it can't be used again during that game.

If all 9 vertices / matrices have been used, immediately end the game and take appropriate actions throughout the app. 


Actionable steps:

I want to start by getting the DB schema made, and the DB up and running to where I can curl into it.

DB

Step 1: Install Redis and
    `brew install redis`
    `redis-server`

Step 2: Connect to Redis server in CLI
    `redis-cli`

Step 3: Initialize Game Placeholder and Initialize Player Placeholder:
    `HSET game:placeholder players "" player1Moves "" player2Moves "" winner "" loser ""`

    HSET player:placeholder wins 0 losses 0


Backend

## Step 1: Initialize a Node.js Application: Use npm (Node Package Manager) to create a package.json file, which will keep track of your project's dependencies and other configurations.

    `npm init -y` 

The -y flag automatically fills the package.json with default values.

## Step: 2 Install Dependencies: Install Express, Redis, and CORS (Cross-Origin Resource Sharing) middleware. CORS is essential for allowing your frontend to communicate with your backend if they are served from different origins.


Setting Up Express Server


## Step 3: Create an Entry Point File: Create a file named index.js in your project root. This file will be the entry point for your application.

## Step 4: Set Up a Basic Express Server: Open index.js in VSCode and set up a basic Express server:

index.js code does the following:

Imports the necessary modules.
Initializes an Express app.
Sets up middleware for CORS and JSON parsing.
Creates a Redis client connected to your local Redis server.
Defines a root route that simply confirms the server is running.
Starts the server on the specified port.


## Step 5: Run Your Server: Start your server by running the following command in your terminal:

`node index.js`


Visit http://localhost:3000 in your browser to see if your server is running correctly.


## Next Steps: Implementing Game Logic


Creating a New Game: An endpoint to initialize a new game in Redis with a unique ID.
Making a Move: Endpoints for players to make moves, which will update the game state in Redis.
Checking for a Winner: Logic to determine if the current state of the game meets any win conditions after each move.
Handling a Draw: Identifying when the game ends in a draw (all cells filled without a winner).
As you implement these features, remember to test each part thoroughly to ensure your game logic is working as expected. Afterward, you'll be ready to start working on the frontend that will interact with these backend services.


## Step 6 Backend Implementation
    Adjusting the Game Initialization Logic
File: index.js

Modify your game creation endpoint to initialize a game without needing to handle multiple players joining. Instead, you'll track the player's moves and the computer's moves. Also, introduce a flag to indicate whose turn it is.


## Step 7 Implementing the Computer's Move
The computer's move can be as simple as choosing a random open spot. This function could be part of your move endpoint, called whenever it's the computer's turn.

## Step 8 Game Logic and Interaction
File: app.js

You'll need to implement the frontend logic to handle starting a new game, making moves, and updating the UI based on the game state.

For the sake of simplicity, this guide won't cover the complete implementation but will give you an idea of how to start:


## Step 9: Finalize Backend Move Logic
Ensure your backend can correctly process a player's move, update the game state accordingly, and then generate and process a move for the computer. This involves:

Validating the player's move to ensure it's in an unoccupied space.
Checking if the player's move results in a win or a draw.
If the game is still ongoing, calculating the computer's move and updating the game state.
Again, checking if the computer's move results in a win or a draw.
Key Concepts to Implement:

Win Condition Checking: Implement a function to check if a set of moves (either player or computer) is a winning combination.
Draw Condition Checking: If all 9 spaces are filled and there's no winner, the game ends in a draw.

## Step 10: Develop the Game Board on the Frontend
Start by dynamically generating the game board when a new game is initiated. Each spot on the board can be a button or a clickable div that, when clicked, sends the move to the backend.

Implementation Highlights:

Dynamically Generate Game Board: Use JavaScript to create a 3x3 grid when the game starts.
Handle Click Events: Attach event listeners to each grid item to capture player moves.
Update the Board: After each move (by either the player or the computer), update the board to reflect the current state.


## Step 11: Start New Game and Communicate with Backend
Implement the functionality to start a new game from the frontend, which involves calling the backend to create a new game instance and then displaying the game board ready for play.

Starting a New Game: Implement the startNewGame function to call your backend's endpoint to start a new game. The backend should return who starts first. If the computer is to start, immediately make a move on behalf of the computer.
Displaying Who Starts: Indicate on the frontend who will make the first move.

## Step 12: Make Moves and Update Game State
After initializing the game board and determining who starts, implement the logic for making moves. This includes sending the player's move to the backend, receiving the updated game state, and then updating the UI to reflect both the player's and the computer's moves.

Critical Features:

Sending Moves to Backend: When a player selects a spot, send that move to the backend and receive the updated game state.
Updating the UI: Based on the response from the backend, update the game board to reflect the latest moves.