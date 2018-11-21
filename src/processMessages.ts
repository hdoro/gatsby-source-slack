import { shortnameToUnicode } from 'emojione';

export const processMessages = async ({ actions, graphql, getNode }: any) => {
  const { createNodeField } = actions;

  const graphqlData = await graphql(`
    {
      users: allSlackUser {
        edges {
          node {
            id
            userId
            real_name
            display_name
          }
        }
      }
      channels: allSlackChannel(filter: { is_private: { eq: false } }) {
        edges {
          node {
            channelId
            id
            messages {
              ts
              user
              text
              reply_count
              subtype
              files {
                title
                filetype
                thumb_360
              }
            }
          }
        }
      }
    }
  `);

  // Find the user from the database corresponding to the tag
  const replaceUser = (u: string) => {
    const userId = u.replace(/[@<>]/gi, '');
    const user = graphqlData.data.users.edges.find(({ node }: any) => {
      return node.userId === userId;
    });

    if (!user) {
      return '';
    }

    const { display_name, real_name } = user.node;
    return `<span class="chat_link">@${display_name || real_name}</span>`;
  };

  // Add an anchor element to referenced links in the text
  const replaceLink = (l: string) => {
    // Links, if posted without the http protocol, will have a | pipe
    // between the url itself and the text the user input
    // Ex: <https://github.com|github.com>
    const url = l.replace(/[<>]/gi, '');
    const linkWithProtocol = url.split('|')[0];
    const simplifiedLink = url.split('|')[1];

    return `<a href="${linkWithProtocol}" target="_blank" rel="noopener noreferrer">${simplifiedLink ||
      linkWithProtocol}</a>`;
  };

  // Add a class around the channel reference
  const replaceChannel = (c: string) => `<span class="chat_link">${c}</span>`;

  const processText = (t: string) => {
    // Emojis come in the form of :emoji:
    const emojiRegex = new RegExp(/:\w*:/gi);
    // Users come as <@US3RID>
    const userRegex = new RegExp(/<@[\w\d]*>/gi);
    // Links come as <http...>
    const linkRegex = new RegExp(/<http.*>/gi);
    // And the @channel reference as <!channel>
    const channelRegex = new RegExp(/<!channel>/gi);

    return (
      t
        .replace(emojiRegex, shortnameToUnicode)
        // If emoji hasn't been swapped with an unicode char,
        // that's because it's custom and should be removed
        .replace(emojiRegex, '')
        .replace(userRegex, replaceUser)
        .replace(linkRegex, replaceLink)
        .replace(channelRegex, replaceChannel)
    );
  };

  // We want to keep track of downloaded userImages to avoid them
  // running through the saveImage function again
  const fetchUser = (userId: string) => {
    const user = graphqlData.data.users.edges.find(({ node }: any) => {
      return node.userId === userId;
    });

    if (!user || !user.node) {
      return null;
    }

    return user.node.id;
  };

  for (const c of graphqlData.data.channels.edges) {
    const { node: channel } = c;

    let messages: any[] = [];
    if (channel.messages && channel.messages[0]) {
      for (const m of channel.messages) {
        const userInternalId = await fetchUser(m.user);
        const text = await processText(m.text);

        delete m.user;

        messages = [
          ...messages,
          {
            ...m,
            text,
            user___NODE: userInternalId,
          },
        ];
      }
    }

    // Fetch the complete node in order to add a new
    // 'normalizedMessages' field to it
    const originalNode = await getNode(channel.id);
    createNodeField({
      node: originalNode,
      name: 'normalizedMessages',
      value: messages,
    });
  }
};
