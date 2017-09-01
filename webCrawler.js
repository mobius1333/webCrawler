var argv = require('minimist')(process.argv.slice(2));
var Crawler = require('crawler');
var fs = require('fs-extra');
var async = require('async');
var directory = argv.d;
var urls = argv._;
var nextUrls = [];
var foundSites = [];

//check for initial  url
if (urls.length == 0) {
    console.log("At least one URL is Requred!");
}
//check if dir exsists
if (fs.existsSync('./' + directory)) {
    console.log('directory already created');
} else {
    fs.mkdir(directory);
}

//crawler for links 
var cLink = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (res) {
            var $ = res.$;
            var page = res.body;
            fs.writeFile(res.options.fileName, page, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
        //find all links on page 
        $("a").each(function (index, a) {
            nextUrls.push(a.attribs.href);
        });
        //filter html files?
        nextUrls.filter(function (element) {
            if (element.indexOf('.html') >= 0 && element.indexOf('http') != 0) {
                foundSites.push(element);
            };
        });
        queueHtml(foundSites);
        done();
    }
});
//crawler for HTML
var cHtml = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (res) {
            var page = res.body;
            fs.writeFile(res.options.fileName, page, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
        done();
    }
});

queueOrigionals(urls);
 function queueOrigionals(arr) {
    for (var i = 0; i < arr.length; i++) {
        //escape
        var newUrl = arr[i].slice(arr[i].indexOf('//') + 2);
        newUrl = newUrl.replace(newUrl.substring(newUrl.length - 1), '');
        fileName =  "./" + directory + "/" + newUrl + ".html";
        cLink.queue({
            uri: arr[i],
            fileName: fileName
        });
    }
};

function queueHtml(arr) {
    if (arr.length == 0) {
        console.log('No HTML Found');
    } else {
        async.eachLimit(arr, 1, function (site, done) {
            console.log(site);
            cHtml.queue({
                html: site,
                fileName: "./" + directory + "/" + site
            });
            done();
        }, function (err) {
            console.log(err);
        });
    }
};

