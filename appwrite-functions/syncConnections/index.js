const sdk = require('node-appwrite');
const axios = require('axios');

module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

  try {
    const { userId, connectionId } = JSON.parse(req.body);

    if (!userId || !connectionId) {
      return res.json({ success: false, message: 'Missing required fields' }, 400);
    }

    // Get the connection
    const connection = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_CONNECTIONS_COLLECTION_ID,
      connectionId
    );

    let updatedData = {};
    let syncSuccess = false;

    try {
      switch (connection.platform) {
        case 'discord':
          // Verify Discord bot token and get guild/channel info
          if (connection.botToken) {
            try {
              // Test bot token by getting bot info
              const botResponse = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: {
                  'Authorization': `Bot ${connection.botToken}`
                }
              });

              // If we have a channel ID, verify it exists
              if (connection.channelId) {
                try {
                  const channelResponse = await axios.get(
                    `https://discord.com/api/v10/channels/${connection.channelId}`,
                    {
                      headers: {
                        'Authorization': `Bot ${connection.botToken}`
                      }
                    }
                  );
                  
                  updatedData.channelName = channelResponse.data.name;
                  updatedData.guildId = channelResponse.data.guild_id;
                  syncSuccess = true;
                } catch (channelError) {
                  log(`Discord channel verification failed: ${channelError.message}`);
                  updatedData.channelError = 'Channel not found or bot lacks access';
                }
              }

              updatedData.botUsername = botResponse.data.username;
              updatedData.botId = botResponse.data.id;
            } catch (botError) {
              log(`Discord bot token verification failed: ${botError.message}`);
              updatedData.botError = 'Invalid bot token';
            }
          }
          break;

        case 'telegram':
          // Verify Telegram bot token and get chat info
          if (connection.botToken) {
            try {
              // Test bot token by getting bot info
              const botResponse = await axios.get(
                `https://api.telegram.org/bot${connection.botToken}/getMe`
              );

              updatedData.botUsername = botResponse.data.result.username;
              updatedData.botId = botResponse.data.result.id;

              // If we have a chat ID, verify it exists
              if (connection.channelId) {
                try {
                  const chatResponse = await axios.get(
                    `https://api.telegram.org/bot${connection.botToken}/getChat`,
                    {
                      params: {
                        chat_id: connection.channelId
                      }
                    }
                  );
                  
                  updatedData.chatTitle = chatResponse.data.result.title;
                  updatedData.chatType = chatResponse.data.result.type;
                  syncSuccess = true;
                } catch (chatError) {
                  log(`Telegram chat verification failed: ${chatError.message}`);
                  updatedData.chatError = 'Chat not found or bot lacks access';
                }
              }
            } catch (botError) {
              log(`Telegram bot token verification failed: ${botError.message}`);
              updatedData.botError = 'Invalid bot token';
            }
          }
          break;

        case 'whop':
          // Verify Whop access token and get community info
          if (connection.accessToken) {
            try {
              // Test access token by getting user info
              const userResponse = await axios.get('https://api.whop.com/v1/me', {
                headers: {
                  'Authorization': `Bearer ${connection.accessToken}`
                }
              });

              updatedData.userEmail = userResponse.data.email;
              updatedData.userId = userResponse.data.id;

              // If we have a community ID, verify it exists
              if (connection.channelId) {
                try {
                  const communityResponse = await axios.get(
                    `https://api.whop.com/v1/communities/${connection.channelId}`,
                    {
                      headers: {
                        'Authorization': `Bearer ${connection.accessToken}`
                      }
                    }
                  );
                  
                  updatedData.communityName = communityResponse.data.name;
                  updatedData.communitySlug = communityResponse.data.slug;
                  syncSuccess = true;
                } catch (communityError) {
                  log(`Whop community verification failed: ${communityError.message}`);
                  updatedData.communityError = 'Community not found or user lacks access';
                }
              }
            } catch (tokenError) {
              log(`Whop token verification failed: ${tokenError.message}`);
              updatedData.tokenError = 'Invalid access token';
            }
          }
          break;

        default:
          return res.json({ success: false, message: 'Unsupported platform' }, 400);
      }

      // Update connection with sync data
      updatedData.lastSyncAt = new Date().toISOString();
      updatedData.syncStatus = syncSuccess ? 'success' : 'error';

      const updatedConnection = await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_CONNECTIONS_COLLECTION_ID,
        connectionId,
        updatedData
      );

      log(`Connection sync completed for ${connection.platform}: ${syncSuccess ? 'success' : 'error'}`);
      
      return res.json({
        success: true,
        connection: updatedConnection,
        syncStatus: syncSuccess ? 'success' : 'error'
      });

    } catch (syncError) {
      error(`Platform sync error: ${syncError.message}`);
      
      // Update connection with error
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_CONNECTIONS_COLLECTION_ID,
        connectionId,
        {
          lastSyncAt: new Date().toISOString(),
          syncStatus: 'error',
          syncError: syncError.message
        }
      );

      return res.json({
        success: false,
        message: 'Sync failed',
        error: syncError.message
      }, 500);
    }

  } catch (err) {
    error('Sync function error:', err.message);
    return res.json({ success: false, message: err.message }, 500);
  }
};