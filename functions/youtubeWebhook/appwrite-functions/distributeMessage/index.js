const sdk = require('node-appwrite');
const axios = require('axios');

module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

  try {
    const { userId, messageTemplate, videoDetails, targetConnectionIds } = JSON.parse(req.body);

    if (!userId || !messageTemplate || !videoDetails || !targetConnectionIds) {
      return res.json({ success: false, message: 'Missing required fields' }, 400);
    }

    let message = messageTemplate
      .replace(/\{\{video_title\}\}/g, videoDetails.videoTitle)
      .replace(/\{\{video_url\}\}/g, videoDetails.videoUrl)
      .replace(/\{\{video_id\}\}/g, videoDetails.videoId);

    const results = [];

    for (const connectionId of targetConnectionIds) {
      try {
        const connection = await databases.getDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_CONNECTIONS_COLLECTION_ID,
          connectionId
        );

        let result = { connectionId, platform: connection.platform, success: false };

        if (connection.platform === 'discord') {
          if (connection.botToken && connection.channelId) {
            try {
              await axios.post(
                `https://discord.com/api/v10/channels/${connection.channelId}/messages`,
                { content: message },
                {
                  headers: {
                    'Authorization': `Bot ${connection.botToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              result.success = true;
              log(`Posted to Discord channel ${connection.channelId}`);
            } catch (discordError) {
              result.error = discordError.response?.data?.message || discordError.message;
              error(`Discord error: ${result.error}`);
            }
          }
        } else if (connection.platform === 'telegram') {
          if (connection.botToken && connection.channelId) {
            try {
              await axios.post(
                `https://api.telegram.org/bot${connection.botToken}/sendMessage`,
                {
                  chat_id: connection.channelId,
                  text: message,
                  parse_mode: 'HTML',
                }
              );
              result.success = true;
              log(`Posted to Telegram chat ${connection.channelId}`);
            } catch (telegramError) {
              result.error = telegramError.response?.data?.description || telegramError.message;
              error(`Telegram error: ${result.error}`);
            }
          }
        } else if (connection.platform === 'whop') {
          if (connection.accessToken && connection.channelId) {
            try {
              await axios.post(
                `https://api.whop.com/v1/communities/${connection.channelId}/posts`,
                { content: message },
                {
                  headers: {
                    'Authorization': `Bearer ${connection.accessToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              result.success = true;
              log(`Posted to Whop community ${connection.channelId}`);
            } catch (whopError) {
              result.error = whopError.response?.data?.message || whopError.message;
              error(`Whop error: ${result.error}`);
            }
          }
        }

        results.push(result);
      } catch (connError) {
        error(`Connection error for ${connectionId}: ${connError.message}`);
        results.push({
          connectionId,
          success: false,
          error: connError.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    log(`Distribution complete: ${successCount}/${results.length} successful`);

    return res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
      },
    });
  } catch (err) {
    error('Function error:', err.message);
    return res.json({ success: false, message: err.message }, 500);
  }
};
