const sdk = require('node-appwrite');
const axios = require('axios');
const crypto = require('crypto');

module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

  try {
    const { userId, youtubeChannelId, youtubeConnectionId } = JSON.parse(req.body);

    if (!userId || !youtubeChannelId || !youtubeConnectionId) {
      return res.json({ success: false, message: 'Missing required fields' }, 400);
    }

    const hubSecret = crypto.randomBytes(32).toString('hex');
    const callbackUrl = `${process.env.APPWRITE_FUNCTION_ENDPOINT}/functions/youtubeWebhook/executions`;
    const hubTopic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${youtubeChannelId}`;

    try {
      const response = await axios.post(
        'https://pubsubhubbub.appspot.com/subscribe',
        new URLSearchParams({
          'hub.callback': callbackUrl,
          'hub.topic': hubTopic,
          'hub.verify': 'async',
          'hub.mode': 'subscribe',
          'hub.secret': hubSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 10);

      await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID,
        sdk.ID.unique(),
        {
          userId,
          youtubeChannelId,
          youtubeConnectionId,
          callbackUrl,
          hubSecret,
          status: 'pending',
          expiryDate: expiryDate.toISOString(),
        }
      );

      log('YouTube subscription created successfully');
      return res.json({
        success: true,
        message: 'Subscription request sent',
        youtubeChannelId,
      });
    } catch (subscribeError) {
      error('PubSubHubbub subscription error:', subscribeError.message);
      return res.json({ success: false, message: 'Subscription failed' }, 500);
    }
  } catch (err) {
    error('Function error:', err.message);
    return res.json({ success: false, message: err.message }, 500);
  }
};
