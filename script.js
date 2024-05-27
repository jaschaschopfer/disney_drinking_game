const questionApp = document.querySelector('#questionApp'); //save div element with the ID 'questionApp' in the variable questionApp
const weiterButton = document.querySelector('#weiterButton'); //save button element with the ID 'weiterButton' in the variable weiterButton
const resetButton = document.querySelector('#resetButton'); //save button element with the ID 'resetButton' in the variable resetButton
const loadingBar = document.querySelector('#loading-bar'); //save div element with the ID 'loading-bar' in the variable loadingBar
const teamButton = document.querySelector('#teamButton'); //save button element with the ID 'teamButton' in the variable teamButton
const gameStats = document.querySelector('#gameStats'); //save div element with the ID 'gameStats' in the variable gameStats
const playerProgressBars = document.querySelector('#playerProgressBars');   //save div element with the ID 'playerProgressBars' in the variable playerProgressBars
let allIds = []; //Array für alle IDs erstellen



// INIT FUNCTIONS - Get the necessary data and set up the site
init();
weiterButton.addEventListener('click', nextQuestionPlease); //if weiterButton is clicked, nextQuestionPlease function is called

async function init() {
    await getAllIds(); //get all IDs from the API
    startscreen(); //show the startscreen
}



// CONTENT FUNCTIONS -- Change content on site when called
function startscreen() {
    questionApp.innerHTML = `
    <h1>🥂Drinksney🥂</h1>
    <h2>The most family-friendly drinking game ever!</h2>
    <h3>✨ Look at those wonderful rules ✨</h3>
    <p>🥤 Take a sip for every wrong answer!</p>
    <p>🤔 You guess until you get it right!</p>
    <p>👉 Get it first try and decide who's next!</p>
    <p>🏁 First with 20 sips finishes the whole magic potion</p>
    `; // Load the content of the startscreen into the questionApp div element
    weiterButton.innerText = "Start the magic!"; // Set the text of the weiterButton
    showButton(weiterButton); // Make the weiterButton visible (because it was hidden initially on the loading screen)
    hideButton(resetButton); // Hide the resetButton
    showButton(teamButton); // Make the teamButton visible
    loadingBar.style.display = 'none'; // Hide the loading bar
    gameStats.style.display = 'none';   // Hide the gameStats div element
}

function createQuestion(figure, randomName1, randomName2) {
    let buttonNames = [figure.data.name, randomName1, randomName2]; // Create an array with all button names (including the correct answer (first element))
    buttonNames.sort(() => Math.random() - 0.5);    // Shuffle the array to randomize button positions

    let question = document.createElement('div'); // Create a new div element
    question.innerHTML = `
    <h2>Name the figure!</h2>
    <img src="${figure.data.imageUrl}" alt="Image of searched figure" id="questionImage">
    <div>
        <button id="button1">${buttonNames[0]}</button>
        <button id="button2">${buttonNames[1]}</button>
        <button id="button3">${buttonNames[2]}</button>
    </div>
    `; // Set the content of the div element, including the character image and three buttons

    questionApp.innerHTML = ""; // Clear the content of the div element
    questionApp.appendChild(question); // Append the div element to the body

    weiterButton.innerText = "Skip!"; // Change the text of the weiterButton
    showButton(weiterButton); // Make the weiterButton visible (in case it was hidden on the last screen)
    hideButton(teamButton); // Hide the teamButton
    showButton(resetButton); // Make the resetButton visible (in case it was hidden on the last screen)
    teamButton.style.display = 'none'; // Hide the team div element
    gameStats.style.display = 'none'; // Hide the gameStats div element (in case it was visible on the last screen)

    // Add event listeners to all buttons
    document.querySelector('#button1').addEventListener('click', () => {
        evaluateAnswer(buttonNames[0], figure.data.name, 'button1'); //send the clicked button name, the correct answer and the button ID to the evaluateAnswer function
        hideButton(weiterButton);
    });

    document.querySelector('#button2').addEventListener('click', () => {
        evaluateAnswer(buttonNames[1], figure.data.name, 'button2'); //send the clicked button name, the correct answer and the button ID to the evaluateAnswer function
        hideButton(weiterButton);
    });

    document.querySelector('#button3').addEventListener('click', () => {
        evaluateAnswer(buttonNames[2], figure.data.name, 'button3'); //send the clicked button name, the correct answer and the button ID to the evaluateAnswer function
        hideButton(weiterButton);
    });
}

function evaluateAnswer(clickedAnswer, correctAnswer, buttonX) {
    if (clickedAnswer === correctAnswer) { // Check if the clicked answer is the correct answer
        let clickedButton = document.querySelector(`#${buttonX}`); // Get the clicked button element
        clickedButton.style.backgroundColor = "green";

        setTimeout(() => {
            if (localStorage.getItem("currentPlayer")) { // Check if the currentPlayer has saved gulps (if so, the player guessed wrong before)
            questionApp.innerHTML = "";
            providePlayerChoices(); // Provide player choices to assign the gulps (from the wrong guesses before) to the correct player
            }
            else {
                firstTryCorrect(); // If the player guessed right on the first try, show the firstTryCorrect screen
            }
        }, 1000); // Delay the execution of clearing the question app and providing player choices by 1 second to show green color of button before continuing
        return true;
    
    } else {
        let clickedButton = document.querySelector(`#${buttonX}`);
        clickedButton.style.backgroundColor = "red";
        addGulpToCurrentPlayer(); // Eachtime a wrong answer is clicked, add one gulp to the temporary player 'currentPlayer' (gulps will be added to the correct player later on)
        return false;
    }
}

function providePlayerChoices() { //this function is called after the player clicked the correct answer but had wrong guesses before
    
    // Get all players except currentPlayer (as this is only temporarly used for saving current gulps)
    let currentPlayer = localStorage.getItem("currentPlayer");
    let allPlayers = Object.keys(localStorage).filter(player => player !== "currentPlayer"); // Get all player names from localStorage except currentPlayer

    // Display player choices and NewPlayerButton
    clearButton(weiterButton);
    let playerChoiceHTML = "<h2>Who was guessing?</h2>";
    allPlayers.forEach(player => {
        playerChoiceHTML += `<button class="playerChoiceButton existingPlayerChoiceButton">${player}</button>`; // Create a button for each player, add class existingPlayerChoiceButton
    });
    playerChoiceHTML += `<button class="playerChoiceButton" id="newPlayerButton">A new player</button>`; // Create a button for a new player, add id newPlayerButton
    questionApp.innerHTML = playerChoiceHTML;

    // Add event listeners to player choice buttons 
    document.querySelectorAll('.existingPlayerChoiceButton').forEach(button => {
        button.addEventListener('click', () => {
            addGulpsToSelectedPlayer(button.textContent);
            firstTryWrong(currentPlayer, button.textContent);
        });
    });

    // Add event listener to NewPlayerButton
    document.querySelector('#newPlayerButton').addEventListener('click', () => {
        let newPlayer = createNewPlayer();
        if (newPlayer !== null && newPlayer !== undefined) {
            addGulpsToSelectedPlayer(newPlayer);
            firstTryWrong(currentPlayer, newPlayer);
        }
    });
}

function firstTryCorrect() {
    questionApp.innerHTML = `
    <h2>You guessed it first try! 🎉</h2>
    <p>Hand the phone to your desired person 📱➡️🧙‍♂️</p>`
    weiterButton.innerText = "Next question!";
    showButton(weiterButton);
}

function firstTryWrong(currentPlayer, player) { //this function is called to set up the screen after the player clicked on his name to take the sips
    if (checkIfPlayerLost(player)) { //if player has 20 sips, it's already game over
        gameOver(player); //show the game over screen with the player who lost
    } else { //if player has still less than 20 sips, show the screen with the sips he has to take

        if (currentPlayer > 1){
            questionApp.innerHTML = `
            <h2>${player}, take ${currentPlayer} sips!🍻</h2>
            <p>Hand the phone to your next person.</p>`
        } else {
            questionApp.innerHTML = `
            <h2>${player}, take ${currentPlayer} sip!🍻</h2>
            <p>Hand the phone to your next person.</p>`
        }
        weiterButton.innerText = "Wonderful, thanks!"; //let the player thank for the sips
        showButton(weiterButton);

        gameStats.style.display = 'block'; // Show the progress of the game displaying the sips of each player (gameStats)
    }
}

function clearButton(button) {
    button.style.display = "none";
}

function hideButton(button) {
    button.style.visibility = "hidden";
}

function showButton(button) {
    button.style.display = "block";
    button.style.visibility = "visible";
}

function updatePlayerProgressBars() {
    playerProgressBars.innerHTML = ''; // Clear previous progress bars

    for (let i = 0; i < localStorage.length; i++) { //do the process for each player (using i as index for the localStorage keys(player names))
        const playerName = localStorage.key(i);
        const player = parseInt(localStorage.getItem(playerName));
        if (playerName !== 'currentPlayer' && player < 20) { // avoid adding the temporary player 'currentPlayer' or players who already have 20 sips (for game over screen where only for other players the progress is shown)
            const playerGulps = parseInt(localStorage.getItem(playerName)); //number of gulps the player has taken
            const maxGulps = 20; //maximum gulps of game (20 sips is game over)

            
            const progressWidth = ((playerGulps + 0.1) / maxGulps) * 100;   // Calculate the width of the progress bar based on the percentage of sips taken

            // Create HTML elements for the progress bar, its container, and the player name
            const progressBarContainer = document.createElement('div');
            progressBarContainer.classList.add('playerProgressBar');

            // create title (name and gulps) for above progress bar
            const playerNameElement = document.createElement('span');
            playerNameElement.textContent = `${playerName}: ${playerGulps} / ${maxGulps} sips`;
            playerNameElement.classList.add('playerName');

            // create progressbar
            const progressBar = document.createElement('div');
            progressBar.classList.add('playerProgress');
            progressBar.style.width = progressWidth + '%';

            // Append player name and progress bar to its container and then to the playerProgressBars section
            progressBarContainer.appendChild(playerNameElement);
            progressBarContainer.appendChild(progressBar);
            playerProgressBars.appendChild(progressBarContainer);
        }
    }
}

function gameOver(player) {
    let playerGulps = parseInt(localStorage.getItem(player));
    questionApp.innerHTML = `
    <h1>Game Over!</h1>
    <h2>${player}, you got a total of ${playerGulps} sips. Now you have the honor to drink the rest of your whole magic potion! 🔮🍹 </h2>`
    gameStats.style.display = 'block';
}



// PLAYER LOGIC FUNCTIONS -- Manage players and gulps
function addGulpToCurrentPlayer() { //this function is called everytime a wrong answer is clicked
    let currentPlayer = localStorage.getItem("currentPlayer");
    if (currentPlayer) {
        let currentPlayerCount = parseInt(currentPlayer);
        localStorage.setItem("currentPlayer", currentPlayerCount + 1); //add one gulp to the temporary player 'currentPlayer'
    } else {
        localStorage.setItem("currentPlayer", 1); //if no wrong answer was clicked before yet, create the temporary player 'currentPlayer' and add one gulp
    }
}

function createNewPlayer() {
    newPlayer = prompt("Enter the name of the new player:");
    if (newPlayer == null) { // If the user cancels the prompt, return null
        return null;
    }
    else if (newPlayer === "") {
        alert("Please enter a name.");
        createNewPlayer();
    }
    else if (localStorage.getItem(newPlayer)) {
        alert("Player name already exists. Please try again.");
        createNewPlayer();
    } 
    else {
        localStorage.setItem(newPlayer, 0);
        return newPlayer;
    }
}

// Add gulps to selected player
function addGulpsToSelectedPlayer(selectedPlayer) {
    let currentPlayerCount = parseInt(localStorage.getItem("currentPlayer")) || 0;
    let playerGulps = parseInt(localStorage.getItem(selectedPlayer)) || 0;
    localStorage.setItem(selectedPlayer, playerGulps + currentPlayerCount);

    updatePlayerProgressBars();
}

// Reset all players
resetButton.addEventListener('click', () => {
    if (confirm("Do you really want to reset?")) {
        localStorage.clear();
        startscreen();
    }
});

// Game over check
function checkIfPlayerLost(player) {
    let playerGulps = parseInt(localStorage.getItem(player));
    if (playerGulps >= 20) {
        return true;
    } else {
        return false;
    }

}

//API FUNCTIONS -- Get data from the API
async function fetchData(url) { //this function is called every time data as json from the API is needed
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error);
    }
}

async function getAllIds() {
    try {
        let siteCount = 0;
        let figures = await fetchData(`https://api.disneyapi.dev/character`); // connect to the API
        let maximalSiteCount = figures.info.totalPages; // get the total number of pages from the API

        questionApp.innerHTML = `
            <h2>Loading game... Please wait.</h2>
            <p>Approximately ${maximalSiteCount * 50} Disney figures are being loaded.</p>
        `; // Show loading screen with the number of figures to be loaded

        while (siteCount <= maximalSiteCount) { // load IDs from each page until the last page is reached
            siteCount++; // increase siteCount by 1
            let figures = await fetchData(`https://api.disneyapi.dev/character?page=${siteCount}&pageSize=50`); // connect to certain page of the API
            figures.data.forEach((figure) => {
                allIds.push(figure._id); // add ID of figure to the allIds array
            });
            // Update loading bar
            let progress = (siteCount / maximalSiteCount) * 100;
            loadingBar.style.width = `${progress}%`; //set the width of the loading bar to the current progress
            loadingBar.innerText = `${Math.round(progress)}%`; //round to the next integer and show the percentage
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function nextQuestionPlease() { //function is called to get API data to create a new question
    localStorage.removeItem("currentPlayer"); //remove currentPlayer as new question is created, temporary gulps were already loaded to chosen player

    let figure = await getRandomFigure(); //get random Character from API
    let randomName1 = await getRandomName(); //get random name from API
    let randomName2 = await getRandomName(); //get second random name from API
    createQuestion(figure, randomName1, randomName2); //give character and two random names to createQuestion function
}

async function getRandomFigure(){
    const randomId = allIds[Math.floor(Math.random() * allIds.length)];
    let url = `https://api.disneyapi.dev/character/${randomId}`; //URL der API Anfrage mit RandomId ergänzen, dadurch kommt man auf einzlne Figure
    let figure = await fetchData(url); //Daten der API als Objekt 'figure' speichern
    return(figure); //return des zufälligen Charakters
}

async function getRandomName(){ //this function is called to get a random name from the API
    let figure = await getRandomFigure();
    let name = figure.data.name; 
    return(name);
}