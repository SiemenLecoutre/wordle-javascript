let wordOfTheDay = "";
let userWord = [];
const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let nextLetter = 0;

const init = () => {
  getWordOfTheDay();
  initBoard();
  document.addEventListener("keyup", onKeyUp, false);
};

const setLoading = (isLoading) => {
  document.querySelector(".spinner").classList.toggle("hidden", !isLoading);
};

function initBoard() {
  let board = document.getElementById("word-grid");

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }

    board.appendChild(row);
  }
}

const getWordOfTheDay = async () => {
  // Add spinner while loading
  setLoading(true);

  const promise = await fetch("https://words.dev-apis.com/word-of-the-day");
  const processedResponse = await promise.json();
  wordOfTheDay = processedResponse.word.toUpperCase().split("");
  setLoading(false);
};

const onKeyUp = (e) => {
  if (e.key.length === 1 && e.key.match(/[a-z]/i) && userWord.length < 5) {
    insertLetter(e.key);
  } else if (e.key === "Backspace") {
    removeLetter();
  } else if (e.key === "Enter" && userWord.length === 5) {
    testWord();
  }
};

const testWord = async () => {
  setLoading(true);

  const promise = await fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    // Convert the userword array to string and send it
    body: JSON.stringify({ word: userWord.join("") })
  });
  const processedResponse = await promise.json();

  setLoading(false);
  //   If word is valid
  if (processedResponse.validWord) {
    const map = makeMap(wordOfTheDay);
    // Check two arrays
    for (let i = 0; i < userWord.length; i++) {
      // Add filled box to each letter
      document
        .getElementsByClassName("letter-row")
      [6 - guessesRemaining].children[i].classList.add("filled-box");

      if (userWord[i] === wordOfTheDay[i]) {
        // Mark as close if it exists in the string at the wrong place.
        // Only mark it if that (or those) letters have not already been marked
        if (map[userWord[i]] > 0) {
          document
            .getElementsByClassName("letter-row")
          [6 - guessesRemaining].children[i].classList.add("green-box");
          map[userWord[i]]--;
        }
      }
    }

    for (let i = 0; i < userWord.length; i++) {
      for (let j = 0; j < wordOfTheDay.length; j++) {
        if (userWord[i] === wordOfTheDay[i]) {
          // Mark as close if it exists in the string at the wrong place.
          // Only mark it if that (or those) letters have not already been marked
          if (map[userWord[i]] > 0) {
            document
              .getElementsByClassName("letter-row")
            [6 - guessesRemaining].children[i].classList.add("green-box");
            map[userWord[i]]--;
          }
        }
        if (userWord[i] === wordOfTheDay[j]) {
          // for same character at same index (mark as correct)
          if (map[userWord[i]] > 0) {
            document
              .getElementsByClassName("letter-row")
            [6 - guessesRemaining].children[i].classList.add("orange-box");
            map[userWord[i]]--;
          }
        }
      }
    }
    // If userword is equal to wordoftheday
    if (userWord.join("") === wordOfTheDay.join("")) {
      gameWon();
    }
    newGuess();
  } else {
    // If not valid word, make boxes red animation
    for (let i = 0; i < 5; i++) {
      document.getElementsByClassName("letter-row")[
        6 - guessesRemaining
      ].children[i].className = "letter-box";
      requestAnimationFrame((time) => {
        requestAnimationFrame((time) => {
          document.getElementsByClassName("letter-row")[
            6 - guessesRemaining
          ].children[i].className = "letter-box red-box";
        });
      });
    }
  }
};

// Check how many of each letter are in the word
const makeMap = (array) => {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }

  return obj;
};

const newGuess = () => {
  guessesRemaining--;
  userWord = [];
  nextLetter = 0;
  if (guessesRemaining === 0) {
    gameLost();
  }
};

const gameLost = () => {
  document.querySelector(".losing-text").style.display = "block";
};

const gameWon = () => {
  document.querySelector(".winning-text").style.display = "block";
  document.querySelector(".title").classList.add("rainbow");
  guessesRemaining = 0;
};

const insertLetter = (pressedKey) => {
  if (nextLetter >= 0 && nextLetter < 6 && guessesRemaining > 0) {
    let row = document.getElementsByClassName("letter-row")[
      6 - guessesRemaining
    ];
    let box = row.children[nextLetter];
    box.textContent = pressedKey.toUpperCase();
    userWord.push(pressedKey.toUpperCase());
    nextLetter += 1;
  }
};

const removeLetter = () => {
  if (nextLetter >= 1 && nextLetter < 6) {
    nextLetter -= 1;
    let row = document.getElementsByClassName("letter-row")[
      6 - guessesRemaining
    ];
    let box = row.children[nextLetter];
    userWord.pop();
    box.textContent = "";
    box.classList.remove("filled-box");
  }
};

init();
