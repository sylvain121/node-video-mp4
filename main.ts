import {MovieBrowser} from "./browse";
import {start} from "./express";

const baseFolder = process.env.MOVIE_BASE_FOLDER;
if(!baseFolder) {
    console.error("You should add a Movie base folder");
    console.error(`ex: MOVIE_BASE_FOLDER="./videoFolder"`);
    process.exit(1);
}
const movieBrowser = new MovieBrowser(baseFolder);

start(movieBrowser, baseFolder);
