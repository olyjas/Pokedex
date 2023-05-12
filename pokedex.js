/**
 * Jasmine Zhang
 * 5/11/2023
 * SECTION AG
 * TA: TARA WUEGER & ALLISON HO
 * This is the pokedex.js page of HW3. It contains the functionality of a webpage that generates
 * pokemon cards containing information of the specific pokemon, holds an encyclopedia of pokemons
 * specifying which pokemon have been found, and generates pokemon battles
 */

'use strict';
(function() {
  const POKEMON_NAMES_URL = 'https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php';
  const POKEMON_DATA_URL = 'https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/game.php';
  const IMG_PREPEND_URL = 'https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/';
  let currentPokemonShortName;
  let gameId;
  let playerId;

  window.addEventListener('load', init);

  /**
   * This function intializes the webpage once it has loaded by calling spriteRequest which then
   * enters a series of functions that will provide the functionality for the site
   */
  function init() {
    spriteRequest();
  }

  /**
   * This function uses the fetch() functon and goes through
   * a series of .then statements to ultimately execute a function
   * that populates the pokedex with sprite icons of pokemon
   */
  function spriteRequest() {
    let url = POKEMON_NAMES_URL + '?pokedex=all';
    fetch(url)
      .then(statusCheck)
      .then((resp) => resp.text())
      .then(populateSprites)
      .catch(console.error);
  }

  /**
   * This function populates the pokedex with all the sprite icons
   * @param {String} data text content returned by the API utilized in spriteRequest
   *                      contains all 151 Pokemon names along with their short names
   */
  function populateSprites(data) {
    let pokedexContainer = id('pokedex-view');
    let shortNameArray = separateShortNames(data);
    for (let i = 0; i < shortNameArray.length; i++) {
      let spriteImage = gen('img');
      spriteImage.src = IMG_PREPEND_URL + "sprites/" + shortNameArray[i] + ".png";
      spriteImage.alt = shortNameArray[i] + " pokemon image";
      spriteImage.id = shortNameArray[i];
      pokedexContainer.appendChild(spriteImage);
      spriteImage.classList.add('sprite');
    }
    setInitial();
    makeFoundSpritesClickable();
  }

  /**
   * This function assigns the three starter pokemon bulbasaur, charmander, and squirtle to the
   * found class, which colorizes them and allows them to be selected for battle when the page loads
   */
  function setInitial() {
    let spriteArray = qsa('.sprite');
    for (let i = 0; i < spriteArray.length; i++) {
      if (spriteArray[i].id === 'bulbasaur' || spriteArray[i].id === 'charmander' ||
          spriteArray[i].id === 'squirtle') {
        spriteArray[i].classList.add('found');
      }
    }
  }

  /**
   * This function takes in the String data that is returned from the spriteRequest function and
   * separates all of the short names from the lines that were separated from the separate lines
   * function and adds them to an array containing all 151 pokemons' short names
   * @param {String} data text content returned by the API utilized in spriteRequest
   *                      contains all 151 Pokemon names along with their short names
   * @returns {array} an array of all 151 pokemon's short names
   */
  function separateShortNames(data) {
    let fullNameToShortNames = separateLines(data);
    let allShortNames = [];
    let allFullNames = [];
    for (let i = 0; i < fullNameToShortNames.length; i++) {
      let fullName = "";
      let shortName = "";
      let isFullName = true;
      for (let j = 0; j < fullNameToShortNames[i].length; j++) {
        let character = fullNameToShortNames[i][j];
        if (isFullName) {
          if (character === ":") {
            isFullName = false;
          } else {
            fullName += character;
          }
        } else {
          shortName += character;
        }
      }
      allShortNames.push(shortName);
      allFullNames.push(fullName);
    }
    return allShortNames;
  }

  /**
   * This function takes in the String data that is returned from the spriteRequest function and
   * separates all of the lines
   * @param {String} data text content returned by the API utilized in spriteRequest
   *                      contains all 151 Pokemon names along with their short names
   * @returns {array} an array of all 151 lines from the text content of data
   */
  function separateLines(data) {
    let fullNameToShortNames = [];
    let fullLine = "";
    for (let i = 0; i < data.length; i++) {
      let character = data[i];

      // gone through entire line of full name: shortname, indicated by current character being \n
      if (character === "\n") {
        fullNameToShortNames.push(fullLine);

        // reset for the next line
        fullLine = "";
      } else {
        fullLine += character;
      }
    }

    // gone through entire line of full name: shortname, indicated by a full line existing
    if (fullLine) {
      fullNameToShortNames.push(fullLine);
    }
    return fullNameToShortNames;
  }

  /**
   * This function makes all of the sprite elements that have the found class attached, which
   * colorizes them and makes them clickable and thus able to use in battle
   */
  function makeFoundSpritesClickable() {
    let foundSprites = qsa('.found');
    for (let i = 0; i < foundSprites.length; i++) {
      let currPokemonShortName = foundSprites[i].id;
      foundSprites[i].addEventListener('click', () => {
        cardRequest(currPokemonShortName);
      });
    }
  }

  /**
   *
   * This function uses the fetch() functon and goes through
   * a series of .then statements to ultimately execute a function
   * that populates the card of the pokemon that is selected for battle.
   * It also enables a button to start the battle.
   * @param {String} currPokemonShortName the short name of the specific pokemon that is selected.
   *                                      It is needed as a parameter of the URL that will be
   *                                      fetched to obtain an object of details of the pokemon
   *                                      that will end up being passed in different functions
   */
  function cardRequest(currPokemonShortName) {
    currentPokemonShortName = currPokemonShortName;
    let url = POKEMON_NAMES_URL + '?pokemon=' + currPokemonShortName;
    fetch(url)
      .then(statusCheck)
      .then((resp) => resp.json())
      .then((resp) => {
        populateCardInfo(resp, 'p1');
      })
      .catch(console.error);

    // getting start button ready after card info has been populated
    let startButton = id('start-btn');
    startButton.classList.remove('hidden');

    startButton.addEventListener('click', generateMainView);
  }

  /**
   *   /**
   * This function populates the card of the selected pokemon with information
   * @param {Object} data The response data from the cardRequest function from the pokemon data API,
   *                      containing the pokemon information.
   * @param {String} pToPopulate A String that will be concatenated to a # to specify if the card
   *                             that is populating is for p1 or p2
   */
  function populateCardInfo(data, pToPopulate) {
    let cardInfoObject = data.info;
    let nameOnCard = qs('#' + pToPopulate + ' .name');
    nameOnCard.textContent = data.name;
    let imageOnCard = qs('#' + pToPopulate + ' .pokepic');
    imageOnCard.src = IMG_PREPEND_URL + "images/" + data.shortname + ".jpg";
    let typeOnCard = qs('#' + pToPopulate + ' .type');
    typeOnCard.src = IMG_PREPEND_URL + "icons/" + cardInfoObject.type + ".jpg";
    let weaknessOnCard = qs('#' + pToPopulate + ' .weakness');
    weaknessOnCard.src = IMG_PREPEND_URL + "icons/" + cardInfoObject.weakness + ".jpg";
    let hpOnCard = qs('#' + pToPopulate + ' .hp');
    hpOnCard.textContent = data.hp + "HP";
    let descriptionOnCard = qs('#' + pToPopulate + ' .info');
    descriptionOnCard.textContent = cardInfoObject.description;
    populateMovesInfo(data, pToPopulate);
  }

  /**
   * This function generates the view for when a pokemon has been selected for battle
   */
  function generateMainView() {
    id('pokedex-view').classList.add('hidden');
    id('p2').classList.remove('hidden');
    qs('.hp-info').classList.remove('hidden');
    id('results-container').classList.remove('hidden');
    id('start-btn').classList.add('hidden');
    let fleeButton = id('flee-btn');
    fleeButton.classList.remove('hidden');
    fleeButton.addEventListener('click', () => {
      gamePlayRequest(gameId, playerId, "flee");
    });
    let moveButtons = qsa('#p1 .moves button');
    for (let i = 0; i < moveButtons.length; i++) {
      if (!moveButtons[i].classList.contains('hidden')) {
        moveButtons[i].disabled = false;
        moveButtons[i].addEventListener('click', function() {
          let moveName = this.querySelector('.move').textContent;
          gamePlayRequest(gameId, playerId, moveName);
        });
      }
      let heading = qs('h1');
      heading.textContent = 'Pokemon Battle!';
      initializeGameRequest();
    }
  }

  /**
   *
   * This function uses the fetch() functon and post request and goes through
   * a series of .then statements to ultimately execute a function
   * that generates the game play between the players when a move is selected
   * @param {String} guid String depiction of the unqiue game ID generated by the API
   * @param {String} pid String depiction of the unqiue player ID generated by the API
   * @param {String} moveName String depiction of the move name clicked by the user
   */
  function gamePlayRequest(guid, pid, moveName) {
    id('loading').classList.remove('hidden');
    let letters = moveName.split(" ");
    let moveNameWithoutSpaces = "";
    for (let i = 0; i < letters.length; i++) {
      moveNameWithoutSpaces += letters[i];
    }
    moveName = moveNameWithoutSpaces.toLowerCase();
    let params = new FormData();
    params.append("guid", guid);
    params.append("pid", pid);
    params.append("movename", moveName);

    fetch(POKEMON_DATA_URL, {method: "POST", body: params})
      .then(statusCheck)
      .then((resp) => resp.json())
      .then(gamePlay)
      .catch(console.error);
  }

  /**
   *
   * This function generates the game play after a move is selected by the user, detailing what
   * moves each player made, and calls helper functions to update the loading screen and
   * health bars.
   * @param {Object} data The response data from the cardRequest function from the pokemon data API,
   *                      containing the pokemon information.
   */
  function gamePlay(data) {
    let results = data.results;
    id('loading').classList.add('hidden');
    let p1Move = results['p1-move'];
    let p2Move = results['p2-move'];
    let p1Result = results['p1-result'];
    let p2Result = results['p2-result'];
    id('loading').classList.add('hidden');
    id('results-container').classList.remove('hidden');
    id('p1-turn-results').classList.remove('hidden');
    id('p2-turn-results').classList.remove('hidden');
    id('p1-turn-results').textContent = 'Player 1 played ' + p1Move + ' and ' + p1Result + "!";
    id('p2-turn-results').textContent = 'Player 2 played ' + p2Move + ' and ' + p2Result + "!";
    updateHealthBar(data);
    if (p2Move === null || p2Result === null || p1Result === 'flee') {
      id('p2-turn-results').classList.add('hidden');
    }
  }

  /**
   * A helper function for the gamePlay function that updates each player's health bar after
   * each move.
   * @param {Object} data The response data from the cardRequest function from the pokemon data API,
   *                      containing the pokemon information.
   */
  function updateHealthBar(data) {
    const greenHealthMinimum = 20;
    const percentMultiply = 100;
    let p1Data = data.p1;
    let p2Data = data.p2;
    let p1HealthBar = qs('#p1 .health-bar');
    let p2HealthBar = qs('#p2 .health-bar');
    let p1CurrentHp = p1Data['current-hp'];
    let p1TotalHp = p1Data.hp;
    let p2CurrentHp = p2Data['current-hp'];
    let p2TotalHp = p2Data.hp;
    let p1HealthPercentage = (p1CurrentHp / p1TotalHp) * percentMultiply;
    let p2HealthPercentage = (p2CurrentHp / p2TotalHp) * percentMultiply;
    p1HealthBar.style.width = p1HealthPercentage + "%";
    p2HealthBar.style.width = p2HealthPercentage + "%";
    if (p1HealthPercentage < greenHealthMinimum) {
      p1HealthBar.classList.add('low-health');
    }
    if (p2HealthPercentage < greenHealthMinimum) {
      p2HealthBar.classList.add('low-health');
    }
    isGameOver(p2Data, p1HealthPercentage, p2HealthPercentage);
  }

  /**
   * A function that checks if the game is over and specifies which player won
   * @param {Object} p2Data The p2 object within the object from the cardRequest function from
   *                        the pokemon data API, containing the pokemon information.
   * @param {String} p1HealthPercentage A string representation of player 1's HP
   * @param {String} p2HealthPercentage A string representation of player 2's HP
   * @return {boolean} true if player 1 won the game, false if player 1 lost the game
   */
  function isGameOver(p2Data, p1HealthPercentage, p2HealthPercentage) {
    if (p1HealthPercentage === 0) {
      let heading = qs('h1');
      heading.textContent = 'You lost!';
      endGame();
      return false;
    } else if (p2HealthPercentage === 0) {
      let heading = qs('h1');
      heading.textContent = 'You won!';
      endGame(p2Data);
      return true;
    }
  }

  /**
   * A function that updates the game to accomodate its state regarding the fact that it has ended.
   * Establishes a button that takes the user back to the pokedex landing page.
   * @param {Object} p2Data The p2 object within the object from the cardRequest function from
   *                        the pokemon data API, containing the pokemon information.
   */
  function endGame(p2Data) {
    let backToPokedexButton = id('endgame');
    backToPokedexButton.classList.remove('hidden');
    let fleeButton = id('flee-btn');
    fleeButton.classList.add('hidden');
    let p1Moves = qsa('.moves button');
    for (let i = 0; i < p1Moves.length; i++) {

      p1Moves[i].disabled = true;
    }
    backToPokedexButton.addEventListener('click', () => {
      backToPokedex(p2Data);
    });
  }

  /**
   * A function that updates the game to accomodate its state after the user clicks the button
   * that will take them back to the pokedex landing page.
   * If the user won the last battle against an unknown pokemon, it will be added to the pokedex
   * @param {Object} p2Data The p2 object within the object from the cardRequest function from
   *                        the pokemon data API, containing the pokemon information.
   */
  function backToPokedex(p2Data) {
    id('endgame').classList.add('hidden');
    let resultsContainer = id('results-container');
    resultsContainer.classList.add('hidden');
    id('p2').classList.add('hidden');
    qs('.hp-info').classList.add('hidden');
    id('start-btn').classList.remove('hidden');
    id('pokedex-view').classList.remove('hidden');
    let heading = qs('h1');
    heading.textContent = 'Your Pokedex';
    resetHealthBar();
    if (isGameOver === true) {
      let addedPokemonShortname = p2Data.shortname;
      let addedPokemonSprite = id(addedPokemonShortname);
      if (!addedPokemonSprite.classList.contains('found')) {
        addedPokemonSprite.classList.add('found');
      }
      addedPokemonSprite.addEventListener('click', () => {
        cardRequest(addedPokemonShortname);
      });
    }
  }

  /**
   * A function that resets the health bar after a battle has ended in preparation for the next
   * battle to function correctly
   */
  function resetHealthBar() {
    let p1HealthBar = qs('#p1 .health-bar');
    p1HealthBar.style.width = "100%";
    p1HealthBar.classList.remove('low-health');
    let p2HealthBar = qs('#p2 .health-bar');
    p2HealthBar.style.width = "100%";
    p2HealthBar.classList.remove('low-health');
  }

  /**
   * This function uses the fetch() functon and post request goes through
   * a series of .then statements to ultimately execute a function
   * that initializes the game by populating the card information of player 2 and retreiving
   * the game and player ID's
   */
  function initializeGameRequest() {
    let params = new FormData();
    params.append("startgame", "true");
    params.append("mypokemon", currentPokemonShortName);

    fetch(POKEMON_DATA_URL, {method: "POST", body: params})
      .then(statusCheck)
      .then(resp => resp.json())
      .then(initializeGame)
      .catch(console.error);
  }

  /**
   * This function is executed from the intializeGameRequest Function and populates the
   * card information of player 2 and retreiving the game and player ID's
   * @param {Object} data The object that is retreived in JSON format from the intializeGameRequest
   *                      function, which returns various information useful for the game play
   */
  function initializeGame(data) {
    let p2Data = data.p2;
    populateCardInfo(p2Data, 'p2');
    gameId = data.guid;
    playerId = data.pid;
  }

  /**
   * This is a helper function for the populateCardInfo function that populates the information
   * specifically for the move choices, including the name, icon, and DP.
   * @param {Object} data The response data from the cardRequest function from the pokemon data API,
   *                      containing the pokemon information.
   * @param {String} pToPopulate A String that will be concatenated to a # to specify if the card
   *                             that is populating is for p1 or p2
   */
  function populateMovesInfo(data, pToPopulate) {
    // array of all the moves each pokemon has
    let movesArray = data.moves;

    // array of all the .move classes in html file; all of the spans containing the move name
    let moveNames = qsa('#' + pToPopulate + ' .move');

    // array of all the .dp classes in html file; all of the spans containing the dp value
    let moveDps = qsa('#' + pToPopulate + ' .dp');

    // array of all the all of the images that should consist of the respective icon image
    let moveIcons = qsa('#' + pToPopulate + ' .moves img');

    // array of all the buttons within the specific p id in html file
    let moveButtons = qsa('#' + pToPopulate + ' .moves button');

    // traverses through all the moves each pokemon has, specified by the JDOC data
    for (let i = 0; i < movesArray.length; i++) {
      moveButtons[i].classList.remove('hidden');
      moveNames[i].textContent = movesArray[i].name;
      moveIcons[i].src = IMG_PREPEND_URL + "icons/" + movesArray[i].type + '.jpg';
      if (moveDps[i]) {
        moveDps[i].textContent = movesArray[i].dp + " DP";
      }
      if (moveDps[i].textContent === "undefined DP") {
        moveDps[i].textContent = '';
      }
    }
    if (movesArray.length < moveButtons.length) {
      for (let j = movesArray.length; j < moveButtons.length; j++) {
        moveButtons[j].classList.add('hidden');
      }
    }
  }

  /**
   * Checks the status of the response and throws an error if it is not ok.
   * @param {Response} res The response object to check
   * @returns {Promise<Response>} A promise that resolves with the response if it is ok.
   * @throws {Error} If the response is not ok
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Shortcut function for creating an element.
   * @param {string} tagName - The tag name of the element to create.
   * @returns {HTMLElement} The newly created element.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Shortcut function for getting an element by an ID.
   * @param {string} id - The ID of the element to retrieve.
   * @returns {HTMLElement} The element with the specified ID.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Shortcut function for query selecting an item.
   * @param {string} selector - The CSS selector to match.
   * @returns {HTMLElement} The first element that matches the specified selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Shortcut function for query selecting all items of a sort.
   * @param {string} selector - The CSS selector to match.
   * @returns {NodeList} A static NodeList containing all elements matching the specified selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();
