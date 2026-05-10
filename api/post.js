// api/post.js (Deploy this to Vercel)
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { videoUrl, caption, accessToken, igUserId } = req.body;

    try {
        // 1. CREATE FACEBOOK CONTAINER
        const createReq = await fetch(`https://graph.facebook.com/v25.0/${igUserId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                video_url: videoUrl, 
                media_type: 'REELS', 
                caption: caption, 
                access_token: accessToken, 
                share_to_feed: 'true' 
            })
        });
        
        const createData = await createReq.json();
        if (!createData.id) throw new Error("FB Error: " + JSON.stringify(createData));
        const containerId = createData.id;

        // 2. POLL FACEBOOK (Max 4 times to avoid Vercel 10s timeout)
        let status = 'INITIALIZING';
        for (let i = 0; i < 4; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            const statusReq = await fetch(`https://graph.facebook.com/v25.0/${containerId}?fields=status_code&access_token=${accessToken}`);
            const statusData = await statusReq.json();
            status = statusData.status_code;
            
            if (status === 'FINISHED' || status === 'ERROR') break;
        }

        if (status !== 'FINISHED') {
            return res.status(200).json({ status: "Pending", id: containerId, message: "Processing on FB..." });
        }

        // 3. PUBLISH
        const pubReq = await fetch(`https://graph.facebook.com/v25.0/${igUserId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creation_id: containerId, access_token: accessToken })
        });

        const pubData = await pubReq.json();
        if (!pubData.id) throw new Error("Publish Error: " + JSON.stringify(pubData));

        return res.status(200).json({ status: "Success", id: pubData.id });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
