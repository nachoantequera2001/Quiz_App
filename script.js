
//Function to get the name and the quiz from the form presented to the user
function getInfo(){
  const fname = document.getElementById('fname').value;
  const quiz_selection = document.getElementById('quiz_selection').value;
  //alert(fname + ", " + quiz_selection)
}

// Selects the quiz
var Quizzes = {
	"Quiz" : [
		{"quiz_selection" : "Start Quiz"}
	]
}

// Keep track of question count
var TitleQuiz = {
	"name": "",
	"currentQuestion": 0,
	"totalQuestions": 0,
	"correctResponses": 0
}

//Default choice
var choice = -1;

//Set of stored questions
var set = [];
var chosenQuestion;

//Load main menu view
window.onload = () => {

	var source = document.querySelector('#Menu').innerHTML;
	var template = Handlebars.compile(source);
	var html = template(Quizzes);

	document.querySelector("#widget_view").innerHTML = html;
};

document.addEventListener("DOMContentLoaded", () => {

	//This is event delegation, any child member of "widget_view" will trigger this
	document.querySelector("#widget_view").onclick = (e) => {
		handle_event(e);
	};
})

function handle_event(e) {

	//For when user is starting the quiz
	//Checks if this button belongs in <div> with an id of "quizzes"
	if (e.target.offsetParent.id == "quizzes") {

		//Uses the id of the button to get the correct data
		GetData(e.target.id);
	}

	//Checks for multiple choices (their id is a number)
	//Store the user's answer
	else if (parseInt(e.target.id) >= 0) {

		//Change the button color to the default color, to show a different choice was picked
		//But only if the user have made a choice before
		if (choice >= 0) {
			document.getElementById(choice).style.backgroundColor = "white";
		}

		choice = e.target.id;
		document.getElementById(choice).style.backgroundColor = "yellow";
	}

	//Submit button and resets the user's choice
	else if (e.target.id == "submit") {

		if (choice >= 0) {
			checkAnswer(choice);
			choice = -1;
		}

		else {
			alert("Please choose an answer");
		}
	}

	//Submit button for the 'List' question
	else if (e.target.id == "listSubmit") {
		var value = document.querySelector('#options').value;

		if (value >= 0) {
			checkAnswer(value);
		}

		else {
			alert("Please choose an answer");
		}
	}

	//When the user understood why the correct answer is correct
	else if (e.target.id == "understood") {
		updatePage();
	}

	//Returns to the home page
	else if (e.target.id == "homePage") {
		var source = document.querySelector('#Menu').innerHTML;
		var template = Handlebars.compile(source);
		var html = template(Quizzes);

		document.querySelector("#widget_view").innerHTML = html;
	}
}

// Get data from the Restful API
var GetData = (quiz) => {
	fetch(`https://my-json-server.typicode.com/nachoantequera2001/Quiz_App/${quiz}`)
	.then((response) => {
		return response.json();
	})
	.then((results) => {
		set = results;
	})
	.then(() => {
		//Access the quiz template
		var source = document.querySelector('#Quiz').innerHTML;
		var template = Handlebars.compile(source);

		//Initialize/reset 'TitleQuiz' json object
		TitleQuiz['name'] = quiz;
		TitleQuiz['currentQuestion'] = 1;
		TitleQuiz['totalQuestions'] = totalCount(set);
		TitleQuiz['correctResponses'] = 0;
		var html = template(TitleQuiz);

		document.querySelector("#widget_view").innerHTML = html;
	})
	.then(() => {
		view_question();
	})
}

//Selects the template based on the type of question
var view_question = () => {

	//Randomize the question by type
	var typeRandom = Math.floor(Math.random() * set.length);
	var chosenType = set[typeRandom][Object.keys(set[typeRandom])];

	//Randomize the question by question
	var questionRandom = Math.floor(Math.random() * chosenType.length);
	chosenQuestion = chosenType[questionRandom];

	//Access the template used, depending on the question type
	var source = document.querySelector(`#${Object.keys(set[typeRandom])}`).innerHTML;
	var template = Handlebars.compile(source);
	var html = template(chosenQuestion);
	document.querySelector("#quizQuestions").innerHTML = html;

	//Remove the question since it has already been used
	delete chosenType[questionRandom];
	chosenType.sort();
	chosenType.pop();

	//Check if the question type have no more questions
	if (chosenType.length == 0) {
		delete set[typeRandom]; //If so, then remove that question type
		set.sort();
		set.pop();
	}
}

// Return the total amount questions
function totalCount(jsonObject) {
	var count = 0;

	// Iterate through the dictionary
	Object.entries(jsonObject).forEach(([key, value]) => {

		// Iterate through the inner dictionary
		var innerDictionary = value;
		Object.entries(innerDictionary).forEach(([key, value]) => {

			//Add the length of the array to count
			count = count + value.length;
		})
	})

	return count;
}

// UpdatePage Method
var updatePage = function() {
	var source;
	var template;

	//Checks if there are any questions left
	if (set.length > 0) {

		//Access quiz template
		source = document.querySelector('#Quiz').innerHTML;

		//Initialize/reset the 'TitleQuiz' json
		TitleQuiz['currentQuestion'] = TitleQuiz['currentQuestion'] + 1;
	}

	// If there are no questions left, show the result:
	else {

		// Display Result template
		source = document.querySelector('#resultTemplate').innerHTML;
		var percentage = (TitleQuiz['correctResponses'] / TitleQuiz['totalQuestions']) * 100; // Show percentage score
		TitleQuiz['percentage'] = percentage;
	}

	var template = Handlebars.compile(source);
	var html = template(TitleQuiz);
	document.querySelector("#widget_view").innerHTML = html;

	// If ther are still questions:
	if (set.length > 0) {

		//Next question
		view_question();
	}
}

// checkAnswer mehotd
function checkAnswer(number) {

	//declare variable that willl be associated ot the correct answer of the questions
	var correctAnswer;

	//If the response is incorrect, then add a new property to the chosenQuestion object
	if (chosenQuestion['Answer'] != number) {
		if ('Choices' in chosenQuestion) {
			correctAnswer = chosenQuestion['Choices'];
			correctAnswer = correctAnswer[chosenQuestion['Answer']];
			correctAnswer = correctAnswer['Answer'];
		}
		else if (chosenQuestion['Answer'] == 0) { //When the answer is 'true'
			correctAnswer = 'True';
		}
		else if (chosenQuestion['Answer'] == 1) { //When the answer is 'false'
			correctAnswer = 'False';
		}
		chosenQuestion.CorrectAnswer = correctAnswer;
	}
	else {
		TitleQuiz['correctResponses'] = TitleQuiz['correctResponses'] + 1;
		setTimeout(() => {updatePage();}, 1000);
	}

	var source = document.querySelector('#Reaction').innerHTML;
	var template = Handlebars.compile(source);
	var html = template(chosenQuestion);

	// Change template and its css
	document.querySelector(".Background").style.width = "100%";
	document.querySelector("#response").innerHTML = html;
}
