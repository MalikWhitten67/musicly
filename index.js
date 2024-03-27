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
    main: 'http://localhost:3000'
}
let imageCache = {};
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  let registeredArtists = [
    'lil baby',
    'babyfxce e',
    'skillababy',
    'bossman dlow',
    'french montana',
    'lil wayne',
    'lil durk',
    'lil tjay',
    'lil uzi vert',
    'lil tecca',
    'lil nas x',
    'lil mosey',
    'lil skies',
    'lil yachty',
    'luh tyler',
    'lil peep',
    'lil baby',
    'lyricle lemonade',
    'playboy carti',
    'drake',
    'don toliver',
    'sheck wes',
    'travis scott',
    'jid',
    'ski mask slump god',
    'juice wrld',
    'logic',
      'tupac',
      'latto',
    'ynw melly',
    'ynw bslime',
    'youngboy never broke again',
    'nba youngboy',
    'young thug',
    'quavo',
    'offset',
    'takeoff',
    'lil pump',
    'lil keed',
    'cardi b',
    'ken carson',
    'destroy lonely',
    'lil rt',
    'lil mabu',
    'trippie redd',
    'ddg',
    'lucki',
    'so faygo',
    'lil xan',
    'lil tracy',
    'gunna',
    'future',
    'chris brown',
    'megan thee stallion',
]
 
app.get('/playlist/:playlist', async (req, res) => {
    const { playlist } = req.params; 
    let { filter, page } = req.query;

    async function handleVideos(videos){
        const videoData = await Promise.all(videos.map(async (video) => { 
            return {
                url: `${urls.main}/stream?url=${`https://www.youtube.com/watch?v=${video.videoId}`}`,
                title: video.title,
                id: video.videoId, 
                thumbnail: `${urls.main}/serveImage?url=${video.thumbnail.replace('hqdefault', 'hq720')}`,
                description: video.description,
                duration: video.duration.seconds,  
                age: video.ago,
                artist: video.author.name,
                artistUrl: video.author.url
            };
        }));
        return videoData;
    }

    let result;
    switch(playlist){
        case '1': 
            // trending songs
            if(cachedResults['trending']){
                result = cachedResults['trending'];
            } else {
                const list = await yts({ listId: 'PL3-sRm8xAzY9gpXTMGVHJWy_FMD67NBed' });
                cachedResults['trending'] = await handleVideos(list.videos);
                result = await handleVideos(list.videos);
            } 
            break;
        case '2': 
            // rap
            if(cachedResults['rap']){
                result = cachedResults['rap'];
            } else {
                const rap = await yts({ listId: 'PL3-sRm8xAzY-556lOpSGH6wVzyofoGpzU'});
                cachedResults['rap'] = await handleVideos(rap.videos);
                result = await handleVideos(rap.videos);
            }
            break;
            case '3':
                // blues
                if(cachedResults['blues']){
                    result = cachedResults['blues'];
                } else {
                    const rhythm = await yts({ listId: 'PLDIoUOhQQPlVFjmZnM41bOzoowjfTS4wU'}) 
                    cachedResults['blues'] = await handleVideos(rhythm.videos);
                    result = await handleVideos(rhythm.videos);
                }
                break;
            case '4':
                // pop
                if(cachedResults['pop']){
                    result = cachedResults['pop'];
                } else {
                    const pop = await yts({ listId: 'PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj'})
                    cachedResults['pop'] = await handleVideos(pop.videos);
                    result =  await handleVideos(pop.videos);
                }
                break;
            case '5':
                // hiphop90s
                if(cachedResults['hiphop90s']){
                    result = cachedResults['hiphop90s'];
                } else {
                    const hiphop90s = await yts({ listId: 'PLxA687tYuMWgEVasBziZoZ1Bk7JLnu-Rf'})
                    cachedResults['hiphop90s'] = await handleVideos(hiphop90s.videos);
                    result = await handleVideos(hiphop90s.videos);
                }
                break;
        default:
            return res.status(404).send('Playlist not found');
    } 

    if(filter && page){
        let full_length = result.length;
        page == 1 ? page = 1 : page = parseInt(page);
        let start = (page - 1) * filter;
        let end = page * filter;
        result = result.slice(start, end);
    }
 
    res.json(result);
});

// Endpoint to serve image
const redirects = {}
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

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
        res.setHeader('Last-Modified', new Date().toUTCString());
        if (imageCache[url]) {
            res.setHeader('Content-Type', contentType);
            res.send(imageCache[url]);
            return;
        }

        const imageBuffer = await imageResponse.arrayBuffer(); 
        imageCache[url] = Buffer.from(imageBuffer);
        res.send(Buffer.from(imageBuffer));
    } catch (error) {  
        // only redirect once

        if(!redirects[url]){
            redirects[url] = true;
        } else {
            return res.status(400).send('Invalid URL');
        }

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
    // exclude non-registered artists
        let artist = video.author.name.toLowerCase();
        let isRegistered  = registeredArtists.includes(artist);
        // if name registered then dont return any other artist
        if(!isRegistered && registeredArtists.includes(query)){
            console.log('not registered', artist, query.toLowerCase());
            return;
        }
        let data = {
            url:  `${urls.main}/stream?url=${video.url}`,
            title: video.title,
            id: video.videoId, 
            thumbnail: `${urls.main}/serveImage?url=${video.image}`,
            description: video.description,
            duration: video.duration.seconds,
            views: video.views,
            age: video.ago,
            artist: video.author.name,
            artistUrl: video.author.url
        } 
        return data;
    })
    // remove nulls
    results.videos = results.videos.filter((video) => video !== undefined);
    cachedResults[query.toLowerCase()] = results.videos;
    res.json(results.videos);
})
app.listen(3000, () => {
    console.log('Server is running on port 3000');
})   
