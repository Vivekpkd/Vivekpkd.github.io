// Loads header and footer partials into pages
(function(){
    function loadPartial(url, containerSelector){
        fetch(url).then(function(resp){
            if(!resp.ok) return '';
            return resp.text();
        }).then(function(html){
            if(!html) return;
            var container = document.querySelector(containerSelector);
            if(container) container.innerHTML = html;
            // Execute any inline scripts inside the partial
            var scripts = container ? container.querySelectorAll('script') : [];
            scripts.forEach(function(s){
                var ns = document.createElement('script');
                if(s.src) ns.src = s.src;
                if(s.type) ns.type = s.type;
                ns.text = s.innerText;
                document.head.appendChild(ns);
            });
        }).catch(function(err){
            console.warn('Failed to load partial', url, err);
        });
    }

    // Run on DOMContentLoaded so placeholders exist
    document.addEventListener('DOMContentLoaded', function(){
        loadPartial('/partials/header.html', '#site-header');
        loadPartial('/partials/footer.html', '#site-footer');
    });
})();
