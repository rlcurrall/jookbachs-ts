function libraryRepo(deps) {
    let fs;
    let config;
    let Track;
    let Library;
    let libraries = [];

    if (!deps.fs || !deps.config || !deps.Track || !deps.Library) {
        throw new Error("[ LibraryRepo ] Missing Dependency: fs, Track, and Library are required")
    }

    fs = deps.fs;
    config = deps.config;
    Track = deps.Track;
    Library = deps.Library;

    config.libraryPaths.forEach(function (libraryPath) {
        libraries.push(new Library(libraryPath));
    });

    return {
        libraries: libraries
    }
}

module.exports = libraryRepo;