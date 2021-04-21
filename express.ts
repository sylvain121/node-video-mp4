import express from 'express';
import {createReadStream, statSync} from "fs";
import {MovieBrowser} from './browse'

const app = express();

export function start(movieBrowser: MovieBrowser, baseFolder: string) {

    function toLocalPath(path: string) {
        return path.split('/').slice(2, path.length).join('/');
    }

    app.use(express.static('public'));

    app.get('/browse/*', function (req, res) {

        try {
            const directory = movieBrowser.get(toLocalPath(req.path));
            return res.status(200).json(directory);
        } catch (e) {
            return res.status(404).send("Not found");
        }
    })

    app.get("/video/*", function (req, res) {
        const path = baseFolder + toLocalPath(decodeURI(req.path));
        if (!path.match(/.mp4$/)) {
            return res.status(400).send('Not a video file');
        }
        // Ensure there is a range given for the video
        const range: string | undefined = req.headers.range;
        if (!range) {
            return res.status(400).send("Requires Range header");
        }

        const videoSize = statSync(path).size;

        // Parse Range
        // Example: "bytes=32324-"
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

        // Create headers
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };

        // HTTP Status 206 for Partial Content
        res.writeHead(206, headers);

        // create video read stream for this particular chunk
        const videoStream = createReadStream(path, {start, end});

        // Stream the video chunk to the client
        videoStream.pipe(res);
    });

    app.listen(8000, function () {
        console.log("Listening on port 8000!");
    });

}

