/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const myAction = new Action('com.dbkynd.yt-live-chat.action');

// $SD.onConnected(() => {});

myAction.onKeyUp(() => {
  openChat().catch(console.error);
});

const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

async function openChat() {
  const apiKey = '';
  const channelName = '';

  const channelId = await fetchChannelId(apiKey, channelName);
  if (!channelId) throw new Error('Unable to get channel Id for youtube channel: ' + channelName);
  const videoId = await fetchVideoId(apiKey, channelId);
  if (videoId) openYouTubeChat(videoId);
  else console.log('No video id was found. Is the stream live?');
}

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
  const url = `${BASE_URL}?${queryString}`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const channelId = data.items[0]?.id?.channelId;
      return channelId || null;
    })
    .catch((error) => {
      console.error('Error fetching YouTube channel:', error);
      return null;
    });
}

function fetchVideoId(apiKey, channelId) {
  const params = {
    key: apiKey,
    channelId,
    part: 'snippet',
    type: 'video',
    eventType: 'live',
    order: 'date',
    maxResults: 1,
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}?${queryString}`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const videoId = data.items[0]?.id?.videoId;
      return videoId || null;
    })
    .catch((error) => {
      console.error('Error fetching YouTube video:', error);
      return null;
    });
}

function openYouTubeChat(videoId) {
  $SD.openUrl(`https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`);
}
