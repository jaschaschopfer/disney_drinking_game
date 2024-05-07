const questionApp = document.querySelector('#questionApp'); //div Element mit der ID 'questionApp' speichern
const weiterButton = document.querySelector('#weiterButton'); //Button mit der ID 'weiterButton' speichern
// let url = 'https://api.disneyapi.dev/character'; // braucht es wohl nicht.
let allIds = []; //Array für alle IDs erstellen




// INIT FUNCTIONS - Get the necessary data and set up the site
init();
weiterButton.addEventListener('click', nextQuestionPlease);

async function init() {
    await getAllIds(); //alle IDs holen
}




// CONTENT FUNCTIONS -- Change content on site when called
function createQuestion(figure, randomName1, randomName2) {
    // Create an array with all button names
    let buttonNames = [figure.data.name, randomName1, randomName2];
    // Shuffle the array to randomize button positions
    buttonNames.sort(() => Math.random() - 0.5);

    let question = document.createElement('div'); // Create a new div element
    questionApp.innerHTML = ""; // Clear the content of the div element
    question.innerHTML = `
    <h2>Name the figure!</h2>
    <img src="${figure.data.imageUrl}" alt="Image of searched figure" id="questionImage">
    <div>
        <button id="button1">${buttonNames[0]}</button>
        <button id="button2">${buttonNames[1]}</button>
        <button id="button3">${buttonNames[2]}</button>
    </div>
    `; // Set the content of the div element, including the character image and three buttons
    questionApp.appendChild(question); // Append the div element to the body

    // Add event listeners to all buttons
    document.querySelector('#button1').addEventListener('click', () => {
        evaluateAnswer(buttonNames[0], figure.data.name, 'button1');
    });

    document.querySelector('#button2').addEventListener('click', () => {
        evaluateAnswer(buttonNames[1], figure.data.name, 'button2');
    });

    document.querySelector('#button3').addEventListener('click', () => {
        evaluateAnswer(buttonNames[2], figure.data.name, 'button3');
    });
}

function evaluateAnswer(clickedAnswer, correctAnswer, buttonX) {
    if (clickedAnswer === correctAnswer) {
        console.log("Correct!");
        let clickedButton = document.querySelector(`#${buttonX}`);
        clickedButton.style.backgroundColor = "green";

        setTimeout(() => {
            if (localStorage.getItem("currentPlayer")) {
            questionApp.innerHTML = "";
            providePlayerChoices();
            }
            else {
                nextQuestionPlease();
            }
        }, 1000); // Delay the execution of clearing the question app and providing player choices by 1 second
        return true;
    } else {
        console.log("Incorrect.");
        let clickedButton = document.querySelector(`#${buttonX}`);
        clickedButton.style.backgroundColor = "red";

        addGulpToCurrentPlayer();

        return false;
    }
}

// Add one gulp to CurrentPlayer
function addGulpToCurrentPlayer() {
    var currentPlayer = localStorage.getItem("currentPlayer");
    if (currentPlayer) {
        var currentPlayerCount = parseInt(currentPlayer);
        localStorage.setItem("currentPlayer", currentPlayerCount + 1);
    } else {
        localStorage.setItem("currentPlayer", 1);
    }
}

function providePlayerChoices() {
    // Get all players except currentPlayer (as this is only temporarly used for saving current gulps)
    let currentPlayer = localStorage.getItem("currentPlayer");
    let allPlayers = Object.keys(localStorage).filter(player => player !== "currentPlayer");

    // Display player choices and NewPlayerButton
    let playerChoiceHTML = "<h2>Choose a player to add gulps to:</h2>";
    allPlayers.forEach(player => {
        playerChoiceHTML += `<button class="playerChoiceButton">${player}</button>`;
    });
    playerChoiceHTML += `<button id="newPlayerButton">Add player</button>`;
    questionApp.innerHTML = playerChoiceHTML;

    // Add event listeners to player choice buttons
    document.querySelectorAll('.playerChoiceButton').forEach(button => {
        button.addEventListener('click', () => {
            addGulpsToSelectedPlayer(button.textContent);
            questionApp.innerHTML = "";
            nextQuestionPlease();
        });
    });

    // Add event listener to NewPlayerButton
    document.querySelector('#newPlayerButton').addEventListener('click', () => {
        let newPlayer = createNewPlayer();
        addGulpsToSelectedPlayer(newPlayer);
        questionApp.innerHTML = "";
        nextQuestionPlease();
    });
}

function createNewPlayer() {
    let newPlayer = prompt("Enter the name of the new player:");
    if (newPlayer && !localStorage.getItem(newPlayer)) {
        localStorage.setItem(newPlayer, 0);
        return newPlayer;
    } else {
        alert("Player name already exists or is empty. Please try again.");
        return createNewPlayer();
    }
}

// Add gulps to selected player
function addGulpsToSelectedPlayer(selectedPlayer) {
    let currentPlayerCount = parseInt(localStorage.getItem("currentPlayer")) || 0;
    let playerGulps = parseInt(localStorage.getItem(selectedPlayer)) || 0;
    localStorage.setItem(selectedPlayer, playerGulps + currentPlayerCount);
}


//Funktionen mit API
async function getAllIds() {
    try {
        let siteCount = 0;
        let figures = await fetchData(`https://api.disneyapi.dev/character`)
        let maximalSiteCount = figures.info.totalPages

        questionApp.innerHTML = "";
        questionApp.innerHTML = `<h2>Loading approximately ${maximalSiteCount*50} Disney figures... Please wait.</h2>`

        console.log(`Loading approximately ${maximalSiteCount*50} Disney figures... Please wait.`);

        while (siteCount <= 10) { //ACHTUNG HIER NUR VORÜBERGEHEND AUF 10 GESCHALTET, DA SONST ZU LANGE WARTEDAUER
            siteCount++;
            let figures = await fetchData(`https://api.disneyapi.dev/character?page=${siteCount}&pageSize=50`);
            figures.data.forEach((figure) => {
                // console.log(figure._id);
                allIds.push(figure._id);
            });
        }
        questionApp.innerHTML = ""
        questionApp.innerHTML = `<h2>All IDs loaded!</h2>`
        console.log("All IDs loaded!");
        weiterButton.style.visibility = "visible";
    } catch (error) {
        console.error('Error:', error);
    }
}

async function nextQuestionPlease() {
    localStorage.removeItem("currentPlayer");

    let figure = await getRandomFigure(); //zufälligen Charakter holen
    let randomName1 = await getRandomName();
    let randomName2 = await getRandomName();
    createQuestion(figure, randomName1, randomName2); //Frage erstellen

    //Überprüfung in der Console
    console.log("Das ist der richtige Namen " + figure.data.name);
    console.log("Das ist randomName1 " + randomName1);
    console.log("Das ist randomName2 " + randomName2);
}

async function getRandomFigure(){
    console.log("getRandomId");
    const randomId = allIds[Math.floor(Math.random() * allIds.length)];
    console.log(randomId);
    let url = `https://api.disneyapi.dev/character/${randomId}`; //URL der API Anfrage mit RandomId ergänzen, dadurch kommt man auf einzlne Figure
    let figure = await fetchData(url); //Daten der API als Objekt 'figure' speichern
    return(figure); //return des zufälligen Charakters
}


async function getRandomName(){ 
    let figure = await getRandomFigure(); //zufälligen Charakter holen
    let name = figure.data.name; //Name des zufälligen Charakters speichern
    return(name); //return des Namens des zufälligen Charakters
}

//Daten aus einer API hole - allgemeine Funktion
async function fetchData(url) {
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error);
    }
}



// fetch('https://api.disneyapi.dev/character')
//     .then(response => response.json())
//     .then(data => {
//         const randomObject = data[Math.floor(Math.random() * data.length)];
//         console.log(randomObject);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });