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
    let roundNumber = 0;

    // Fetch data from JSON file
    fetch('/data.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            fetchScore();
        })
        .catch(error => console.error('Error loading JSON:', error));

    function fetchScore() {
        fetch('/score.json')
            .then(response => response.json())
            .then(scores => {
                const totalScore = scores.reduce((total, score) => total + score.success, 0);
                scoreElement.textContent = totalScore;
                roundNumber = scores.length; // Set the round number based on the existing records
            })
            .catch(error => console.error('Error fetching score:', error));
    }

    function saveScore(success, errors) {
        roundNumber += 1;
        const totalScore = parseInt(scoreElement.textContent) + success;
        const newScore = { round: roundNumber, success, errors, score: totalScore, timestamp: new Date().toISOString() };

        fetch('/score.json')
            .then(response => response.json())
            .then(scores => {
                scores.push(newScore);
                return fetch('/score.json', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(scores, null, 2)
                });
            })
            .then(response => response.text())
            .then(result => {
                console.log(result);
                scoreElement.textContent = totalScore;
            })
            .catch(error => console.error('Error saving score:', error));
    }

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
        const success = parseInt(successElement.textContent);
        const errors = parseInt(errorsElement.textContent);
        alert(`Game over! Your score is ${success}`);
        saveScore(success, errors);
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
