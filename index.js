import ytdl from 'ytdl-core';
import express from 'express'; 
import ffmpeg from 'ffmpeg';
import cors from 'cors';
const cachedResults = {};
import path from 'path';
import fs from 'fs';
import yts from 'yt-search' 
const app = express();

const urls = {
    main: 'https://musiclyapp.vercel.app'
}
let imageCache = {};
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  
 app.get('/trending/:playlist', async (req, res) => {
    const { playlist } = req.params; 
    switch(playlist){
        case 'general': 
            const list = await yts( { listId: 'PL3-sRm8xAzY9gpXTMGVHJWy_FMD67NBed' } )
            list.videos = list.videos.map((video) => { 
                let data = {
                    url:  `${urls.main}/stream?url=${`https://www.youtube.com/watch?v=${video.videoId}`} `,
                    title: video.title,
                    id: video.videoId, 
                    thumbnail: `${urls.main}/serveImage?url=${video.thumbnail}`,
                    description: video.description,
                    duration: video.timestamp,
                    views: video.views,
                    age: video.ago,
                    artist: video.author.name,
                    artistUrl: video.author.url
                }  
                return data;
            });
            res.json(list.videos);
            break;
        case 'rap':
            const rap = await yts({ listId: 'PL3-sRm8xAzY-556lOpSGH6wVzyofoGpzU'}) 
            res.json(rap.videos);
            break;
    }
})
// Endpoint to serve image
app.get('/serveImage', async (req, res) => {
    const { url } = req.query;
    res.setHeader('Access-Control-Allow-Origin', '*'); // Change * to specific origins if needed
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const imageResponse = await fetch(url);
        if (!imageResponse.ok) {
            throw new Error('Failed to fetch image');
        }

        const contentType = imageResponse.headers.get('content-type');
        if (!contentType.startsWith('image/')) {
            throw new Error('Invalid content type, must be an image');
        }

        if (imageCache[url]) {
            res.setHeader('Content-Type', contentType);
            res.send(imageCache[url]);
            return;
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
        res.setHeader('Last-Modified', new Date().toUTCString());
        imageCache[url] = Buffer.from(imageBuffer);
        res.send(Buffer.from(imageBuffer));
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).send('Error serving image');
    }
});
app.get('/stream', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*') 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    try {
        const videoUrl = req.query.url;
        const videoInfo = await ytdl.getInfo(videoUrl);
        // only audio
        const format = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
        const audio =   ytdl.filterFormats(videoInfo.formats, 'videoandaudio').find((format) => format.container === 'mp4');
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${videoInfo.videoDetails.title}.mp3"`); 
        res.setHeader('Accept-Ranges', 'bytes');
        res.redirect(audio.url); 
        } catch (error) {  
           res.redirect(audio.url)
        }

   
});

app.use(express.static('./')); 
app.get('/', (req,res) => {
    res.json({timestamp:Date.now()})
})
 
app.get('/audiofiles/:filename', (req, res) => {
    const { filename } = req.params;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.sendFile(path.join(process.cwd(), 'audiofiles', filename));
})
 
app.get('/', (req, res) => {
    res.json({ message: 'Hello!'});
})

app.get('/metadata', async (req, res) => {
    let { url } = req.query;
    if (!url) {
        return res.status(400).send('URL is required');
    }
     const page = await context.newPage();
     page.goto(url);
     await page.waitForEvent('load');
     const title = await page.title();
     const description = await page.$eval('meta[name="description"]', el => el.content);
     const image = await page.$eval('meta[property="og:image"]', el => el.content);
     const keywords = await page.$eval('meta[name="keywords"]', el => el.content);
     const ogTitle = await page.$eval('meta[property="og:title"]', el => el.content);
     await page.close();
     res.json({ title, description  , image, keywords , ogTitle });
})

 
app.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).send('Query is required');
    }
    console.log(`Received search query: ${query}    `)
    if (Object.keys(cachedResults).includes(query.toLowerCase())) {
        let matching = Object.keys(cachedResults).filter((key) => key.includes(query.toLowerCase()));
        let results = matching.map((key) => cachedResults[key]);
        return res.json([].concat(...results));
    }
    const results = await yts(query);  
    results.videos = results.videos.map((video) => { 
        // remove video if too long
        if(video.timestamp.includes('hour') || video.timestamp.includes('day') || video.timestamp.includes('week') || video.timestamp.includes('month') || video.timestamp.includes('year')){
            return;
        }
        video.title = video.title.replace(/\[.*\]/, '').replace(/\(.*\)/, '');
        // split ft. or ft or feat or featuring
        if(video.title.includes('ft.')){
            video.title = video.title.split('ft.')[0];
        }
        // splice long titles
        if(video.title.length > 50){
            video.title = video.title.slice(0, 50);
        }
        let data = {
            url:  `${urls.main}/stream?url=${video.url}`,
            title: video.title,
            id: video.videoId, 
            thumbnail: `${urls.main}/serveImage?url=${video.image}`,
            description: video.description,
            duration: video.timestamp,
            views: video.views,
            age: video.ago,
            artist: video.author.name,
            artistUrl: video.author.url
        } 
        return data;
    })
    cachedResults[query.toLowerCase()] = results.videos;
    res.json(results.videos);
})
app.listen(3000, () => {
    console.log('Server is running on port 3000');
})   
