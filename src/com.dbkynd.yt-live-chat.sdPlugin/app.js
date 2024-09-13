/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const openChatAction = new Action('com.dbkynd.yt-live-chat.openchat');

// $SD.onConnected(() => {});

openChatAction.onKeyUp(({ payload }) => {
  const { settings } = payload;
  openChat(settings).catch(console.error);
});

const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

async function openChat(settings) {
  const { apiKey, channelId } = settings;
  if (!channelId) return;
  const videoId = await fetchVideoId(apiKey, channelId);
  if (videoId) openYouTubeChat(videoId);
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
