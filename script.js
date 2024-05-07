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

        addGulpsToPlayer(); // Add gulps to the player's score

        setTimeout(nextQuestionPlease, 1000); // Delay the execution of the click function by 1 second
        return true;
    } else {
        console.log("Incorrect.");
        let clickedButton = document.querySelector(`#${buttonX}`);
        clickedButton.style.backgroundColor = "red";

        addGulpToCurrentPlayer ();

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

// Add gulps in CurrentPlayer to the player's score
function addGulpsToPlayer() {
var currentPlayer = localStorage.getItem("currentPlayer");
if (currentPlayer && parseInt(currentPlayer) > 0) {
    var player = prompt("Which player are you?");
    if (player !== null) {
        var currentPlayerCount = parseInt(currentPlayer);
        localStorage.removeItem("currentPlayer");
        var playerGulps = parseInt(localStorage.getItem(player)) || 0;
        localStorage.setItem(player, playerGulps + currentPlayerCount);
    }
}
}



//Funktionen mit API
async function getAllIds() {
    try {
        let siteCount = 0;
        let figures = await fetchData(`https://api.disneyapi.dev/character`)
        let maximalSiteCount = figures.info.totalPages

        questionApp.innerHTML = ""
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