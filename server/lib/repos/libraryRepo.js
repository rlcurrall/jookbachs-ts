function libraryRepo (deps) {
    let fs;
    let config;
    let track;
    let library;
    let libraries = [];

	if (!deps.fs || !deps.config || !deps.track || !deps.library) {
		throw new Error("[ LibraryRepo ] Dependency Error: fs, track, and library are required")
	}

    fs = deps.fs;
    config = deps.config;
    track = deps.track;
    library = deps.library;

    config.libraryPaths.forEach(function (libraryPath) {
        libraries.push(new library(libraryPath));
    });

	return {
        libraries: libraries
	}
}

module.exports = libraryRepo;
