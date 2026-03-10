let timerInterval = null;

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['waterCount', 'sessionsCompleted', 'reminders', 'timerEndTime'], (result) => {
    if (result.waterCount === undefined) chrome.storage.local.set({ waterCount: 0, sessionsCompleted: 0 });
    if (!result.reminders) {
      chrome.storage.local.set({
        reminders: { eye: false, blink: false, posture: false, standUp: false, stretch: false, water: false }
      });
    }
    
    // If a timer was running before browser close, restart the interval checker
    if (result.timerEndTime && result.timerEndTime > Date.now()) {
       startTimerInternal(null, result.timerEndTime);
    }
  });
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleReminder") {
    handleReminderToggle(request.name, request.state, request.interval);
  }
  if (request.action === "startTimer") {
    startTimerInternal(request.duration, null);
  }
  if (request.action === "stopTimer") {
    stopTimerInternal();
  }
  if (request.action === "getTime") {
    chrome.storage.local.get(['timerEndTime'], (result) => {
      const endTime = result.timerEndTime;
      if (endTime && endTime > Date.now()) {
        const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
        sendResponse({ running: true, remaining: remaining });
      } else {
        sendResponse({ running: false, remaining: 0 });
      }
    });
    return true; // Required for async
  }
});

// --- TIMER LOGIC ---

function startTimerInternal(durationMinutes, storedEndTime) {
  if (timerInterval) clearInterval(timerInterval);

  let endTime = storedEndTime;
  if (durationMinutes) {
    endTime = Date.now() + (durationMinutes * 60 * 1000);
  }
  
  // Persist end time
  chrome.storage.local.set({ timerEndTime: endTime });

  // Use an interval to check completion
  timerInterval = setInterval(() => {
    if (Date.now() >= endTime) {
      handleTimerComplete();
    }
  }, 1000);
}

function stopTimerInternal() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  chrome.storage.local.remove('timerEndTime');
}

function handleTimerComplete() {
  stopTimerInternal();
  
  chrome.storage.local.get(['sessionsCompleted'], (result) => {
    let count = result.sessionsCompleted || 0;
    count++;
    chrome.storage.local.set({ sessionsCompleted: count });
  });

  showNotification("Pomodoro Complete", "Great work! You've focused for 25 minutes. Take a 5-minute break to recharge your brain.");
  chrome.runtime.sendMessage({ action: "updateUI" }).catch(() => {});
}

// --- REMINDERS LOGIC ---

function handleReminderToggle(name, state, interval) {
  if (state) {
    let delay = 1; // default fallback
    switch(name) {
      case 'eye': delay = 20; break;
      case 'blink': delay = 10; break;
      case 'posture': delay = 15; break;
      case 'standUp': delay = 30; break;
      case 'stretch': delay = 60; break;
      case 'water': delay = interval || 60; break; // Use dynamic interval for water
    }
    chrome.alarms.create(name, { delayInMinutes: delay, periodInMinutes: delay });
  } else {
    chrome.alarms.clear(name);
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  const name = alarm.name;
  
  // Quick Alarm Logic
  if (name.startsWith('quickAlarm')) {
    chrome.storage.local.get(['tempAlarmLabel'], (res) => {
       showNotification("Reminder", res.tempAlarmLabel || "Time is up!");
       chrome.storage.local.remove('tempAlarmLabel');
    });
    return;
  }

  // Health Nudge Logic
  const messages = {
    eye: { 
      t: "20-20-20 Rule", 
      m: "Reduce eye strain: Look at an object at least 20 feet away for 20 seconds. This relaxes your eye muscles." 
    },
    blink: { 
      t: "Blink Reminder", 
      m: "Screen time reduces blinking by 66%. Close your eyes tightly, then open wide. Repeat 5 times to rehydrate." 
    },
    posture: { 
      t: "Posture Check", 
      m: "Time for a reset! Straighten your back, pull shoulders down and back, and ensure feet are flat on the floor." 
    },
    standUp: { 
      t: "Stand Up & Move", 
      m: "Sitting for too long reduces blood flow. Please stand up, stretch your legs, and walk around for 2 minutes." 
    },
    stretch: { 
      t: "Desk Stretch", 
      m: "Prevent stiffness: Roll your shoulders backwards 10 times, or tilt your head gently side-to-side." 
    },
    water: { 
      t: "Hydration Break", 
      m: "Dehydration causes fatigue. Drink a full glass of water now to maintain your energy and focus." 
    }
  };

  const msg = messages[name];
  if (msg) showNotification(msg.t, msg.m);
});

function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon/icon128.png",
    title: title,
    message: message,
    priority: 2
  });
}