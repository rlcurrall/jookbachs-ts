// get reference for jqLite
//const $ = angular.element;

// AngularJS constants cannot be intercepted by decorators
// making them safer
app.constant('$', angular.element);
app.constant('AUDIO', document.createElement('audio'));
app.constant('URL', {
    streamUrl: 'https://localhost:8443/stream',
    apiUrl: 'https://localhost:8443/api',
    socketUrl: 'https://localhost:8443'
});