document.addEventListener('DOMContentLoaded', () => {
    const storageKey = 'ptsReportCardData';

    // --- Element Selectors ---
    const studentName = document.getElementById('studentName');
    const mockNo = document.getElementById('mockNo');
    const rank = document.getElementById('rank');
    const totalMarks = document.getElementById('totalMarks');
    const percentile = document.getElementById('percentile');

    // Maths Elements
    const mathsQuestions = document.getElementById('mathsQuestions');
    const mathsAttempted = document.getElementById('mathsAttempted');
    const mathsNotAttempted = document.getElementById('mathsNotAttempted');
    const mathsCorrect = document.getElementById('mathsCorrect');
    const mathsIncorrect = document.getElementById('mathsIncorrect');
    const mathsTime = document.getElementById('mathsTime');
    const mathsMarks = document.getElementById('mathsMarks');
    const mathsLearnings = document.getElementById('mathsLearnings');

    // English Elements
    const engQuestions = document.getElementById('engQuestions');
    const engAttempted = document.getElementById('engAttempted');
    const engNotAttempted = document.getElementById('engNotAttempted');
    const engCorrect = document.getElementById('engCorrect');
    const engIncorrect = document.getElementById('engIncorrect');
    const engTime = document.getElementById('engTime');
    const engMarks = document.getElementById('engMarks');
    const engLearnings = document.getElementById('engLearnings');

    // GK/GS Elements
    const gkgsQuestions = document.getElementById('gkgsQuestions');
    const gkgsAttempted = document.getElementById('gkgsAttempted');
    const gkgsNotAttempted = document.getElementById('gkgsNotAttempted');
    const gkgsCorrect = document.getElementById('gkgsCorrect');
    const gkgsIncorrect = document.getElementById('gkgsIncorrect');
    const gkgsTime = document.getElementById('gkgsTime');
    const gkgsMarks = document.getElementById('gkgsMarks');
    const gkgsLearnings = document.getElementById('gkgsLearnings');

    // Reasoning Elements
    const reasQuestions = document.getElementById('reasQuestions');
    const reasAttempted = document.getElementById('reasAttempted');
    const reasNotAttempted = document.getElementById('reasNotAttempted');
    const reasCorrect = document.getElementById('reasCorrect');
    const reasIncorrect = document.getElementById('reasIncorrect');
    const reasTime = document.getElementById('reasTime');
    const reasMarks = document.getElementById('reasMarks');
    const reasLearnings = document.getElementById('reasLearnings');

    // Buttons
    const saveButton = document.getElementById('saveButton');
    const loadButton = document.getElementById('loadButton');
    const clearButton = document.getElementById('clearButton');

    // --- Functions ---

    const saveData = () => {
        const data = {
            studentInfo: {
                name: studentName.value,
                mockNo: mockNo.value,
                rank: rank.value,
                totalMarks: totalMarks.value,
                percentile: percentile.value,
            },
            maths: {
                questions: mathsQuestions.value,
                attempted: mathsAttempted.value,
                notAttempted: mathsNotAttempted.value,
                correct: mathsCorrect.value,
                incorrect: mathsIncorrect.value,
                time: mathsTime.value,
                marks: mathsMarks.value,
                learnings: mathsLearnings.value,
            },
            english: {
                questions: engQuestions.value,
                attempted: engAttempted.value,
                notAttempted: engNotAttempted.value,
                correct: engCorrect.value,
                incorrect: engIncorrect.value,
                time: engTime.value,
                marks: engMarks.value,
                learnings: engLearnings.value,
            },
            gkgs: {
                questions: gkgsQuestions.value,
                attempted: gkgsAttempted.value,
                notAttempted: gkgsNotAttempted.value,
                correct: gkgsCorrect.value,
                incorrect: gkgsIncorrect.value,
                time: gkgsTime.value,
                marks: gkgsMarks.value,
                learnings: gkgsLearnings.value,
            },
            reasoning: {
                questions: reasQuestions.value,
                attempted: reasAttempted.value,
                notAttempted: reasNotAttempted.value,
                correct: reasCorrect.value,
                incorrect: reasIncorrect.value,
                time: reasTime.value,
                marks: reasMarks.value,
                learnings: reasLearnings.value,
            }
        };

        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
            alert('Data saved successfully!');
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            alert('Error saving data. LocalStorage might be full or disabled.');
        }
    };

    const loadData = () => {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);

                // Populate Student Info
                studentName.value = data.studentInfo?.name || '';
                mockNo.value = data.studentInfo?.mockNo || '';
                rank.value = data.studentInfo?.rank || '';
                totalMarks.value = data.studentInfo?.totalMarks || '';
                percentile.value = data.studentInfo?.percentile || '';

                // Populate Maths
                if (data.maths) {
                    mathsQuestions.value = data.maths.questions || '';
                    mathsAttempted.value = data.maths.attempted || '';
                    mathsNotAttempted.value = data.maths.notAttempted || '';
                    mathsCorrect.value = data.maths.correct || '';
                    mathsIncorrect.value = data.maths.incorrect || '';
                    mathsTime.value = data.maths.time || '';
                    mathsMarks.value = data.maths.marks || '';
                    mathsLearnings.value = data.maths.learnings || '';
                }

                // Populate English
                 if (data.english) {
                    engQuestions.value = data.english.questions || '';
                    engAttempted.value = data.english.attempted || '';
                    engNotAttempted.value = data.english.notAttempted || '';
                    engCorrect.value = data.english.correct || '';
                    engIncorrect.value = data.english.incorrect || '';
                    engTime.value = data.english.time || '';
                    engMarks.value = data.english.marks || '';
                    engLearnings.value = data.english.learnings || '';
                }

                 // Populate GK/GS
                 if (data.gkgs) {
                    gkgsQuestions.value = data.gkgs.questions || '';
                    gkgsAttempted.value = data.gkgs.attempted || '';
                    gkgsNotAttempted.value = data.gkgs.notAttempted || '';
                    gkgsCorrect.value = data.gkgs.correct || '';
                    gkgsIncorrect.value = data.gkgs.incorrect || '';
                    gkgsTime.value = data.gkgs.time || '';
                    gkgsMarks.value = data.gkgs.marks || '';
                    gkgsLearnings.value = data.gkgs.learnings || '';
                }

                 // Populate Reasoning
                 if (data.reasoning) {
                    reasQuestions.value = data.reasoning.questions || '';
                    reasAttempted.value = data.reasoning.attempted || '';
                    reasNotAttempted.value = data.reasoning.notAttempted || '';
                    reasCorrect.value = data.reasoning.correct || '';
                    reasIncorrect.value = data.reasoning.incorrect || '';
                    reasTime.value = data.reasoning.time || '';
                    reasMarks.value = data.reasoning.marks || '';
                    reasLearnings.value = data.reasoning.learnings || '';
                }

                // Optional: Notify user data was loaded
                // alert('Data loaded successfully!');

            } catch (error) {
                console.error('Error parsing data from localStorage:', error);
                alert('Error loading data. Saved data might be corrupted.');
                localStorage.removeItem(storageKey); // Clear corrupted data
            }
        } else {
             // Optional: Notify user if no data found
             // alert('No saved data found.');
        }
    };

    const clearData = () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            // Clear all input fields and textareas
            const inputs = document.querySelectorAll('input, textarea');
            inputs.forEach(input => input.value = '');

            // Remove data from localStorage
            localStorage.removeItem(storageKey);
            alert('All data cleared.');
        }
    };

    // --- Event Listeners ---
    saveButton.addEventListener('click', saveData);
    loadButton.addEventListener('click', loadData);
    clearButton.addEventListener('click', clearData);

    // --- Initial Load ---
    loadData(); // Automatically load data when the page starts
});
