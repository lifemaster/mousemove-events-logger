const activeZone = document.getElementById('active-zone');
const unloggedContainer = document.getElementById('unlogged-data');
const loggedContainer = document.getElementById('logged-data');

const unloggedDataCounter = document.getElementById('unlogged-data-counter');
const loggedDataCounter = document.getElementById('logged-data-counter');

let unloggedData = [];
let sentData = [];
let mouseEventsCount = 0;

activeZone.addEventListener('mousemove', e => {
  const logData = {
    screenX: e.screenX,
    screenY: e.screenY,
    timestamp: Date.now(),
    count: ++mouseEventsCount
  };

  unloggedData.push(logData);

  const p = document.createElement('p');

  p.innerHTML = `#${logData.count} - Timestamp: ${logData.timestamp} | ScreenX: ${logData.screenX} | ScreenY: ${logData.screenY}`;

  p.setAttribute('data-ts', `t${logData.timestamp}`);

  unloggedContainer.appendChild(p);
  unloggedContainer.scrollTo(0, unloggedContainer.scrollHeight - unloggedContainer.clientHeight);

  unloggedDataCounter.innerHTML = unloggedContainer.querySelectorAll('p').length;
});

setInterval(() => {
  if (!unloggedData.length) {
    return;
  }

  const xhr = new XMLHttpRequest();
  const url = 'https://api.coralogix.com/api/v1/logs';

  xhr.open('POST', url);

  xhr.setRequestHeader('Content-Type', 'application/json');

  const logEntries = unloggedData.map(logData => {
    return {
      timestamp: logData.timestamp,
      severity: 3,
      text: `#${logData.count} - Timestamp: ${logData.timestamp} | ScreenX: ${logData.screenX} | ScreenY: ${logData.screenY}`
    }
  });

  const jsonData = JSON.stringify({
    privateKey: '0db05660-ed2f-04aa-6306-9aa237a3e93a',
    applicationName: 'Mouse events logger',
    subsystemName: 'My subsystem',
    computerName: 'My home PC',
    logEntries
  });

  // copy unlogged data array to sent data array
  sentData = [...unloggedData]; // or [].concat(unloggedData)

  xhr.send(jsonData);

  xhr.onloadend = () => {
    if (xhr.status !== 200) {
      console.log(`An error has occurred. Error: ${xhr.statusText}`);
      return;
    }

    // move unlogged data to logged
    sentData.forEach(log => {
      const pItem = unloggedContainer.querySelector(`p[data-ts=t${log.timestamp}]`);

      if (pItem) {
        loggedContainer.appendChild(pItem);
        loggedContainer.scrollTo(0, loggedContainer.scrollHeight - loggedContainer.clientHeight);
        loggedDataCounter.innerHTML = loggedContainer.querySelectorAll('p').length;

        unloggedDataCounter.innerHTML = 0;
      }
    });

    // remove sent logs from unlogged data array
    unloggedData = unloggedData.filter(unloggedItem => {
      const index = sentData.findIndex(sentItem => sentItem.timestamp === unloggedItem.timestamp);
      return (index >= 0) ? false : true;
    });

    // clear sent data array
    sentData = [];
  }
}, 2000);