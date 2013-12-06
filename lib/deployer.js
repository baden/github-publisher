var defaultOptions = {
    port: 8985,
    deploypath: ".."
};

var http = require("http");
var fs = require("fs");
var querystring = require("querystring");
var exec  = require('child_process').exec;

var options = {};
for(var key in defaultOptions) {
    options[key] = defaultOptions[key];
}

var deploy = function(options, data) {

    fs.mkdir(options.deploypath + '/refs', function(err){});
    var localPath = ".";

    var cmd = exec('ls', {
            cwd: localPath
        }, function(error, stdout, stderr) {
            if (error) {
                console.log(">  ERROR (error): " + error);
            }
            if (stderr && error) {
                console.log(">  ERROR (error): " + error);
            }
            console.log("--------------------------");
            console.log("> DONE!");
        });
    console.log('do');
    cmd.stdout.on('data', function(data) {
        console.log(data.toString());
    });
    cmd.stdout.on('close', function(data) {
        console.log(data.toString());
    });
    cmd.stdout.on('exit', function(data) {
        console.log(data.toString());
    });
    cmd.stdout.on('disconnect', function(data) {
        console.log(data.toString());
    });
    cmd.stdout.on('message', function(data) {
        console.log("MESSAGE: " + data.toString());
    });
    cmd.stderr.on('data', function(data) {
        console.log(data.toString());
    });
};

var hook = function(payload) {
    //console.log('POST payload = ', payload);

    var data = {
        id: payload.after,                          // Идентификатор коммита
        name: payload.repository.name,              // Имя репозитория
        owner: payload.repository.owner.name,       // Имя владельца репозитория
        ref: payload.ref.match(/^refs\/heads\/(.*)/i),
            // Пример1: refs/heads/dev  - при обычном git push origin dev
            // Пример2: refs/tags/v1.0  - при коммите метки:
            //      git tag -a v1.0 -m "Version 1.0"
            //      git push origin v1.0
            // Пока поддерживаем только heads.
        created: payload.created || false,          // true если создан новый branch или tag
        commits: payload.commits                    // Массив commit-ов
    };

    console.log("==========================");
    console.log("    Commit: ", data.id);
    console.log("Repository: ", data.name);
    console.log("     Owner: ", data.owner);

    if(!data.ref) {
        console.log('Ignore push ref:', payload.ref);
        return;
    }

    data.branch = data.ref[1];
    console.log("Branch: ", data.branch);

    console.log("Commits: ", data.commits.length);

    data.commits.forEach(function(c){
        console.log("   ", c.message);
        console.log("      Author: ", c.author.name);
    });

    deploy(options, data);

    // Поля объекта commit:
    // message: 'One commit',
    // timestamp: '2013-12-06T13:33:28-08:00',
    // author
    // committer  (?)

};

var server = http.createServer(function(req, res) {

    var data = "";

    req.on("data", function(chunk) {
        data += chunk;
    });

    req.on("end", function() {
        // var paydata = {};
        if (req.method == "POST") {
            var payload = JSON.parse(querystring.parse(data).payload);
            hook(payload);
        }

        res.statusCode = 200;
        res.write("OK");
        res.end();
    });


});

server.on('error', function(err) {
    console.log("error", err);
});

console.log('server listen ', options.port);

server.listen(options.port, function(err) {
});
