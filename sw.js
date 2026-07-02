@@
-const CACHE_NAME = 'carousel-maker-v1';
+const CACHE_NAME = 'carousel-maker-v2';
@@
-  './style.css',
+  './style.css',
+  './Gilroy-Regular.ttf',
+  './Gilroy-Medium.ttf',
+  './Gilroy-Bold.ttf',
+  './Gilroy-Heavy.ttf',
@@
       caches.open(CACHE_NAME)
         .then(cache => {
-        return cache.addAll(urlsToCache);
+        return cache.addAll(urlsToCache);
         })
   );
 });
*** End Patch
