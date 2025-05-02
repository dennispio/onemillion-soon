document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements (Unchanged) ---
    const body = document.body; const initialPrompt = document.getElementById('initial-prompt'); const initialSlider = document.getElementById('initialScreenTime'); const initialValueDisplay = document.getElementById('initialValue'); const mainExperience = document.getElementById('main-experience'); const chartCanvas = document.getElementById('dailyChart'); const chartCenterText = document.getElementById('chart-center-text'); const sliders = { screen: document.getElementById('screenTime'), sleep: document.getElementById('sleepTime'), work: document.getElementById('workTime'), social: document.getElementById('socialTime') }; const valueDisplays = { screen: document.getElementById('screenTimeValue'), sleep: document.getElementById('sleepTimeValue'), work: document.getElementById('workTimeValue'), social: document.getElementById('socialTimeValue') }; const sliderContainers = { screen: sliders.screen.closest('.slider-container'), sleep: sliders.sleep.closest('.slider-container'), work: sliders.work.closest('.slider-container'), social: sliders.social.closest('.slider-container') }; const daysPerYearDisplay = document.getElementById('daysPerYear'); const yearsInLifeDisplay = document.getElementById('yearsInLife'); const lifetimeGridContainer = document.getElementById('lifetime-grid'); const lifetimeGridText = document.getElementById('lifetime-grid-text'); const warningsContainer = document.getElementById('warnings-container');

    // --- State & Config (Unchanged) ---
    const TOTAL_HOURS = 24; const LIFE_EXPECTANCY = 80; const DAYS_IN_YEAR = 365; const LEAP_YEAR_FACTOR = 365.25; const AGE_START_IMPACT = 0; const MAX_SLIDER_VALUE = 16;
    let state = { screen: 4, sleep: 8, work: 8, social: 4 }; let chartInstance = null; let activeSliderId = null; let experienceStarted = false; let gsapTween = null; let lifetimeDots = [];
    gsap.registerPlugin(TextPlugin);

    // --- Initial Setup ---
    function initializeApp() {
        initialPrompt.classList.add('visible');
        updateSliderUI(initialSlider, parseFloat(initialSlider.value), 'screen');
        initialSlider.addEventListener('input', handleInitialSliderInput);
        initialSlider.addEventListener('pointerdown', () => activeSliderId = 'initialScreenTime');
        // ** Use 'change' or 'pointerup' for triggering the experience start **
        // 'change' fires after release, 'pointerup' fires immediately on release
        initialSlider.addEventListener('pointerup', handleInitialRelease); // Use pointerup for quicker feel
        initialSlider.addEventListener('touchend', handleInitialRelease); // Handle touch release
    }

    function handleInitialSliderInput(e) { /* Unchanged */ const value = parseFloat(e.target.value); initialValueDisplay.textContent = value.toFixed(1); updateSliderUI(e.target, value, 'screen'); if (!experienceStarted) { updateLifetimeImpact(value); } }

    function handleInitialRelease() {
        // console.log("handleInitialRelease called, experienceStarted:", experienceStarted); // Debug log
        if (experienceStarted) return; // Prevent multiple triggers
        activeSliderId = null;
        state.screen = parseFloat(initialSlider.value); // Set state based on final slider value
        startExperience();
    }

    function startExperience() {
        // console.log("startExperience called"); // Debug log
        if (experienceStarted) return;
        experienceStarted = true; // Set flag immediately

        // Calculate initial state *after* screen time is set
        state = calculateTargetState('screen', state.screen, { screen: 0, sleep: 8, work: 8, social: 8 }, true);

        // Hide the prompt
        initialPrompt.classList.remove('visible');
        initialPrompt.classList.add('hidden-final'); // Add class for CSS to potentially use display:none after transition

        // Show the main experience after a delay matching CSS transition
        setTimeout(() => {
            // console.log("Showing main experience"); // Debug log
            mainExperience.classList.add('visible');
            initializeMainExperience();
            // Optional: remove prompt from DOM entirely after animation
            // setTimeout(() => {
            //     if (initialPrompt) initialPrompt.remove();
            // }, 600); // Delay removal slightly longer than transition
        }, 300); // Match CSS transition duration
    }


    function initializeMainExperience() {
        // console.log("initializeMainExperience called"); // Debug log
        for (const key in sliders) { sliders[key].value = state[key]; valueDisplays[key].textContent = state[key].toFixed(1); updateSliderUI(sliders[key], state[key], key); sliders[key].addEventListener('input', handleSliderInput); sliders[key].addEventListener('pointerdown', handleInteractionStart); sliders[key].addEventListener('pointerup', handleInteractionEnd); sliders[key].addEventListener('touchend', handleInteractionEnd); }
        createChart(); generateLifetimeGridStructure(); updateAllUI();
    }

    // --- Chart (Unchanged) ---
    function createChart() { const ctx = chartCanvas.getContext('2d'); const style = getComputedStyle(document.documentElement); chartInstance = new Chart(ctx, { type: 'doughnut', data: { labels: ['Screen Time', 'Sleep / Recovery', 'Work / School', 'Social / Free Time'], datasets: [{ data: [state.screen, state.sleep, state.work, state.social], backgroundColor: [ style.getPropertyValue('--screen-color').trim(), style.getPropertyValue('--sleep-color').trim(), style.getPropertyValue('--work-color').trim(), style.getPropertyValue('--social-color').trim(), ], hoverBackgroundColor: [ '#ff6b6b', '#66e0d8', '#ffd147', '#b0f07b' ], borderColor: style.getPropertyValue('--chart-border-color').trim(), borderWidth: 0, hoverOffset: 15, borderRadius: 8, spacing: 4 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '72%', rotation: -90, circumference: 360, onHover: (event, chartElement) => { event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default'; }, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.85)', titleFont: { size: 14, family: style.getPropertyValue('--main-font').trim()}, bodyFont: { size: 12, family: style.getPropertyValue('--main-font').trim()}, padding: 12, cornerRadius: 6, callbacks: { label: (context) => `${context.label}: ${context.parsed.toFixed(1)} h` } } }, animation: false, } }); }
    function updateChart() { if (!chartInstance) return; chartInstance.data.datasets[0].data = [state.screen, state.sleep, state.work, state.social]; chartInstance.update('none'); }

    // --- Slider Interaction & Rebalancing (Unchanged) ---
    function handleInteractionStart(e) { activeSliderId = e.target.id; const category = activeSliderId.replace('Time', ''); body.classList.add('is-interacting'); Object.values(sliderContainers).forEach(cont => cont.classList.remove('is-active')); if (sliderContainers[category]) { sliderContainers[category].classList.add('is-active'); } }
    function handleInteractionEnd() { activeSliderId = null; body.classList.remove('is-interacting'); Object.values(sliderContainers).forEach(cont => cont.classList.remove('is-active')); }
    function handleSliderInput(e) { const slider = e.target; const category = slider.id.replace('Time', ''); let requestedValue = parseFloat(slider.value); requestedValue = Math.min(requestedValue, MAX_SLIDER_VALUE); if (parseFloat(slider.value) > MAX_SLIDER_VALUE) { slider.value = MAX_SLIDER_VALUE; requestedValue = MAX_SLIDER_VALUE; } valueDisplays[category].textContent = requestedValue.toFixed(1); updateSliderUI(slider, requestedValue, category); const intermediateState = calculateTargetState(category, requestedValue, { ...state }, true); updateLifetimeImpact(intermediateState.screen); const targetState = calculateTargetState(category, requestedValue, { ...state }); if (gsapTween) gsapTween.kill(); let tweenProxy = { ...state }; gsapTween = gsap.to(tweenProxy, { duration: 0.35, ...targetState, ease: 'power1.out', onUpdate: () => { state = { ...tweenProxy }; updateNonActiveUI(category === 'screen'); }, onComplete: () => { state = { ...targetState }; updateAllUI(); gsapTween = null; } }); }
    function calculateTargetState(changedCategory, newValue, currentState, silent = false) {
        const targetState = { ...currentState };
        const oldValue = currentState[changedCategory];
        newValue = Math.max(0, Math.min(newValue, MAX_SLIDER_VALUE)); // Allow 0
        const delta = newValue - oldValue;
        targetState[changedCategory] = newValue;

        if (Math.abs(delta) < 0.01) return targetState;

        let adjustmentNeeded = -delta; // Positive: need to add to others; Negative: need to remove from others

        // Original Rebalancing Logic
        if (adjustmentNeeded < 0) { // Need to DECREASE others because changedCategory INCREASED
            adjustmentNeeded = Math.abs(adjustmentNeeded); // Work with positive value for reduction amount

            // Prioritize reducing Social first
            const initialSocial = targetState.social;
            const socialReduction = Math.min(initialSocial, adjustmentNeeded);
            targetState.social -= socialReduction;
            adjustmentNeeded -= socialReduction;

            // Then reduce Sleep/Work proportionally if needed
            if (adjustmentNeeded > 0.01) {
                const sleepWorkSum = targetState.sleep + targetState.work;
                if (sleepWorkSum > 0.01) {
                    const sleepProportion = targetState.sleep / sleepWorkSum;
                    const workProportion = targetState.work / sleepWorkSum;

                    let sleepReduction = Math.min(targetState.sleep, adjustmentNeeded * sleepProportion);
                    let workReduction = Math.min(targetState.work, adjustmentNeeded * workProportion);

                    // Ensure total reduction doesn't exceed adjustmentNeeded due to rounding
                    let totalReduction = sleepReduction + workReduction;
                    if (totalReduction > adjustmentNeeded + 0.001) { // Add small tolerance for float precision
                        let scale = adjustmentNeeded / totalReduction;
                        sleepReduction *= scale;
                        workReduction *= scale;
                    }

                    targetState.sleep -= sleepReduction;
                    adjustmentNeeded -= sleepReduction;
                    targetState.work -= workReduction;
                    adjustmentNeeded -= workReduction;

                     // Fallback: Reduce whatever is left sequentially if still needed
                     if (adjustmentNeeded > 0.01) {
                          const remainingSleepReduction = Math.min(targetState.sleep, adjustmentNeeded);
                          targetState.sleep -= remainingSleepReduction;
                          adjustmentNeeded -= remainingSleepReduction;
                         if (adjustmentNeeded > 0.01) {
                             const remainingWorkReduction = Math.min(targetState.work, adjustmentNeeded);
                             targetState.work -= remainingWorkReduction;
                             adjustmentNeeded -= remainingWorkReduction;
                         }
                     }

                } else if (targetState.sleep > 0.01) { // Only sleep has value
                    const reduction = Math.min(targetState.sleep, adjustmentNeeded);
                    targetState.sleep -= reduction;
                    adjustmentNeeded -= reduction;
                } else if (targetState.work > 0.01) { // Only work has value
                    const reduction = Math.min(targetState.work, adjustmentNeeded);
                    targetState.work -= reduction;
                    adjustmentNeeded -= reduction;
                }
            }
            // Reduce screen time last if needed (e.g., if social/sleep/work were already 0)
            if (adjustmentNeeded > 0.01) {
                 const screenReduction = Math.min(targetState.screen, adjustmentNeeded);
                 targetState.screen -= screenReduction;
                 adjustmentNeeded -= screenReduction;
            }

            adjustmentNeeded *= -1; // Convert back to negative representation for final check consistency

        } else if (adjustmentNeeded > 0) { // Need to INCREASE others because changedCategory DECREASED
            // Prioritize increasing Social first
            const socialRoom = MAX_SLIDER_VALUE - targetState.social;
            const socialIncrease = Math.min(adjustmentNeeded, socialRoom);
            targetState.social += socialIncrease;
            adjustmentNeeded -= socialIncrease;

            // Then increase Sleep/Work proportionally if needed
            if (adjustmentNeeded > 0.01) {
                const sleepRoom = MAX_SLIDER_VALUE - targetState.sleep;
                const workRoom = MAX_SLIDER_VALUE - targetState.work;
                const totalRoom = sleepRoom + workRoom;

                if (totalRoom > 0.01) {
                    const sleepProportion = sleepRoom / totalRoom;
                    const workProportion = workRoom / totalRoom;

                    let sleepIncrease = Math.min(sleepRoom, adjustmentNeeded * sleepProportion);
                    let workIncrease = Math.min(workRoom, adjustmentNeeded * workProportion);

                     // Ensure total increase doesn't exceed adjustmentNeeded due to rounding
                     let totalIncrease = sleepIncrease + workIncrease;
                     if (totalIncrease > adjustmentNeeded + 0.001) { // Add small tolerance
                         let scale = adjustmentNeeded / totalIncrease;
                         sleepIncrease *= scale;
                         workIncrease *= scale;
                     }

                    targetState.sleep += sleepIncrease;
                    adjustmentNeeded -= sleepIncrease;
                    targetState.work += workIncrease;
                    adjustmentNeeded -= workIncrease;

                     // Fallback: Add to whatever has room sequentially if still needed
                    if (adjustmentNeeded > 0.01) {
                         const remainingSleepIncrease = Math.min(MAX_SLIDER_VALUE - targetState.sleep, adjustmentNeeded);
                         targetState.sleep += remainingSleepIncrease;
                         adjustmentNeeded -= remainingSleepIncrease;
                        if (adjustmentNeeded > 0.01) {
                             const remainingWorkIncrease = Math.min(MAX_SLIDER_VALUE - targetState.work, adjustmentNeeded);
                             targetState.work += remainingWorkIncrease;
                             adjustmentNeeded -= remainingWorkIncrease;
                        }
                    }
                } else if (sleepRoom > 0.01) { // Only sleep has room
                    const increase = Math.min(sleepRoom, adjustmentNeeded);
                    targetState.sleep += increase;
                    adjustmentNeeded -= increase;
                } else if (workRoom > 0.01) { // Only work has room
                    const increase = Math.min(workRoom, adjustmentNeeded);
                    targetState.work += increase;
                    adjustmentNeeded -= increase;
                }
            }
              // Increase Screen Time as last resort if still needed (and if it wasn't the changed one)
              if (adjustmentNeeded > 0.01 && changedCategory !== 'screen') {
                   const screenRoom = MAX_SLIDER_VALUE - targetState.screen;
                   const screenIncrease = Math.min(screenRoom, adjustmentNeeded);
                   targetState.screen += screenIncrease;
                   adjustmentNeeded -= screenIncrease;
               }
        }

        // --- Final Sum Check & Correction --- (Ensures total is exactly TOTAL_HOURS)
        let finalSum = 0;
        Object.keys(targetState).forEach(cat => {
            targetState[cat] = Math.max(0, Math.min(MAX_SLIDER_VALUE, targetState[cat])); // Clamp values firmly
            finalSum += targetState[cat];
        });

        let discrepancy = TOTAL_HOURS - finalSum;

        if (Math.abs(discrepancy) > 0.01) {
            // Correction Order: Prioritize non-changed categories
            const correctionOrder = ['social', 'work', 'sleep', 'screen'].filter(cat => cat !== changedCategory);
            // Add changed category at the very end if absolutely necessary
            if (!correctionOrder.includes(changedCategory)) { correctionOrder.push(changedCategory); }

            for (const cat of correctionOrder) {
                if (Math.abs(discrepancy) < 0.01) break; // Stop correction if discrepancy is negligible

                const currentVal = targetState[cat];

                if (discrepancy > 0) { // Need to ADD time
                    const canAdd = MAX_SLIDER_VALUE - currentVal;
                    const addAmount = Math.min(discrepancy, canAdd);
                     if (addAmount >= 0.01) { // Apply only meaningful corrections
                        targetState[cat] += addAmount;
                        // finalSum += addAmount; // No need to track intermediate sum here
                        discrepancy -= addAmount;
                     }
                } else { // Need to REMOVE time (discrepancy is negative)
                    const canRemove = currentVal;
                    const removeAmount = Math.min(Math.abs(discrepancy), canRemove);
                     if (removeAmount >= 0.01) { // Apply only meaningful corrections
                         targetState[cat] -= removeAmount;
                         // finalSum -= removeAmount;
                         discrepancy += removeAmount;
                    }
                }
            }
        }

        // Final rounding pass to ensure clean .1 values
        Object.keys(targetState).forEach(cat => {
            targetState[cat] = parseFloat(targetState[cat].toFixed(1));
        });

         // Last micro-adjustment for potential rounding discrepancies (e.g., 23.9 or 24.1)
         finalSum = Object.values(targetState).reduce((s, v) => s + v, 0);
         discrepancy = TOTAL_HOURS - finalSum;

         if (Math.abs(discrepancy) > 0.01 && Math.abs(discrepancy) < 0.15) { // Check for small discrepancy like 0.1
             // Preferentially adjust the category that was initially changed, if possible
             let adjusted = false;
             if (changedCategory && targetState[changedCategory] !== undefined) {
                 const correctedVal = targetState[changedCategory] + discrepancy;
                 if (correctedVal >= 0 && correctedVal <= MAX_SLIDER_VALUE) {
                      targetState[changedCategory] = parseFloat(correctedVal.toFixed(1));
                      adjusted = true;
                 }
             }
             // If adjusting the changed category wasn't possible/sufficient, try screen time
             if (!adjusted && targetState.screen !== undefined) {
                 const correctedVal = targetState.screen + discrepancy;
                  if (correctedVal >= 0 && correctedVal <= MAX_SLIDER_VALUE) {
                       targetState.screen = parseFloat(correctedVal.toFixed(1));
                       adjusted = true;
                  }
             }
             // As a last resort, try social if it wasn't the changed category
             if (!adjusted && changedCategory !== 'social' && targetState.social !== undefined) {
                 const correctedVal = targetState.social + discrepancy;
                  if (correctedVal >= 0 && correctedVal <= MAX_SLIDER_VALUE) {
                       targetState.social = parseFloat(correctedVal.toFixed(1));
                       adjusted = true;
                  }
             }
             // If still not adjusted (highly unlikely), the small discrepancy remains
         }

        return targetState;
    }

    // --- UI Updates (Unchanged) ---
    function updateNonActiveUI(isScreenTimeUpdate = false) { for (const key in sliders) { if (sliders[key].id !== activeSliderId) { sliders[key].value = state[key]; valueDisplays[key].textContent = state[key].toFixed(1); updateSliderUI(sliders[key], state[key], key); } } updateChart(); if(isScreenTimeUpdate) { updateLifetimeImpact(state.screen); } updateChartCenterText(); }
    function updateAllUI() { for (const key in sliders) { sliders[key].value = state[key]; valueDisplays[key].textContent = state[key].toFixed(1); updateSliderUI(sliders[key], state[key], key); } updateChart(); updateLifetimeImpact(state.screen); updateLifetimeGrid(); checkWarnings(); updateChartCenterText(); }
    function updateSliderUI(sliderElement, value, category) { if (!sliderElement) return; const colorVar = `--${category}-color`; sliderElement.style.setProperty('--thumb-color', `var(${colorVar})`); const max = parseFloat(sliderElement.max); const min = parseFloat(sliderElement.min); const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0; sliderElement.style.background = `linear-gradient(to right, var(${colorVar}) 0%, var(${colorVar}) ${percentage}%, var(--slider-track) ${percentage}%, var(--slider-track) 100%)`; }
    function updateLifetimeImpact(currentScreenTime) { const daysYear = (currentScreenTime / 24) * LEAP_YEAR_FACTOR; const yearsLife = (currentScreenTime / 24) * LIFE_EXPECTANCY; const animDuration = (activeSliderId === 'screenTime' || activeSliderId === 'initialScreenTime') ? 0.1 : 0.5; gsap.to(daysPerYearDisplay, { duration: animDuration, text: daysYear.toFixed(0), ease: 'none'}); gsap.to(yearsInLifeDisplay, { duration: animDuration, text: yearsLife.toFixed(1), ease: 'none'}); }

    // --- Lifetime Grid (Unchanged) ---
    function generateLifetimeGridStructure() { lifetimeGridContainer.innerHTML = ''; for (let i = 0; i < LIFE_EXPECTANCY; i++) { const dot = document.createElement('div'); dot.classList.add('life-year-dot'); dot.dataset.yearIndex = i; lifetimeGridContainer.appendChild(dot); lifetimeDots.push(dot); } }
    function updateLifetimeGrid() { const yearsLostTotal = (state.screen / 24) * LIFE_EXPECTANCY; const yearsLostVisually = Math.round(yearsLostTotal); const lostYearsText = yearsLostVisually > 0 ? `(${yearsLostVisually} Years Lost)` : ""; lifetimeGridText.textContent = lostYearsText; const targetStyles = (i) => { const isLost = i >= LIFE_EXPECTANCY - yearsLostVisually; return { scale: isLost ? 1 : 0.8, opacity: isLost ? 0.95 : 0.25, backgroundColor: isLost ? getComputedStyle(document.documentElement).getPropertyValue('--screen-color').trim() : getComputedStyle(document.documentElement).getPropertyValue('--slider-track').trim(), }; }; gsap.to(lifetimeDots, { duration: 0.4, scale: (i) => targetStyles(i).scale, opacity: (i) => targetStyles(i).opacity, backgroundColor: (i) => targetStyles(i).backgroundColor, stagger: { amount: 0.9, grid: "auto", from: "start", ease: "power1.inOut" }, ease: "sine.inOut", overwrite: true, }); setTimeout(() => { lifetimeDots.forEach((dot, i) => { const isLost = i >= LIFE_EXPECTANCY - yearsLostVisually; dot.title = `Year ${i + 1}${isLost ? ' (Lost to Screens)' : ''}`; }); }, 1000); }

    // --- Warnings & Center Text (Revised) ---
    function checkWarnings() {
        warningsContainer.innerHTML = ''; // Clear existing warnings
        let violatedCategories = [];
        let centerText = "";

        const createWarning = (text) => {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'warning visible'; // Add 'visible' for CSS animation
            warningDiv.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"></path></svg><span>${text}</span>`;
            warningsContainer.appendChild(warningDiv);
        };

        // Specific Warnings based on state
        if (state.sleep < 6) {
            violatedCategories.push("Sleep");
            createWarning("Lack of sleep increases risk of depression, burnout and memory loss.");
        }
        if (state.social < 2) {
            violatedCategories.push("Free Time"); // Keep using "Free Time" for category consistency
            createWarning("Reduced social interaction affects empathy, belonging, and mental stability.");
        }
        // Re-add the work/study warning
        if (state.work < 6 && state.work > 0) { // Add check > 0 to avoid warning when work is intentionally zero
             violatedCategories.push("Work/Study");
             createWarning("Low work/study time can impact productivity and achieving your goals.");
        }

        if (state.screen > 8) {
             // Screen time doesn't add to violatedCategories for center text logic, but triggers its own warning
            createWarning("High screen use is linked to anxiety, self-esteem issues, and addictive behavior.");
        }
        // Removed the old generic screen time > 10 warning

        // Determine Center Text based on combined impact
        if (violatedCategories.length > 0 && state.screen >= 6) { // Keep threshold for center text
            centerText = `Screen time might be impacting ${violatedCategories.join(" & ")}!`;
        }

        if (centerText) {
            chartCenterText.textContent = centerText;
            chartCenterText.classList.add('visible');
        } else {
            chartCenterText.classList.remove('visible');
            chartCenterText.textContent = '';
        }

        // No separate pulse animation needed anymore
    }

    function updateChartCenterText() {
        checkWarnings();
    }

    // --- Start ---
    initializeApp();

}); // End DOMContentLoaded


/* script.js */
document.addEventListener('DOMContentLoaded', () => {
    // --- Sicherheitscheck ---
    if (typeof gsap === 'undefined') {
        console.error("GSAP library is not loaded!");
        return;
    }

    const slides = gsap.utils.toArray('.slide');

    if (slides.length === 0) {
        console.error("No slides found with class '.slide'");
        return;
    }

    // --- Animationen ---
    const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.0, // Pause zwischen den Schleifen
        defaults: { duration: 0.8, ease: "power2.inOut" } // Standard-Dauer & Ease
    });

    slides.forEach((slide, index) => {
        // Individuelle Anzeigedauer pro Slide
        let holdDuration;
        if (index === 0) { // "ENOUGH IS ENOUGH." -> Kurz
            holdDuration = 1.8;
        } else if (index === 1) { // "EVERYBODY FEELS..." -> Mittel (gekürzt)
            holdDuration = 2.8; // War 3.8s
        } else { // "TOGETHER, WE DEMAND CHANGE!" -> Mittel (Text gesplittet)
            holdDuration = 2.5; // Bleibt gleich
        }

        // 1. Slide hereinfahren (von unten)
        tl.fromTo(slide,
            { y: '100%', autoAlpha: 0 }, // Start: unten, unsichtbar
            { y: '0%', autoAlpha: 1 }     // Ende: in Position, sichtbar
        );

        // 2. Slide herausfahren (nach oben) nach der spezifischen Haltezeit
        tl.to(slide,
            { y: '-100%', autoAlpha: 0 }, // Ende: oben, unsichtbar
            `+=${holdDuration}` // Verwende die individuelle Dauer
        );
    });

    console.log("Minimalist Slider initialized successfully with split accent slide and adjusted timing.");

});