//https://blog.betapage.co/how-to-add-add-to-homescreen-popup-in-web-app-99d5237fabff
https://dev.to/iamsahilsonawane/a2hs-in-flutter-web-3cln

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
