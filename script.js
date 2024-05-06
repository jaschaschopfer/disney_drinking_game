const questionApp = document.querySelector('#questionApp'); //div Element mit der ID 'questionApp' speichern
// let url = 'https://api.disneyapi.dev/character'; // braucht es wohl nicht.

let allIds = []; //Array für alle IDs erstellen
init ();

function init () {
    getAllIds(); //alle IDs holen

}

async function getAllIds() {
    try {
        let siteCount = 0;
        let figures = await fetchData(`https://api.disneyapi.dev/character`)
        let maximalSiteCount = figures.info.totalPages

        console.log(`Loading approximately ${maximalSiteCount*50} Disney figures... Please wait.`);

        while (siteCount <= 10) { //ACHTUNG HIER NUR VORÜBERGEHEND AUF 10 GESCHALTET, DA SONST ZU LANGE WARTEDAUER
            siteCount++;
            let figures = await fetchData(`https://api.disneyapi.dev/character?page=${siteCount}&pageSize=50`);
            figures.data.forEach((figure) => {
                // console.log(figure._id);
                allIds.push(figure._id);
            });
        }
        console.log("All IDs loaded!");
    } catch (error) {
        console.error('Error:', error);
    }
}

addEventListener('click', click); //Eventlistener für Klick auf beliebige Stelle

async function click() {
    let figure = await getRandomFigure(); //zufälligen Charakter holen
    createQuestion(figure); //Frage erstellen

}

//Werkzeugkasten von Funktionen
async function getRandomFigure(){
    console.log("getRandomId");
    const randomId = allIds[Math.floor(Math.random() * allIds.length)];
    console.log(randomId);
    let url = `https://api.disneyapi.dev/character/${randomId}`; //URL der API Anfrage mit RandomId ergänzen, dadurch kommt man auf einzlne Figure
    let figure = await fetchData(url); //Daten der API als Objekt 'figure' speichern
    return(figure); //return des zufälligen Charakters
    };

function createQuestion(figure) {
    let question = document.createElement('div'); //neues div Element erstellen
    questionApp.innerHTML = ""; //Inhalt des div Elements löschen
    question.innerHTML = `
    <h2>Name the figure!</h2>
    <img src="${figure.data.imageUrl}" alt="Image of searched figure" id="questionImage">
    <input type="text" id="answerInput" placeholder="Enter your answer">
    `; //Inhalt des div Elements festlegen, dabei Bild von Charakter holen
    questionApp.appendChild(question); //div Element an body anhängen
}

//Daten aus einer API holen
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