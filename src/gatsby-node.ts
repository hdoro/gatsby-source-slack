import axios, { AxiosPromise } from 'axios';
import { validateConfig } from './configValidation';
import { colorizeLog } from './helpers';
import { fetchChannelMessages } from './fetchChannelMessages';
import { processMessages } from './processMessages';

export interface IPluginOptions {
  plugins: any[];
  token: string;
  channelsToFetch?: string[];
  normalizeMessages?: boolean;
}

export const sourceNodes = async (
  { actions, createNodeId, createContentDigest, cache }: any,
  configOptions: IPluginOptions
) => {
  const { createNode, touchNode } = actions;
  const { token, channelsToFetch } = configOptions;

  validateConfig({
    token,
  });

  const rootURL = 'https://slack.com/api/';
  const channelsListURL = `${rootURL}/conversations.list`;
  const userProfileURL = `${rootURL}/users.profile.get`;

  let usersToFetch: string[] = [];

  console.time(colorizeLog('\nSlack channels list fetched in'));
  const channelsList = await axios.get(channelsListURL, {
    params: {
      token,
      exclude_archived: true,
    },
  });
  for (const c of channelsList.data.channels) {
    let channelMessages;

    if (channelsToFetch && channelsToFetch.find(id => id === c.id)) {
      channelMessages = await fetchChannelMessages({
        channel: c.id,
        token,
      });
      if (channelMessages) {
        for (const m of channelMessages) {
          if (
            // If already in the array, don't add it
            usersToFetch.find(u => u === m.user) ||
            // if user is not defined, don't add it
            typeof m.user !== 'string'
          ) {
            continue;
          } else {
            usersToFetch = [...usersToFetch, m.user];
          }
        }
      }
    }

    const cacheableContent = JSON.stringify(c);
    const channelNode = {
      ...c,
      messages: channelMessages,
      channelId: c.id,
      // meta information for the node
      id: createNodeId(`slackChannel-${c.id}`),
      parent: null,
      children: [],
      internal: {
        type: 'SlackChannel',
        mediaType: 'text/html',
        content: cacheableContent,
        contentDigest: createContentDigest(cacheableContent),
      },
    };
    createNode(channelNode);
  }
  console.timeEnd(colorizeLog('\nSlack channels list fetched in'));

  let userRequests: AxiosPromise[] = [];
  console.time(colorizeLog('\nSlack users list fetched in'));
  for (const userId of usersToFetch) {
    const internalId = `slackUser-${userId}`;
    const cachedUser = await cache.get(internalId);

    // If the user is already in cache, simply touch its node
    // and prevent garbage collection, without fetching it again.
    // This prevents updates to their profiles, but it's worth the build time saving ;)
    if (
      cachedUser &&
      cachedUser.content &&
      cachedUser.content.userId === userId
    ) {
      touchNode({ nodeId: internalId });
      continue;
    } else {
      // If not on cache, add to the queue to fetch
      userRequests = [
        ...userRequests,
        axios.get(userProfileURL, {
          params: {
            token,
            user: userId,
          },
        }),
      ];
    }
  }

  const usersInfo = await Promise.all(userRequests);

  for (const user of usersInfo) {
    // Delete profile fields as these conflict with
    // Gatsby's namespacing and aren't useful
    delete user.data.profile.fields;
    const { user: userId } = user.config.params;

    if (!userId) {
      continue;
    }

    const cacheableContent = JSON.stringify(user.data.profile);

    const userNode = {
      ...user.data.profile,
      userId,
      // meta information for the node
      id: `slackUser-${userId}`,
      parent: null,
      children: [],
      internal: {
        type: 'SlackUser',
        mediaType: 'text/html',
        content: cacheableContent,
        contentDigest: createContentDigest(cacheableContent),
      },
    };
    createNode(userNode);
  }
  console.timeEnd(colorizeLog('\nSlack users list fetched in'));
};

export const createPages = async (
  { actions, graphql, getNode }: any,
  configOptions: IPluginOptions
) => {
  if (
    configOptions.normalizeMessages &&
    configOptions.channelsToFetch &&
    configOptions.channelsToFetch[0]
  ) {
    await processMessages({
      actions,
      graphql,
      getNode,
    });
  }
};
