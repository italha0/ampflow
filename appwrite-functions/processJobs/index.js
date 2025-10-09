const sdk = require('node-appwrite');
const axios = require('axios');

module.exports = async ({ req, res, log, error }) => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

  try {
    // Get pending jobs
    const jobs = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_JOBS_COLLECTION_ID,
      [
        sdk.Query.equal('status', 'pending'),
        sdk.Query.orderAsc('createdAt'),
        sdk.Query.limit(10)
      ]
    );

    log(`Processing ${jobs.total} pending jobs`);
    const results = [];

    for (const job of jobs.documents) {
      try {
        // Update job status to processing
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_JOBS_COLLECTION_ID,
          job.$id,
          { status: 'processing' }
        );

        const jobResults = [];

        // Process each target platform
        for (const platform of job.targetPlatforms) {
          try {
            const connection = job.connections.find((conn) => conn.platform === platform);
            if (!connection) {
              jobResults.push({
                platform,
                success: false,
                error: 'No connection found'
              });
              continue;
            }

            // Format message with template
            const message = formatMessage(job.messageTemplate, {
              title: job.title,
              videoId: job.videoId,
              channelId: job.channelId,
              published: job.published
            });

            // Distribute to platform
            const result = await distributeToPlatform(platform, {
              message,
              videoId: job.videoId,
              title: job.title,
              connection
            });

            jobResults.push({
              platform,
              success: result.success,
              error: result.error,
              response: result.response
            });

          } catch (platformError) {
            error(`Failed to distribute to ${platform}:`, platformError.message);
            jobResults.push({
              platform,
              success: false,
              error: platformError.message
            });
          }
        }

        // Update job status and results
        const successCount = jobResults.filter(r => r.success).length;
        const finalStatus = successCount === job.targetPlatforms.length ? 'completed' : 
                           successCount > 0 ? 'partial' : 'failed';

        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_JOBS_COLLECTION_ID,
          job.$id,
          {
            status: finalStatus,
            results: jobResults,
            completedAt: new Date().toISOString()
          }
        );

        results.push({
          jobId: job.$id,
          status: finalStatus,
          results: jobResults
        });

      } catch (jobError) {
        error(`Failed to process job ${job.$id}:`, jobError.message);
        
        // Update job to failed
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_JOBS_COLLECTION_ID,
          job.$id,
          {
            status: 'failed',
            error: jobError.message,
            completedAt: new Date().toISOString()
          }
        );

        results.push({
          jobId: job.$id,
          status: 'failed',
          error: jobError.message
        });
      }
    }

    log(`Processing complete: ${results.length} jobs processed`);
    return res.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (err) {
    error('Job processing failed:', err.message);
    return res.json({ success: false, message: err.message }, 500);
  }
};

function formatMessage(template, data) {
  return template
    .replace(/\{\{title\}\}/g, data.title || '')
    .replace(/\{\{videoId\}\}/g, data.videoId || '')
    .replace(/\{\{channelId\}\}/g, data.channelId || '')
    .replace(/\{\{published\}\}/g, data.published ? new Date(data.published).toLocaleDateString() : '')
    .replace(/\{\{videoUrl\}\}/g, data.videoId ? `https://youtube.com/watch?v=${data.videoId}` : '');
}

async function distributeToPlatform(platform, data) {
  switch (platform) {
    case 'discord':
      return distributeToDiscord(data);
    case 'telegram':
      return distributeToTelegram(data);
    case 'whop':
      return distributeToWhop(data);
    default:
      return { success: false, error: 'Unsupported platform' };
  }
}

async function distributeToDiscord(data) {
  try {
    const { message, videoId, title, connection } = data;
    
    // Use Discord webhook or bot API
    let discordUrl;
    if (connection.accessToken && connection.channelId) {
      // Bot API
      discordUrl = `https://discord.com/api/v10/channels/${connection.channelId}/messages`;
    } else if (connection.webhookUrl) {
      // Webhook URL
      discordUrl = connection.webhookUrl;
    } else {
      return { success: false, error: 'No valid Discord connection method' };
    }

    const embed = {
      title: title,
      description: message,
      url: `https://youtube.com/watch?v=${videoId}`,
      color: 0xff0000,
      timestamp: new Date().toISOString(),
      author: {
        name: 'New YouTube Video',
        icon_url: 'https://www.youtube.com/favicon.ico'
      },
      thumbnail: {
        url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
    };

    const payload = connection.webhookUrl ? 
      { embeds: [embed], content: message } :
      { embed: embed, content: message };

    const response = await axios.post(discordUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(connection.accessToken && !connection.webhookUrl ? 
          { 'Authorization': `Bot ${connection.accessToken}` } : {})
      }
    });

    return { success: true, response: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

async function distributeToTelegram(data) {
  try {
    const { message, videoId, connection } = data;
    
    if (!connection.botToken || !connection.channelId) {
      return { success: false, error: 'Missing Telegram credentials' };
    }

    // Parse HTML for Telegram
    const htmlMessage = message
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    const response = await axios.post(
      `https://api.telegram.org/bot${connection.botToken}/sendMessage`,
      {
        chat_id: connection.channelId,
        text: htmlMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      }
    );

    return { success: true, response: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.description || error.message 
    };
  }
}

async function distributeToWhop(data) {
  try {
    const { message, videoId, connection } = data;
    
    if (!connection.accessToken || !connection.channelId) {
      return { success: false, error: 'Missing Whop credentials' };
    }

    const response = await axios.post(
      `https://api.whop.com/v1/communities/${connection.channelId}/posts`,
      { 
        content: message,
        title: `New Video: ${data.title}`
      },
      {
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, response: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}