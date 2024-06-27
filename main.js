// game.js
document.addEventListener("DOMContentLoaded", () => {
    const leftColumn = document.querySelector('.left-column');
    const rightColumn = document.querySelector('.right-column');
    const scoreElement = document.getElementById('score');
    const successElement = document.getElementById('success');
    const errorsElement = document.getElementById('errors');

    let selectedLeft = null;
    let data = {};

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
            fillContainers();
        })
        .catch(error => console.error('Error loading JSON:', error));

    // Shuffle and fill the containers
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

        // Select 10 unique elements from shuffled signals and responses
        const signalsSubset = shuffledSignals.slice(0, 10);
        const responsesSubset = shuffledResponses.slice(0, 10);

        // Choose a common element to be in both signals and responses
        const commonElement = signalsSubset[Math.floor(Math.random() * signalsSubset.length)];

        // Replace a random element in responses with the common element
        const responseIndex = Math.floor(Math.random() * 10);
        responsesSubset[responseIndex] = commonElement;

        const signalElements = leftColumn.querySelectorAll('.signal');
        const responseElements = rightColumn.querySelectorAll('.response');

        for (let i = 0; i < 10; i++) {
            signalElements[i].textContent = signalsSubset[i];
            responseElements[i].textContent = responsesSubset[i];
        }
    }

    function handleClick(event, column) {
        const target = event.target;

        if (column === 'left') {
            selectedLeft = target;
            highlightSelected(target, column);
        } else if (column === 'right' && selectedLeft) {
            if (compareElements(selectedLeft, target)) {
                updateScore('success');
                fillContainers(); // Refill containers with new elements
            } else {
                updateScore('errors');
                fillContainers(); // Refill containers with new elements
            }
            selectedLeft = null; // reset selection
            removeHighlight();
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
        const errors = parseInt(errorsElement.textContent);

        if (type === 'success') {
            successElement.textContent = success + 1;
        } else if (type === 'errors') {
            errorsElement.textContent = errors + 1;
        }
        scoreElement.textContent = score + 1;
    }

    leftColumn.addEventListener('click', (event) => handleClick(event, 'left'));
    rightColumn.addEventListener('click', (event) => handleClick(event, 'right'));
});
