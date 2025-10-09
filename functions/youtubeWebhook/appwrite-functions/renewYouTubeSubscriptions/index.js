const sdk = require('node-appwrite');
const axios = require('axios');

// Renew YouTube PubSubHubbub subscriptions close to expiry
module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

  try {
    const now = new Date();
    const threshold = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    const subs = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID,
      []
    );

    let renewed = 0;
    for (const doc of subs.documents) {
      try {
        const expiry = new Date(doc.expiryDate);
        if (doc.status === 'subscribed' && expiry < threshold) {
          const hubTopic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${doc.youtubeChannelId}`;
          const form = new URLSearchParams({
            'hub.callback': doc.callbackUrl,
            'hub.topic': hubTopic,
            'hub.verify': 'async',
            'hub.mode': 'subscribe',
            'hub.secret': doc.hubSecret,
          });

          await axios.post('https://pubsubhubbub.appspot.com/subscribe', form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });

          const newExpiry = new Date();
          newExpiry.setDate(newExpiry.getDate() + 10);

          await databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID,
            doc.$id,
            { expiryDate: newExpiry.toISOString() }
          );
          renewed++;
        }
      } catch (e) {
        error(`Failed to renew ${doc.$id}: ${e.message}`);
      }
    }

    log(`Renewed ${renewed} subscriptions`);
    return res.json({ success: true, renewed });
  } catch (err) {
    error('Renew function error:', err.message);
    return res.json({ success: false, message: err.message }, 500);
  }
};
