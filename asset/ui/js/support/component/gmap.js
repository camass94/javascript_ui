var isGoogleMap = document.getElementById('repairCenter') || null;

if (isGoogleMap != null) {
    window.initialize = function() {};
    var script = document.createElement('script');
    var src = "//maps.googleapis.com/maps/api/js";
    src += "?v=3.17&libraries=places&sensor=true&client=gme%2Dlgelectronicsinc1&signature=z1EbnXIiQ0aq1744IJpOz3LTTOc=&callback=initialize&region=KR&language=";
    src += document.documentElement.lang;

    script.type = 'text/javascript';
    script.src = src;
    document.body.appendChild(script);
}
