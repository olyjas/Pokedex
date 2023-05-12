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
  //let p1CurrentHp;

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
   * This function populates the pokedex with all
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
   * JSDOC COMMENT FILL IN LATER
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
   * JSDOC COMMENT FILL IN LATER
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
   * JSDOC COMMENT FILL IN LATER
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
   * JSDOC COMMENT FILL IN LATER
   */
  function makeFoundSpritesClickable() {
    let foundSprites = qsa('.found');
    console.log(foundSprites);
    for (let i = 0; i < foundSprites.length; i++) {
      let currPokemonShortName = foundSprites[i].id;
      console.log(currPokemonShortName);
      console.log(foundSprites[i].id);
      foundSprites[i].addEventListener('click', () => {
        cardRequest(currPokemonShortName);
      });
    }
  }

  /**
   * JSDOC COMMENT FILL IN LATER
   */
  function cardRequest(currPokemonShortName) {
    currentPokemonShortName = currPokemonShortName;
    console.log(currentPokemonShortName);
    let url = POKEMON_NAMES_URL + '?pokemon=' + currPokemonShortName;
    fetch(url)
      .then(statusCheck)
      .then((resp) => resp.json())
      .then((resp) => {
        console.log(resp);
        populateCardInfo(resp, 'p1');
      })
      .catch(console.error);

    // getting start button ready after card info has been populated
    let startButton = id('start-btn');
    startButton.classList.remove('hidden');

    startButton.addEventListener('click', generateMainView);
  }

  /**
   * JSDOC COMMENT FILL IN LATER
   */
  function populateCardInfo(data, pToPopulate) {

    //let cardContainer = id('pToPopulate');
    let cardInfoObject = data.info;
    let nameOnCard = qs('#' + pToPopulate + ' .name');
    nameOnCard.textContent = data.name;
    console.log(nameOnCard);
    let imageOnCard = qs('#' + pToPopulate + ' .pokepic');
    imageOnCard.src = IMG_PREPEND_URL + "images/" + data.shortname + ".jpg";
    let typeOnCard = qs('#' + pToPopulate + ' .type');
    typeOnCard.src = IMG_PREPEND_URL + "icons/" + cardInfoObject.type + ".jpg";
    console.log(typeOnCard.src);
    let weaknessOnCard = qs('#' + pToPopulate + ' .weakness');
    weaknessOnCard.src = IMG_PREPEND_URL + "icons/" + cardInfoObject.weakness + ".jpg";
    console.log(weaknessOnCard.src);
    let hpOnCard = qs('#' + pToPopulate + ' .hp');
    hpOnCard.textContent = data.hp + "HP";
    let descriptionOnCard = qs('#' + pToPopulate + ' .info');
    console.log(descriptionOnCard);
    descriptionOnCard.textContent = cardInfoObject.description;
    console.log(descriptionOnCard.textContent);
    populateMovesInfo(data, pToPopulate);
  }

  /**
   * JSDOC COMMENT FILL IN LATER
   */
  function generateMainView() {
    console.log("went into generateMainView function");
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
          console.log(moveName);
          gamePlayRequest(gameId, playerId, moveName);
        });
      }
      let heading = qs('h1');
      heading.textContent = 'Pokemon Battle!';
      console.log(currentPokemonShortName);
      initializeGameRequest();
    }
  }

  /**
   * JSDOC COMMENT FILL IN LATER
   */
  function gamePlayRequest(guid, pid, moveName) {
    id('loading').classList.remove('hidden');
    let letters = moveName.split(" ");
    let moveNameWithoutSpaces = "";
    for (let i = 0; i < letters.length; i++) {
      moveNameWithoutSpaces += letters[i];
    }
    moveName = moveNameWithoutSpaces.toLowerCase();
    console.log(moveName);
    console.log('went into gamePlayRequest function');
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
   * JSDOC COMMENT FILL IN LATER
   */
  function gamePlay(data) {
    console.log(data);
    let results = data.results;
    console.log(results);
    id('loading').classList.add('hidden');
    let p1Move = results['p1-move'];
    console.log(p1Move);
    let p2Move = results['p2-move'];
    let p1Result = results['p1-result'];
    let p2Result = results['p2-result'];
    id('loading').classList.add('hidden');
    id('results-container').classList.remove('hidden');
    id('p1-turn-results').classList.remove('hidden');
    id('p2-turn-results').classList.remove('hidden');
    id('p1-turn-results').textContent = 'Player 1 played ' + p1Move + ' and ' + p1Result + "!";
    id('p2-turn-results').textContent = 'Player 2 played ' + p2Move + ' and ' + p2Result + "!";
    //if (p2Move === null || p2Result === null) {
    //  id('p2-turn-results').classList.add('hidden');
    //}
    updateHealthBar(data);
    if (p2Move === null || p2Result === null || p1Result === 'flee') {
      id('p2-turn-results').classList.add('hidden');
    }
  }

  /**
   * JSDOC COMMENT FILL IN LATER
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
    console.log(p1HealthPercentage);
    console.log(p2HealthPercentage);
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
   * JSDOC COMMENT FILL IN LATER
   */
  function isGameOver(p2Data, p1HealthPercentage, p2HealthPercentage) {
    if (p1HealthPercentage === 0) {
      let heading = qs('h1');
      heading.textContent = 'You lost!';
      endGame();
    } else if (p2HealthPercentage === 0) {
      let heading = qs('h1');
      heading.textContent = 'You won!';
      endGame(p2Data);
    }
  }

    /**
   * JSDOC COMMENT FILL IN LATER
   */
  function endGame(p2Data) {
    let backToPokedexButton = id('endgame');
    backToPokedexButton.classList.remove('hidden');
    let fleeButton = id('flee-btn');
    fleeButton.classList.add('hidden');
    let p1Moves = qsa('.moves button');
    for (let i = 0; i < p1Moves.length; i++) {
      console.log(p1Moves[i]);
      console.log('game has ended');
      p1Moves[i].disabled = true;
    }
    backToPokedexButton.addEventListener('click', () => {
      backToPokedex(p2Data);
    });
  }

    /**
   * JSDOC COMMENT FILL IN LATER
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
    let addedPokemonShortname = p2Data.shortname;
    let addedPokemonSprite = id(addedPokemonShortname);
    if (!addedPokemonSprite.classList.contains('found')) {
      addedPokemonSprite.classList.add('found');
    }
    addedPokemonSprite.addEventListener('click', () => {
      cardRequest(addedPokemonShortname);
    });
  }

    /**
   * JSDOC COMMENT FILL IN LATER
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
   * JSDOC COMMENT FILL IN LATER
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
   * JSDOC COMMENT FILL IN LATER
   */
  function initializeGame(data) {
    console.log(data);
    let p2Data = data.p2;
    console.log(p2Data);
    populateCardInfo(p2Data, 'p2');
    gameId = data.guid;
    playerId = data.pid;
    console.log(gameId);
    console.log(playerId);
  }

  /**
   * JSDOC COMMENT FILL IN LATER
   */
  function populateMovesInfo(data, pToPopulate) {
    // array of all the moves each pokemon has
    let movesArray = data.moves;

    // array of all the .move classes in html file; all of the spans containing the move name
    // as an inline comment
    let moveNames = qsa('#' + pToPopulate + ' .move');

    // array of all the .dp classes in html file; all of the spans containing the dp value
    // as an inline comment
    let moveDps = qsa('#' + pToPopulate + ' .dp');


    // array of all the images within the .moves class in html file; all of the images that should
    // consist of the respective icon image
    let moveIcons = qsa('#' + pToPopulate + ' .moves img');

    // array of all the buttons within the p1 id in html file
    let moveButtons = qsa('#' + pToPopulate + ' .moves button');

    // traverses through all the moves each pokemon has, specified by the JDOC data
    for (let i = 0; i < movesArray.length; i++) {
      moveButtons[i].classList.remove('hidden');
      console.log(movesArray[i].name);
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
