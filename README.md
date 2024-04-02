# README for TIC_TAC_TOE_APP

## Overview

This repository contains the code for a simple Tic Tac Toe game which can be played online. The game has been implemented using JavaScript for the frontend and Node.js with Express for the backend. A Redis database is used to store the game state and player statistics.

## Getting Started

To play the game, navigate to the following URL: [Tic Tac Toe Game](http://152.7.177.71:3000/).

## Documentation

Refer to `DOCS.md` for a comprehensive guide on the system design, including components, database design, and logic.

## Components

- **Redis Database**: Stores the game and player data.
- **Node Express Backend**: Handles game logic and interacts with the Redis database.
- **JavaScript Frontend**: Manages user interaction and displays the game board.

## Quick Start

1. Install Redis:
    ```shell
    brew install redis
    redis-server
    ```
2. Connect to Redis server:
    ```shell
    redis-cli
    ```
3. Initialize the database schema (not seemingly necesssary as these commands inline with functionality of the game)
    ```shell
    HSET game:placeholder players "" player1Moves "" player2Moves "" winner "" loser ""
    HSET player:placeholder wins 0 losses 0
    ```
4. Set up the backend:
    - Initialize the Node.js application:
        ```shell
        npm init -y
        ```
    - Install dependencies (Express, Redis, CORS):
        ```shell
        npm install express redis cors
        ```
    - Start the backend server:
        ```shell
        node index.js
        ```

## Development

The game's logic is handled by the backend, which includes routes for starting a new game, making moves, and determining the winner or if the game is a draw.

On the frontend, `index.html` presents the game's interface, and `app.js` handles the gameplay mechanics, updating the board, and communicating with the backend.

## Contributing

Contributions to the game's codebase are welcome. Please follow the standard fork-and-pull request workflow.

## License



---
