document.addEventListener('DOMContentLoaded', () => {
    // --- Global Settings ---
    const storagePrefix = 'ptsReportCard_'; // Prefix for localStorage keys
    // Use the UMD global name for jsPDF
    const { jsPDF } = window.jspdf;
    if (typeof jsPDF === 'undefined') {
        console.error("jsPDF library not found. Make sure it's included.");
    }
     if (typeof html2canvas === 'undefined') {
        console.error("html2canvas library not found. Make sure it's included.");
    }


    // --- Element Selectors ---
    const reportDateInput = document.getElementById('reportDate');
    const breadcrumbsContainer = document.getElementById('breadcrumbs');
    const reportCardContainer = document.getElementById('reportCardContainer'); // For capture

    // General Info
    const studentName = document.getElementById('studentName');
    const mockNo = document.getElementById('mockNo');
    const rank = document.getElementById('rank');
    const totalMarksInput = document.getElementById('totalMarks'); // Renamed for clarity
    const percentile = document.getElementById('percentile');

    // Marking Scheme Controls
    const marksPerQuestionGroup = document.getElementById('marksPerQuestionGroup');
    const negativeMarkingGroup = document.getElementById('negativeMarkingGroup');

    // Subject Sections (used for looping)
    const subjectSections = document.querySelectorAll('.subject-section');

    // Buttons
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const downloadButton = document.getElementById('downloadButton'); // Image download
    const downloadPdfButton = document.getElementById('downloadPdfButton'); // PDF download

    // --- Utility Functions ---
    const getNumericValue = (element, defaultValue = 0) => {
        if (!element) return defaultValue;
        const value = parseInt(element.value, 10);
        return isNaN(value) ? defaultValue : value;
    };

    const getFloatValue = (element, defaultValue = 0.0) => {
        if (!element) return defaultValue;
        const value = parseFloat(element.value);
        return isNaN(value) ? defaultValue : value;
    }

    const getCurrentDateKey = () => {
        const dateValue = reportDateInput.value;
        return dateValue ? `${storagePrefix}${dateValue}` : null;
    };

    const getMarkingSettings = () => {
        const marksPerQElement = marksPerQuestionGroup.querySelector('input[name="marksPerQuestion"]:checked');
        const negMarkingElement = negativeMarkingGroup.querySelector('input[name="negativeMarking"]:checked');

        const marksPerQ = marksPerQElement ? parseFloat(marksPerQElement.value) : 2; // Default to 2

        let negMarkingRatio = 0; // Default to None
        if (negMarkingElement) {
            const val = negMarkingElement.value;
            if (val === '1/2') negMarkingRatio = 0.5;
            else if (val === '1/3') negMarkingRatio = 1/3;
            else if (val === '1/4') negMarkingRatio = 0.25;
            // else remains 0 for '0' (None)
        }
        return { marksPerQ, negMarkingRatio };
    };

     // --- Calculation Functions ---

    const calculateSubjectMetrics = (subjectSection) => {
        // Get user inputs
        const totalQsInput = subjectSection.querySelector('.qs-total');
        const attemptedInput = subjectSection.querySelector('.qs-attempted');
        const correctInput = subjectSection.querySelector('.qs-correct');

        // Get output elements
        const incorrectOutput = subjectSection.querySelector('.calc-incorrect');
        const notAttemptedOutput = subjectSection.querySelector('.calc-not-attempted');
        const marksOutput = subjectSection.querySelector('.subj-marks'); // The readonly input

        if (!totalQsInput || !attemptedInput || !correctInput || !incorrectOutput || !notAttemptedOutput || !marksOutput) {
             console.warn('Missing elements in subject section:', subjectSection.dataset.subject);
             return 0; // Return 0 marks if elements are missing
        }

        let totalQs = getNumericValue(totalQsInput);
        let attemptedQs = getNumericValue(attemptedInput);
        let correctQs = getNumericValue(correctInput);

        // --- Validation and Correction ---
        // 1. Correct cannot be more than attempted
        if (correctQs > attemptedQs) {
            correctQs = attemptedQs;
            correctInput.value = correctQs; // Update UI
            // Optionally add a visual cue like a red border temporarily
            // correctInput.style.borderColor = 'red'; setTimeout(() => correctInput.style.borderColor = '', 1500);
        }
         // 2. Attempted cannot be more than total
        if (attemptedQs > totalQs) {
            attemptedQs = totalQs;
            attemptedInput.value = attemptedQs;
             // If attempted changed, re-check correct
             if (correctQs > attemptedQs) {
                 correctQs = attemptedQs;
                 correctInput.value = correctQs;
             }
        }

        // --- Calculations ---
        const incorrectQs = Math.max(0, attemptedQs - correctQs);
        const notAttemptedQs = Math.max(0, totalQs - attemptedQs);

        // Display calculated question counts
        incorrectOutput.textContent = incorrectQs;
        notAttemptedOutput.textContent = notAttemptedQs;

        // Calculate Marks
        const { marksPerQ, negMarkingRatio } = getMarkingSettings();
        const positiveMarks = correctQs * marksPerQ;
        const negativeMarks = incorrectQs * marksPerQ * negMarkingRatio;
        const subjectMarks = positiveMarks - negativeMarks;

        marksOutput.value = subjectMarks.toFixed(2); // Display marks with 2 decimal places

        return subjectMarks; // Return the calculated marks for overall total
    };

    const calculateOverallTotalMarks = () => {
        let overallTotal = 0;
        subjectSections.forEach(section => {
            // Re-run calculation for each section to ensure consistency and get marks
            overallTotal += calculateSubjectMetrics(section);
        });
        totalMarksInput.value = overallTotal.toFixed(2);
    };

    // --- Form Handling ---

    const clearFormFields = () => {
        // Clear general info
        studentName.value = '';
        mockNo.value = '';
        rank.value = '';
        totalMarksInput.value = ''; // Clear calculated total marks
        percentile.value = '';

        // Clear subject sections
        subjectSections.forEach(section => {
            // Clear user inputs
            section.querySelector('.qs-total').value = '';
            section.querySelector('.qs-attempted').value = '';
            section.querySelector('.qs-correct').value = '';
            section.querySelector('.subj-time').value = '';
            section.querySelector('.subj-learnings').value = '';

            // Clear calculated displays/outputs
            section.querySelector('.calc-incorrect').textContent = '0';
            section.querySelector('.calc-not-attempted').textContent = '0';
            section.querySelector('.subj-marks').value = ''; // Clear readonly marks input
        });

        // Reset marking scheme to default? Optional. Let's reset to defaults defined in HTML.
        marksPerQuestionGroup.querySelector('input[value="2"]').checked = true;
        negativeMarkingGroup.querySelector('input[value="1/2"]').checked = true;


        console.log('Form fields cleared.');
        setActiveBreadcrumb(null); // Deselect breadcrumb
        // Trigger calculation to ensure all calculated fields reflect the cleared state (mostly zeros)
        // calculateOverallTotalMarks(); // Should result in 0
    };

    const populateForm = (data) => {
        clearFormFields(); // Start clean

        // Populate Student Info
        if (data.studentInfo) {
            studentName.value = data.studentInfo.name || '';
            mockNo.value = data.studentInfo.mockNo || '';
            rank.value = data.studentInfo.rank || '';
            // totalMarksInput is calculated, so don't load it directly
            percentile.value = data.studentInfo.percentile || '';
        }

        // Populate Marking Scheme Settings
         if (data.settings) {
             const mpqRadio = marksPerQuestionGroup.querySelector(`input[value="${data.settings.marksPerQ}"]`);
             if (mpqRadio) mpqRadio.checked = true;

             const nmRadio = negativeMarkingGroup.querySelector(`input[value="${data.settings.negMarking}"]`);
              if (nmRadio) nmRadio.checked = true;
         }


        // Populate Subject Sections (User Inputs Only)
        subjectSections.forEach(section => {
            const subjectKey = section.dataset.subject;
            const subjectData = data[subjectKey];

            if (subjectData) {
                section.querySelector('.qs-total').value = subjectData.total || '';
                section.querySelector('.qs-attempted').value = subjectData.attempted || '';
                section.querySelector('.qs-correct').value = subjectData.correct || '';
                section.querySelector('.subj-time').value = subjectData.time || '';
                section.querySelector('.subj-learnings').value = subjectData.learnings || '';
            }
        });

        // Trigger calculations AFTER all inputs and settings are populated
        calculateOverallTotalMarks();
    };


    // --- Data Storage (localStorage) ---

    const saveData = () => {
        const currentDateKey = getCurrentDateKey();
        if (!currentDateKey) {
            alert('Please select a date first.');
            return;
        }

        const currentSettings = getMarkingSettings(); // Get current radio button selections
        const selectedMpq = marksPerQuestionGroup.querySelector('input[name="marksPerQuestion"]:checked')?.value || '2';
        const selectedNegMark = negativeMarkingGroup.querySelector('input[name="negativeMarking"]:checked')?.value || '1/2';


        const data = {
            studentInfo: {
                name: studentName.value,
                mockNo: mockNo.value,
                rank: rank.value,
                percentile: percentile.value,
                // DO NOT save totalMarks - it's calculated
            },
            settings: { // Save the marking scheme settings
                marksPerQ: selectedMpq,
                negMarking: selectedNegMark
            },
        };

        subjectSections.forEach(section => {
            const subjectKey = section.dataset.subject;
            data[subjectKey] = {
                // Store ONLY user inputs
                total: section.querySelector('.qs-total').value,
                attempted: section.querySelector('.qs-attempted').value,
                correct: section.querySelector('.qs-correct').value,
                time: section.querySelector('.subj-time').value,
                learnings: section.querySelector('.subj-learnings').value,
                // DO NOT store calculated: incorrect, notAttempted, marks
            };
        });


        try {
            localStorage.setItem(currentDateKey, JSON.stringify(data));
            alert(`Data saved for ${reportDateInput.value}!`);
            populateBreadcrumbs(); // Update breadcrumbs
            setActiveBreadcrumb(reportDateInput.value); // Keep current date active
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            alert('Error saving data. LocalStorage might be full or disabled.');
        }
    };

    const loadData = () => {
        const currentDateKey = getCurrentDateKey();
        if (!currentDateKey) {
            clearFormFields();
            setActiveBreadcrumb(null);
            return;
        }

        const savedData = localStorage.getItem(currentDateKey);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                populateForm(data);
                setActiveBreadcrumb(reportDateInput.value);
            } catch (error) {
                console.error('Error parsing data from localStorage:', error);
                alert('Error loading data. Saved data might be corrupted.');
                localStorage.removeItem(currentDateKey); // Clear corrupted data
                clearFormFields();
                setActiveBreadcrumb(null);
            }
        } else {
            // No data for this date, clear form but keep date selected
            clearFormFields();
            setActiveBreadcrumb(reportDateInput.value);
             // Trigger calculation after clearing to ensure consistency
             calculateOverallTotalMarks();
        }
    };


    // --- Breadcrumbs ---

    const populateBreadcrumbs = () => {
        breadcrumbsContainer.innerHTML = ''; // Clear existing
        const dates = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(storagePrefix)) {
                dates.push(key.substring(storagePrefix.length));
            }
        }
        dates.sort((a, b) => new Date(b) - new Date(a)); // Sort recent first

        dates.forEach(date => {
            const button = document.createElement('button');
            button.textContent = date;
            button.dataset.date = date;
            button.addEventListener('click', () => {
                reportDateInput.value = date;
                loadData(); // Load data for this date
            });
            breadcrumbsContainer.appendChild(button);
        });
    };

    const setActiveBreadcrumb = (activeDate) => {
         breadcrumbsContainer.querySelectorAll('button').forEach(button => {
             button.classList.toggle('active', button.dataset.date === activeDate);
         });
    };


    // --- Download Functions ---

    const downloadReportCardImage = () => {
        const date = reportDateInput.value || 'report';
        const filename = `PTS_Report_Card_${date}.png`;

        // Optional: Add class to body for styling during capture
        // document.body.classList.add('capturing');

        html2canvas(reportCardContainer, {
            scale: 2, // Higher resolution
            useCORS: true,
            logging: false, // Set to true for debugging
            // Ensure background is captured if container doesn't have explicit one
            backgroundColor: window.getComputedStyle(document.body).backgroundColor
         }).then(canvas => {
            // document.body.classList.remove('capturing'); // Remove class if added
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = filename;
            link.href = image;
            link.click();
            link.remove();
        }).catch(err => {
             // document.body.classList.remove('capturing'); // Remove class if added
             console.error("Error generating image:", err);
             alert("Sorry, couldn't generate the image.");
        });
    };

    const downloadReportCardPDF = () => {
         if (typeof jsPDF === 'undefined') {
            alert("PDF generation library (jsPDF) not loaded.");
            return;
         }
        const date = reportDateInput.value || 'report';
        const filename = `PTS_Report_Card_${date}.pdf`;
        const pdf = new jsPDF({
            orientation: 'l', // landscape
            unit: 'pt', // points
            format: 'a4', // or specific dimensions
            putOnlyUsedFonts:true,
            floatPrecision: 16 // or "smart"
        });

         // Optional: Add class to body for styling during capture
        // document.body.classList.add('capturing');

        // Use the html method of jsPDF - requires html2canvas internally for complex rendering
        pdf.html(reportCardContainer, {
            callback: function (pdf) {
                // document.body.classList.remove('capturing'); // Remove class if added
                pdf.save(filename);
                 console.log('PDF generated and download triggered.');
            },
            html2canvas: {
                scale: 2, // Adjust scale for better PDF quality if needed
                useCORS: true,
                 backgroundColor: window.getComputedStyle(document.body).backgroundColor
                // You might need to adjust margins or width here
            },
            x: 15, // Left margin
            y: 15, // Top margin
            width: pdf.internal.pageSize.getWidth() - 30, // Adjust width to fit with margins
             windowWidth: reportCardContainer.scrollWidth // Important for capturing full width if scrolling
        }).catch(err => {
             // document.body.classList.remove('capturing'); // Remove class if added
             console.error("Error generating PDF:", err);
             alert("Sorry, couldn't generate the PDF.");
        });
    };


    // --- Event Listeners ---
    saveButton.addEventListener('click', saveData);
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the current form data? This will not delete saved reports.')) {
            clearFormFields();
             calculateOverallTotalMarks(); // Ensure totals are zeroed out visually
        }
    });
    downloadButton.addEventListener('click', downloadReportCardImage);
    downloadPdfButton.addEventListener('click', downloadReportCardPDF);
    reportDateInput.addEventListener('change', loadData);

    // Attach calculation listeners
    subjectSections.forEach(section => {
        const inputsToWatch = section.querySelectorAll('.qs-total, .qs-attempted, .qs-correct');
        inputsToWatch.forEach(input => {
            input.addEventListener('input', () => {
                // Recalculate this specific subject AND the overall total
                calculateSubjectMetrics(section); // Calculate subject first
                calculateOverallTotalMarks(); // Then update overall total
            });
        });
    });

    // Listen for changes in global marking scheme settings
    marksPerQuestionGroup.addEventListener('change', calculateOverallTotalMarks);
    negativeMarkingGroup.addEventListener('change', calculateOverallTotalMarks);


    // --- Initial Load ---
    const today = new Date().toISOString().split('T')[0];
    reportDateInput.value = today;
    populateBreadcrumbs();
    loadData(); // Load data for today (or clear if none)

});
