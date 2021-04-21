import {readdir, stat} from "fs/promises";

export enum BROWSABLE_TYPE {
    DIRECTORY = 'directory',
    MOVIE = 'movie'
}

export interface IBrowsable {
    filename: string;
    type: BROWSABLE_TYPE
}


export class MovieBrowser {
    private indexing: boolean = false;
    private tree!: { movies: string[] };

    constructor(private rootPath: string) {
        this.buildFolderTree();
    }


    private async buildFolderTree() {
        this.indexing = true;
        console.log("start building tree");
        this.tree = await this.scanDirectory(this.rootPath);
        console.log("Build tree finish");
        console.log(this.tree);
        this.indexing = false;
    }

    private async scanDirectory(path: string): Promise<{ movies: string[] }> {
        const child: { movies: string[] } = {movies: []};
        const files = await readdir(path);
        for (const file of files) {
            if (file.match(/.mp4$/)) {
                child.movies.push(file);
            } else {
                const stats = await stat(`${path}/${file}`);
                if (stats.isDirectory()) {
                    //@ts-ignore
                    child[file] = await this.scanDirectory(`${path}/${file}`);
                }
            }
        }
        return child;
    }

    get(path: string) {
        const paths = path.split('/').filter((sub) => sub !== '');
        let pointer = this.tree;
        for (const sub of paths) {
            //@ts-ignore
            pointer = pointer[sub];
        }

        const response = [];
        for (const movie of pointer.movies) {
            response.push({
                filename: movie,
                type: BROWSABLE_TYPE.MOVIE,
            });
        }

        for (const att in pointer) {
            if (att !== 'movies') {
                response.push({
                    filename: att,
                    type: BROWSABLE_TYPE.DIRECTORY,
                });
            }
        }

        return response;
    }
}
