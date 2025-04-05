document.addEventListener('DOMContentLoaded', () => {
    const storagePrefix = 'ptsReportCard_'; // Prefix for localStorage keys

    // --- Element Selectors ---
    const reportDateInput = document.getElementById('reportDate');
    const breadcrumbsContainer = document.getElementById('breadcrumbs');
    const reportCardContainer = document.getElementById('reportCardContainer'); // For image capture

    // General Info
    const studentName = document.getElementById('studentName');
    const mockNo = document.getElementById('mockNo');
    const rank = document.getElementById('rank');
    const totalMarks = document.getElementById('totalMarks');
    const percentile = document.getElementById('percentile');

    // Subject Sections (used for looping)
    const subjectSections = document.querySelectorAll('.subject-section');

    // Buttons
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const downloadButton = document.getElementById('downloadButton');

    // --- Utility Functions ---
    const getNumericValue = (element) => parseInt(element.value, 10) || 0;

    const getCurrentDateKey = () => {
        const dateValue = reportDateInput.value;
        return dateValue ? `${storagePrefix}${dateValue}` : null;
    };

    // --- Form Handling ---

    const clearFormFields = () => {
        // Clear general info
        studentName.value = '';
        mockNo.value = '';
        rank.value = '';
        totalMarks.value = '';
        percentile.value = '';

        // Clear subject sections
        subjectSections.forEach(section => {
            section.querySelectorAll('input, textarea').forEach(input => {
                 // Don't clear the readonly total questions input by direct user action
                 if (!input.readOnly) {
                    input.value = '';
                 }
            });
             // Explicitly clear readonly fields too during a full clear
            section.querySelector('.qs-total').value = '';
             // Re-trigger calculations to ensure consistency if needed (optional here)
             // calculateAttempted(section);
             // calculateTotalQuestions(section);
        });

        // Optionally reset date picker? Or keep it for potentially saving a cleared state?
        // reportDateInput.value = ''; // Decide if you want this
        console.log('Form fields cleared.');
        setActiveBreadcrumb(null); // Deselect breadcrumb
    };

    const populateForm = (data) => {
        clearFormFields(); // Start with a clean slate before populating

        // Populate Student Info
        if (data.studentInfo) {
            studentName.value = data.studentInfo.name || '';
            mockNo.value = data.studentInfo.mockNo || '';
            rank.value = data.studentInfo.rank || '';
            totalMarks.value = data.studentInfo.totalMarks || '';
            percentile.value = data.studentInfo.percentile || '';
        }

        // Populate Subject Sections
        subjectSections.forEach(section => {
            const subjectKey = section.dataset.subject; // e.g., 'maths', 'eng'
            const subjectData = data[subjectKey];

            if (subjectData) {
                // Populate manually entered fields first
                section.querySelector('.qs-attempted').value = subjectData.attempted || '';
                section.querySelector('.qs-not-attempted').value = subjectData.notAttempted || '';
                section.querySelector('.qs-correct').value = subjectData.correct || '';
                section.querySelector('.qs-incorrect').value = subjectData.incorrect || '';
                section.querySelector(`#${subjectKey}Time`).value = subjectData.time || '';
                section.querySelector(`#${subjectKey}Marks`).value = subjectData.marks || '';
                section.querySelector(`#${subjectKey}Learnings`).value = subjectData.learnings || '';

                 // Trigger calculations to fill readonly fields
                 calculateTotalQuestions(section);
                 calculateAttempted(section); // Call this second to ensure Attempted reflects C+I
            }
        });
    };


    // --- Data Storage (localStorage) ---

    const saveData = () => {
        const currentDateKey = getCurrentDateKey();
        if (!currentDateKey) {
            alert('Please select a date first.');
            return;
        }

        const data = {
            studentInfo: {
                name: studentName.value,
                mockNo: mockNo.value,
                rank: rank.value,
                totalMarks: totalMarks.value,
                percentile: percentile.value,
            },
        };

        subjectSections.forEach(section => {
            const subjectKey = section.dataset.subject;
            data[subjectKey] = {
                // Store the calculated values too for completeness? Or just inputs?
                // Storing inputs is safer if calculation logic changes.
                // total: section.querySelector('.qs-total').value, // Calculated
                attempted: section.querySelector('.qs-attempted').value,
                notAttempted: section.querySelector('.qs-not-attempted').value,
                correct: section.querySelector('.qs-correct').value,
                incorrect: section.querySelector('.qs-incorrect').value,
                time: section.querySelector(`#${subjectKey}Time`).value,
                marks: section.querySelector(`#${subjectKey}Marks`).value,
                learnings: section.querySelector(`#${subjectKey}Learnings`).value,
            };
        });


        try {
            localStorage.setItem(currentDateKey, JSON.stringify(data));
            alert(`Data saved for ${reportDateInput.value}!`);
            populateBreadcrumbs(); // Update breadcrumbs in case it's a new date
            setActiveBreadcrumb(reportDateInput.value); // Keep current date active
            // Don't clear form automatically - user might want to tweak and re-save
            // clearFormFields(); // Removed: Clear only if explicitly requested
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            alert('Error saving data. LocalStorage might be full or disabled.');
        }
    };

    const loadData = () => {
        const currentDateKey = getCurrentDateKey();
        if (!currentDateKey) {
            // console.log('No date selected, clearing form.');
            clearFormFields(); // Clear form if no date is selected
            setActiveBreadcrumb(null);
            return;
        }

        const savedData = localStorage.getItem(currentDateKey);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                populateForm(data);
                setActiveBreadcrumb(reportDateInput.value);
                // console.log(`Data loaded for ${reportDateInput.value}`);
            } catch (error) {
                console.error('Error parsing data from localStorage:', error);
                alert('Error loading data. Saved data might be corrupted.');
                localStorage.removeItem(currentDateKey); // Clear corrupted data
                clearFormFields();
                setActiveBreadcrumb(null);
            }
        } else {
            // console.log(`No saved data found for ${reportDateInput.value}. Clearing form.`);
            clearFormFields(); // Clear form if no data exists for the selected date
            setActiveBreadcrumb(reportDateInput.value); // Keep datepicker visually selected
        }
    };


    // --- Breadcrumbs ---

    const populateBreadcrumbs = () => {
        breadcrumbsContainer.innerHTML = ''; // Clear existing breadcrumbs
        const dates = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(storagePrefix)) {
                dates.push(key.substring(storagePrefix.length));
            }
        }

        // Sort dates chronologically (most recent first)
        dates.sort((a, b) => new Date(b) - new Date(a));

        dates.forEach(date => {
            const button = document.createElement('button');
            button.textContent = date;
            button.dataset.date = date;
            button.addEventListener('click', () => {
                reportDateInput.value = date; // Set date picker
                loadData(); // Load data for this date
                // Active state will be set by loadData calling setActiveBreadcrumb
            });
            breadcrumbsContainer.appendChild(button);
        });
    };

    const setActiveBreadcrumb = (activeDate) => {
         breadcrumbsContainer.querySelectorAll('button').forEach(button => {
             if(button.dataset.date === activeDate) {
                 button.classList.add('active');
             } else {
                 button.classList.remove('active');
             }
         });
    };


    // --- Auto Calculations ---

    const calculateTotalQuestions = (subjectSection) => {
        const attempted = getNumericValue(subjectSection.querySelector('.qs-attempted'));
        const notAttempted = getNumericValue(subjectSection.querySelector('.qs-not-attempted'));
        const totalInput = subjectSection.querySelector('.qs-total');
        totalInput.value = attempted + notAttempted;
    };

    const calculateAttempted = (subjectSection) => {
        const correct = getNumericValue(subjectSection.querySelector('.qs-correct'));
        const incorrect = getNumericValue(subjectSection.querySelector('.qs-incorrect'));
        const attemptedInput = subjectSection.querySelector('.qs-attempted');
         // Avoid infinite loops: only update if the sum is different
         if (getNumericValue(attemptedInput) !== (correct + incorrect)) {
            attemptedInput.value = correct + incorrect;
             // If attempted is updated, total questions might also need updating
             calculateTotalQuestions(subjectSection);
         }

    };

    // Attach calculation listeners to relevant inputs
    subjectSections.forEach(section => {
        const attemptedInput = section.querySelector('.qs-attempted');
        const notAttemptedInput = section.querySelector('.qs-not-attempted');
        const correctInput = section.querySelector('.qs-correct');
        const incorrectInput = section.querySelector('.qs-incorrect');

        // Update Total when Attempted or Not Attempted changes
        attemptedInput.addEventListener('input', () => calculateTotalQuestions(section));
        notAttemptedInput.addEventListener('input', () => calculateTotalQuestions(section));

        // Update Attempted when Correct or Incorrect changes
        correctInput.addEventListener('input', () => calculateAttempted(section));
        incorrectInput.addEventListener('input', () => calculateAttempted(section));

        // --- Bidirectional Calculation (Handle with Care) ---
        // If you want typing in Attempted to influence Incorrect (assuming Correct is filled):
        /*
        attemptedInput.addEventListener('input', () => {
            const attempted = getNumericValue(attemptedInput);
            const correct = getNumericValue(correctInput);
            if (attempted >= correct) {
                 // Only update if it makes sense
                 incorrectInput.value = attempted - correct;
                 calculateTotalQuestions(section); // Keep total updated
            }
            // Optional: Add logic if Correct is empty and Incorrect is filled?
        });
        */
        // This adds complexity and potential user confusion, stick to C+I => A for now.
    });


    // --- Image Download ---

    const downloadReportCard = () => {
        const date = reportDateInput.value || 'report';
        const filename = `PTS_Report_Card_${date}.png`;

        // Optional: Add a class to body to temporarily change styles
        // document.body.classList.add('capturing');

        html2canvas(reportCardContainer, {
            scale: 2, // Increase scale for better resolution
            useCORS: true, // If using external images/fonts (though unlikely here)
            logging: true, // Enable logging for debugging
            onrendered: function() { // Callback for older versions, not needed for promise
                 // Reset styles if changed
                 // document.body.classList.remove('capturing');
            }
         }).then(canvas => {
            // Reset styles if changed
             // document.body.classList.remove('capturing');

            const image = canvas.toDataURL('image/png');

            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.download = filename;
            link.href = image;
            link.click();
            link.remove(); // Clean up the temporary link
        }).catch(err => {
             // Reset styles if changed
             // document.body.classList.remove('capturing');
             console.error("Error generating image:", err);
             alert("Sorry, couldn't generate the image.");
        });
    };


    // --- Event Listeners ---
    saveButton.addEventListener('click', saveData);
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the current form? This will not delete saved data.')) {
            clearFormFields();
        }
    });
    downloadButton.addEventListener('click', downloadReportCard);
    reportDateInput.addEventListener('change', loadData); // Load data when date changes


    // --- Initial Load ---
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    reportDateInput.value = today; // Set default date to today
    populateBreadcrumbs(); // Show saved dates
    loadData(); // Load data for the default date (today) or clear if none

});
