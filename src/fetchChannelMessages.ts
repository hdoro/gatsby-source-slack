import axios from 'axios';

export interface IFetchChannelMessages {
  channel: string;
  token: string;
}

const channelHistoryURL = `https://slack.com/api/conversations.history`;

export const fetchChannelMessages = async ({
  channel,
  token,
}: IFetchChannelMessages) => {
  const channelHistory = await axios.get(channelHistoryURL, {
    params: {
      token,
      channel,
    },
  });
  if (channelHistory.data) {
    return channelHistory.data.messages;
  } else {
    return undefined;
  }
};
