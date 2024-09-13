/// <reference path="../../../libs/js/property-inspector.js" />
/// <reference path="../../../libs/js/utils.js" />

const form = document.getElementById('property-inspector');
const apiKey = document.getElementById('api-key');
const channelName = document.getElementById('channel-name');
const channelId = document.getElementById('channel-id');
const channelAvatar = document.getElementById('channel-avatar');
const avatar = document.getElementById('avatar');

form.addEventListener('submit', function (event) {
  event.preventDefault();
});

$PI.onConnected((jsn) => {
  const { actionInfo, appInfo, connection, messageType, port, uuid } = jsn;
  const { payload, context } = actionInfo;
  const { settings } = payload;

  Utils.setFormValue(settings, form);
  if (channelAvatar.value) avatar.src = channelAvatar.value;

  form.addEventListener(
    'input',
    Utils.debounce(150, () => {
      saveSettings();
    }),
  );
});

function saveSettings() {
  const value = Utils.getFormValue(form);
  $PI.setSettings(value);
}

document.getElementById('get-id').addEventListener('click', async () => {
  if (!apiKey.value) return;
  if (!channelName.value) return;
  const id = await fetchChannelId(apiKey.value, channelName.value);
  channelId.value = id;
  const url = await fetchChannelAvatar(apiKey.value, id);
  if (url) {
    channelAvatar.value = url;
    avatar.src = url;
  }
  saveSettings();
});

function fetchChannelId(apiKey, channelName) {
  const params = {
    key: apiKey,
    q: channelName,
    part: 'snippet',
    type: 'channel',
    order: 'relevance',
    maxResults: 1,
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `https://www.googleapis.com/youtube/v3/search?${queryString}`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const channelId = data.items[0]?.id?.channelId;
      return channelId || null;
    })
    .catch((error) => {
      console.error('Error fetching YouTube channel:', error);
      return null;
    });
}

function fetchChannelAvatar(apiKey, channelId) {
  const params = {
    key: apiKey,
    id: channelId,
    part: 'snippet',
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `https://www.googleapis.com/youtube/v3/channels?${queryString}`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const avatarUrl = data.items[0]?.snippet?.thumbnails?.default?.url;
      return avatarUrl || null;
    })
    .catch((error) => {
      console.error('Error fetching YouTube channel:', error);
      return null;
    });
}
