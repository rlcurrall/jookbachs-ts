function libraryRepo(deps) {

    if (!deps.config || !deps.JbLibrary) {
        throw new Error("[ LibraryRepo ] Missing Dependency: config and JbLibrary are required")
    }

    const config = deps.config;
    const JbLibrary = deps.JbLibrary;

    let libraries = [];
    config.libraryPaths.forEach(function (libraryPath) {
        libraries.push(new JbLibrary(libraryPath));
    });

    return libraries;
}

module.exports = libraryRepo;