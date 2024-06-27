// game.js
document.addEventListener("DOMContentLoaded", () => {
    const leftColumn = document.querySelector('.left-column');
    const rightColumn = document.querySelector('.right-column');
    const scoreElement = document.getElementById('score');
    const successElement = document.getElementById('success');
    const errorsElement = document.getElementById('errors');
    const timeElement = document.getElementById('time');
    const startButton = document.getElementById('start');
    const restartButton = document.getElementById('restart');

    let selectedLeft = null;
    let data = {};
    let timerInterval;
    let timeRemaining = 60;

    // Fetch data from JSON file
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(jsonData => {
            data = jsonData;
            resetGame();
        })
        .catch(error => console.error('Error loading JSON:', error));

    function startGame() {
        resetScore();
        resetTimer();
        fillContainers();
        startTimer();
        leftColumn.addEventListener('click', handleLeftClick);
        rightColumn.addEventListener('click', handleRightClick);
    }

    function resetGame() {
        resetScore();
        resetTimer();
        fillContainers();
        leftColumn.removeEventListener('click', handleLeftClick);
        rightColumn.removeEventListener('click', handleRightClick);
    }

    function resetScore() {
        scoreElement.textContent = 0;
        successElement.textContent = 0;
        errorsElement.textContent = 0;
    }

    function resetTimer() {
        timeRemaining = 60;
        timeElement.textContent = timeRemaining;
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeRemaining -= 1;
            timeElement.textContent = timeRemaining;
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        alert(`Game over! Your score is ${successElement.textContent}`);
        resetGame();
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function fillContainers() {
        const shuffledSignals = shuffle([...data.signals]);
        const shuffledResponses = shuffle([...data.responses]);

        const signalsSubset = shuffledSignals.slice(0, 10);
        const responsesSubset = shuffledResponses.slice(0, 10);

        const commonElement = signalsSubset[Math.floor(Math.random() * signalsSubset.length)];
        const responseIndex = Math.floor(Math.random() * 10);
        responsesSubset[responseIndex] = commonElement;

        const signalElements = leftColumn.querySelectorAll('.signal');
        const responseElements = rightColumn.querySelectorAll('.response');

        for (let i = 0; i < 10; i++) {
            signalElements[i].textContent = signalsSubset[i];
            responseElements[i].textContent = responsesSubset[i];
        }
    }

    function handleLeftClick(event) {
        handleClick(event, 'left');
    }

    function handleRightClick(event) {
        handleClick(event, 'right');
    }

    function handleClick(event, column) {
        if (timeRemaining <= 0) return; // Ignore clicks if time is up

        const target = event.target;

        if (column === 'left') {
            if (selectedLeft === target) {
                selectedLeft = null;
                removeHighlight();
            } else {
                selectedLeft = target;
                highlightSelected(target, column);
            }
        } else if (column === 'right' && selectedLeft) {
            if (selectedLeft === target) {
                selectedLeft = null;
                removeHighlight();
            } else {
                if (compareElements(selectedLeft, target)) {
                    updateScore('success');
                } else {
                    updateScore('errors');
                }
                fillContainers();
                selectedLeft = null;
                removeHighlight();
            }
        }
    }

    function highlightSelected(element, column) {
        removeHighlight();
        element.classList.add('selected');
    }

    function removeHighlight() {
        const selectedElements = document.querySelectorAll('.selected');
        selectedElements.forEach(el => el.classList.remove('selected'));
    }

    function compareElements(left, right) {
        return left.textContent === right.textContent;
    }

    function updateScore(type) {
        const score = parseInt(scoreElement.textContent);
        const success = parseInt(successElement.textContent);

        if (type === 'success') {
            successElement.textContent = success + 1;
            scoreElement.textContent = score + 1;
        } else if (type === 'errors') {
            errorsElement.textContent = parseInt(errorsElement.textContent) + 1;
        }
    }

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});
