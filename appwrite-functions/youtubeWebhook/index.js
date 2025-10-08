const sdk = require('node-appwrite');
const crypto = require('crypto');
const xml2js = require('xml2js');

module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);
  const functions = new sdk.Functions(client);

  if (req.method === 'GET') {
    const hubChallenge = req.query['hub.challenge'];
    const hubTopic = req.query['hub.topic'];

    if (!hubChallenge || !hubTopic) {
      return res.text('Invalid verification request', 400);
    }

    try {
      const channelIdMatch = hubTopic.match(/channel_id=([^&]+)/);
      if (!channelIdMatch) {
        return res.text('Invalid topic', 400);
      }

      const youtubeChannelId = channelIdMatch[1];

      const subscriptions = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID,
        [sdk.Query.equal('youtubeChannelId', youtubeChannelId)]
      );

      if (subscriptions.documents.length === 0) {
        return res.text('Subscription not found', 404);
      }

      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID,
        subscriptions.documents[0].$id,
        { status: 'subscribed' }
      );

      log(`Verification successful for channel ${youtubeChannelId}`);
      return res.text(hubChallenge, 200);
    } catch (err) {
      error('Verification error:', err.message);
      return res.text('Verification failed', 500);
    }
  }

  if (req.method === 'POST') {
    try {
      const rawBody = req.body;
      const signature = req.headers['x-hub-signature'];

      const parser = new xml2js.Parser();
      const parsedXml = await parser.parseStringPromise(rawBody);

      const entry = parsedXml?.feed?.entry?.[0];
      if (!entry) {
        log('No entry found in XML');
        return res.text('OK', 200);
      }

      const videoId = entry['yt:videoId']?.[0];
      const videoTitle = entry.title?.[0];
      const channelId = entry['yt:channelId']?.[0];

      if (!videoId || !channelId) {
        log('Missing video or channel ID');
        return res.text('OK', 200);
      }

      const subscriptions = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_YOUTUBE_SUBSCRIPTIONS_COLLECTION_ID,
        [sdk.Query.equal('youtubeChannelId', channelId)]
      );

      if (subscriptions.documents.length === 0) {
        log('No subscription found for channel');
        return res.text('OK', 200);
      }

      const subscription = subscriptions.documents[0];
      const hubSecret = subscription.hubSecret;

      if (signature) {
        const expectedSignature = 'sha1=' + crypto
          .createHmac('sha1', hubSecret)
          .update(rawBody)
          .digest('hex');

        if (signature !== expectedSignature) {
          error('Invalid signature');
          return res.text('Forbidden', 403);
        }
      }

      const automations = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_AUTOMATIONS_COLLECTION_ID,
        [sdk.Query.equal('isActive', true)]
      );

      for (const automation of automations.documents) {
        const connections = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_CONNECTIONS_COLLECTION_ID,
          [sdk.Query.equal('$id', automation.youtubeConnectionId)]
        );

        if (connections.documents.length > 0) {
          const ytConnection = connections.documents[0];
          if (ytConnection.channelId === channelId) {
            try {
              await functions.createExecution(
                'distributeMessage',
                JSON.stringify({
                  userId: automation.userId,
                  messageTemplate: automation.messageTemplate,
                  videoDetails: {
                    videoId,
                    videoTitle,
                    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                  },
                  targetConnectionIds: automation.targetConnectionIds,
                }),
                false
              );

              log(`Triggered distribution for automation ${automation.$id}`);
            } catch (execError) {
              error('Execution error:', execError.message);
            }
          }
        }
      }

      return res.text('OK', 200);
    } catch (err) {
      error('Webhook processing error:', err.message);
      return res.text('OK', 200);
    }
  }

  return res.text('Method not allowed', 405);
};
