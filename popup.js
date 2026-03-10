document.addEventListener('DOMContentLoaded', () => {
  loadData();
  syncTimerState(); 
  setupListeners();
  
  // Refresh timer display every second
  setInterval(() => {
    syncTimerState();
    updateBreathingDisplay(); // For seconds update
  }, 1000);
});

function setupListeners() {
  // Water
  document.getElementById('addWater').addEventListener('click', () => updateWater(1));
  document.getElementById('removeWater').addEventListener('click', () => updateWater(-1));
  document.getElementById('waterRemindBtn').addEventListener('click', toggleWaterReminder);
  
  // Timer
  document.getElementById('timerStartBtn').addEventListener('click', () => handleStartTimer());
  document.getElementById('timerPauseBtn').addEventListener('click', handlePauseTimer);
  document.getElementById('timerResetBtn').addEventListener('click', handleResetTimer);
  
  // Alarms & Reset
  document.getElementById('resetBtn').addEventListener('click', resetProgress);
  document.getElementById('setAlarmBtn').addEventListener('click', setQuickAlarm);
  
  // Breathing
  document.getElementById('breathBtn').addEventListener('click', toggleBreathing);

  // Toggles
  document.querySelectorAll('.switch input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.id.replace('toggle', '').toLowerCase();
      saveReminderState(id, e.target.checked);
    });
  });
}

function loadData() {
  chrome.storage.local.get(['waterCount', 'sessionsCompleted', 'reminders', 'waterReminderOn'], (result) => {
    // Water Count
    const waterCount = result.waterCount || 0;
    document.getElementById('waterCount').textContent = waterCount;
    document.getElementById('waterStat').textContent = waterCount;

    // Sessions
    const sessions = result.sessionsCompleted || 0;
    document.getElementById('sessionStat').textContent = sessions;

    // Progress
    const progress = Math.min(100, Math.round(((waterCount / 8) * 50) + (sessions * 12.5)));
    document.getElementById('progressValue').textContent = progress;
    document.getElementById('progressCircle').setAttribute('stroke-dasharray', `${progress} 100`);

    // Reminders State
    const reminders = result.reminders || {};
    document.getElementById('toggleEye').checked = reminders.eye || false;
    document.getElementById('toggleBlink').checked = reminders.blink || false;
    document.getElementById('togglePosture').checked = reminders.posture || false;
    document.getElementById('toggleStandUp').checked = reminders.standUp || false;
    document.getElementById('toggleStretch').checked = reminders.stretch || false;

    // Water Reminder Button State
    const waterBtn = document.getElementById('waterRemindBtn');
    if (result.waterReminderOn) {
      waterBtn.textContent = "Stop";
      waterBtn.classList.add('active');
    } else {
      waterBtn.textContent = "Start";
      waterBtn.classList.remove('active');
    }
  });
  
  // Date
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// --- WATER REMINDER ---
function toggleWaterReminder() {
  const btn = document.getElementById('waterRemindBtn');
  const interval = parseInt(document.getElementById('waterInterval').value);
  
  if (btn.textContent === "Start") {
    chrome.runtime.sendMessage({ action: "toggleReminder", name: "water", state: true, interval: interval });
    chrome.storage.local.set({ waterReminderOn: true });
    btn.textContent = "Stop";
    btn.classList.add('active');
  } else {
    chrome.runtime.sendMessage({ action: "toggleReminder", name: "water", state: false });
    chrome.storage.local.set({ waterReminderOn: false });
    btn.textContent = "Start";
    btn.classList.remove('active');
  }
}

function updateWater(amount) {
  chrome.storage.local.get(['waterCount'], (result) => {
    let count = result.waterCount || 0;
    count += amount;
    if (count < 0) count = 0;
    if (count > 8) count = 8;
    
    chrome.storage.local.set({ waterCount: count }, () => {
      document.getElementById('waterCount').textContent = count;
      document.getElementById('waterStat').textContent = count;
      updateProgress();
    });
  });
}

function updateProgress() {
  chrome.storage.local.get(['waterCount', 'sessionsCompleted'], (result) => {
    const water = result.waterCount || 0;
    const sessions = result.sessionsCompleted || 0;
    const progress = Math.min(100, Math.round(((water / 8) * 50) + (sessions * 12.5)));
    document.getElementById('progressValue').textContent = progress;
    document.getElementById('progressCircle').setAttribute('stroke-dasharray', `${progress} 100`);
  });
}

function saveReminderState(name, state) {
  chrome.storage.local.get(['reminders'], (result) => {
    let reminders = result.reminders || {};
    reminders[name] = state;
    chrome.storage.local.set({ reminders: reminders });
    chrome.runtime.sendMessage({ action: "toggleReminder", name: name, state: state });
  });
}

// --- TIMER SYNC ---

function syncTimerState() {
  chrome.runtime.sendMessage({ action: "getTime" }, (response) => {
    if (chrome.runtime.lastError) return;
    
    const display = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('timerStartBtn');
    const pauseBtn = document.getElementById('timerPauseBtn');

    if (response && response.running) {
      const time = response.remaining;
      updateTimerDisplay(time);
      startBtn.disabled = true;
      pauseBtn.disabled = false;
    } else {
      // Only reset display to 25:00 if we are not in a paused state logic
      // For simplicity, if not running, ensure buttons reflect that
      if (!startBtn.disabled) {
         // display.textContent = "25:00"; // Optional: force reset visual
      }
    }
  });
}

function handleStartTimer() {
  const minutes = 25; 
  chrome.runtime.sendMessage({ action: "startTimer", duration: minutes });
  document.getElementById('timerStartBtn').disabled = true;
  document.getElementById('timerPauseBtn').disabled = false;
}

function handlePauseTimer() {
  chrome.runtime.sendMessage({ action: "stopTimer" });
  document.getElementById('timerStartBtn').disabled = false;
  document.getElementById('timerPauseBtn').disabled = true;
  document.getElementById('timerDisplay').textContent = "PAUSED";
}

function handleResetTimer() {
  chrome.runtime.sendMessage({ action: "stopTimer" });
  document.getElementById('timerStartBtn').disabled = false;
  document.getElementById('timerPauseBtn').disabled = true;
  document.getElementById('timerDisplay').textContent = "25:00";
}

function updateTimerDisplay(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  document.getElementById('timerDisplay').textContent = 
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// --- QUICK ALARM ---

function setQuickAlarm() {
  const mins = parseInt(document.getElementById('alarmMinutes').value);
  const label = document.getElementById('alarmLabel').value || "Alarm";
  if (!mins || mins < 1) {
    alert("Please enter valid minutes");
    return;
  }

  // Generate a unique name for the alarm
  const alarmName = 'quickAlarm_' + Date.now();
  
  // Save label temporarily for the background script to pick up
  chrome.storage.local.set({ tempAlarmLabel: label }, () => {
    chrome.alarms.create(alarmName, { delayInMinutes: mins });
    document.getElementById('alarmMinutes').value = '';
    document.getElementById('alarmLabel').value = '';
    alert(`Alarm set for ${mins} minute(s)`);
  });
}

// --- BOX BREATHING ---
let breathingInterval = null;
let breathingPhase = 0;
let breathSecondsLeft = 4;

function toggleBreathing() {
  const btn = document.getElementById('breathBtn');
  const circle = document.getElementById('breathCircle');
  const text = document.getElementById('breathText');

  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
    btn.textContent = "Begin Session";
    circle.classList.remove('active');
    text.textContent = "Start";
    circle.style.transform = "scale(1)";
  } else {
    btn.textContent = "Stop";
    breathingPhase = 0; // Reset phase
    breathSecondsLeft = 4;
    
    runBreathingCycle(); // Run immediately
    
    breathingInterval = setInterval(() => {
      breathSecondsLeft--;
      if (breathSecondsLeft <= 0) {
        breathingPhase++;
        breathSecondsLeft = 4;
        runBreathingCycle();
      }
      updateBreathingDisplay();
    }, 1000);
  }
}

function runBreathingCycle() {
  const circle = document.getElementById('breathCircle');
  const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
  const currentPhaseName = phases[breathingPhase % 4];
  
  if (currentPhaseName === 'Inhale') circle.style.transform = "scale(1.2)";
  if (currentPhaseName === 'Exhale') circle.style.transform = "scale(1)";
}

function updateBreathingDisplay() {
  const text = document.getElementById('breathText');
  const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
  const currentPhaseName = phases[breathingPhase % 4];
  text.textContent = `${currentPhaseName} ${breathSecondsLeft}s`;
}

function resetProgress() {
  if (confirm("Reset all daily progress?")) {
    chrome.storage.local.set({ waterCount: 0, sessionsCompleted: 0 }, loadData);
  }
}