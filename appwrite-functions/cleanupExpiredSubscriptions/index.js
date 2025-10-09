const sdk = require('node-appwrite');
const axios = require('axios');

module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

  try {
    const now = new Date();
    
    // Find expired subscriptions
    const expiredSubscriptions = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID,
      [
        sdk.Query.lessThan('expiryDate', now.toISOString()),
        sdk.Query.equal('status', 'subscribed')
      ]
    );

    log(`Found ${expiredSubscriptions.total} expired subscriptions`);
    
    let cleaned = 0;
    let unsubscribed = 0;

    for (const subscription of expiredSubscriptions.documents) {
      try {
        // Try to unsubscribe from YouTube PubSubHubbub
        const hubTopic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${subscription.youtubeChannelId}`;
        
        try {
          await axios.post(
            'https://pubsubhubbub.appspot.com/unsubscribe',
            new URLSearchParams({
              'hub.callback': subscription.callbackUrl,
              'hub.topic': hubTopic,
              'hub.verify': 'async',
              'hub.mode': 'unsubscribe',
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          );
          
          unsubscribed++;
          log(`Unsubscribed from channel ${subscription.youtubeChannelId}`);
        } catch (unsubError) {
          log(`Failed to unsubscribe from channel ${subscription.youtubeChannelId}: ${unsubError.message}`);
        }

        // Delete the subscription record
        await databases.deleteDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID,
          subscription.$id
        );

        cleaned++;
        
      } catch (docError) {
        error(`Failed to clean subscription ${subscription.$id}: ${docError.message}`);
      }
    }

    log(`Cleanup complete: ${cleaned} subscriptions removed, ${unsubscribed} unsubscribed from YouTube`);
    
    return res.json({
      success: true,
      cleaned,
      unsubscribed,
      total: expiredSubscriptions.total
    });

  } catch (err) {
    error('Cleanup function error:', err.message);
    return res.json({ success: false, message: err.message }, 500);
  }
};