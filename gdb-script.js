var fs = require('fs');
var async = require('async');

const argv = (function parseProcessArgument() {
  var sourceFileName = process.argv[2];
  var binaryFileName = process.argv[3];
  var designFileName = process.argv[4];
  var inputFileName = process.argv[5];

  return {
    'sourceFileName' : sourceFileName,
    'binaryFileName' : binaryFileName,
    'designFileName' : designFileName,
    'inputFileName' : inputFileName
  };
}) ();


gdbStart(function (result) {
  console.log(JSON.stringify(result));
});


function gdbStart(done) {
  const spawn = require('child_process').spawn;
  const gdb = spawn('gdb', [argv.binaryFileName]);

  var buf = new String();

  var dataListener = function (data) {
    buf += data;
    if (getCompleteStreamData(buf)) {
      gdb.stdout.removeListener('data', dataListener);
      gdbConfiguration(gdb, done);
    }
  };

  gdb.stdout.on('data', dataListener);
}


function gdbConfiguration(gdb, done) {
  var lineNumbers = new String(fs.readFileSync(argv.sourceFileName))
  .split('\n').length;
  var design = JSON.parse(new String(fs.readFileSync(argv.designFileName)));
  var regexpStr = `Breakpoint ${lineNumbers} at (.|\\n)*\\(gdb\\) $`;

  var buf = new String();

  var dataListener = function (data) {
    buf += data;
    if (buf.match(new RegExp(regexpStr, 'g'))) {
      gdb.stdout.removeListener('data', dataListener);
      gdbProcessing(gdb, design, done);
    }
  };

  gdb.stdout.on('data', dataListener);
  gdb.stdin.write('set listsize 1\n');
  // do not delete. (make sure breakpoint number 1 is main)
  gdb.stdin.write('break main\n');

  for (var bp = 1; bp < lineNumbers; bp++) {
    gdb.stdin.write(`break ${bp}\n`);
  }
}


function gdbProcessing(gdb, design, done) {
  var buf = new String();

  var result = [];
  var queue = {};

  var mode = 0;

  var dataListener = function (data) {
    buf += data;
    var output = getCompleteStreamData(buf);
    if (output) {
      buf = '';

      if (mode == 0) {
        mode = 1;
        if (output.indexOf('exited normally') > -1){
          gdb.stdout.removeListener('data', dataListener);
          return gdb.stdin.write('Quit\n');
        }
        return gdb.stdin.write('info line\n');
      }

      if (mode == 1) {
        mode = 0;
        if (output.indexOf('out of range') > -1) {
          return gdb.stdin.write('next\n');
        }

        const line = Number(output.match(/[0-9]+/g)[0]);
        const funcName = output.split('<')[1].split('(')[0];

        var apidata = {
          line: line
        };

        async.series([
          function (callback) {
            if (!queue[funcName]) {
              return callback();
            }
            gdb.stdout.removeListener('data', dataListener);
            setApisValue(gdb, queue[funcName], function (draws) {
              apidata.draws = draws;
              gdb.stdout.on('data', dataListener);
              callback();
            });
          },
          function (callback) {
            result.push(apidata);
            queue[funcName] = design.draws[line];
            callback();
          }
        ], function () {
          gdb.stdin.write('next\n');
        });
      }
    }
  };

  gdb.stderr.on('data', function (data) {
    if (data.toString().indexOf('libc-start.c') > -1) {
      gdb.stdout.removeListener('data', dataListener);
      gdb.stdin.write('Quit\n');
    }
  });

  gdb.on('close', function (code) {
    if (code != 0) {
      process.exit(1);
    }
    done(result);
  });


  gdb.stdout.on('data', dataListener);

  if (argv.inputFileName) {
    gdb.stdin.write(`run < ${argv.inputFileName}\n`);
  }
  else {
    gdb.stdin.write('run\n');
  }
}


/* useful Functions */
function getCompleteStreamData(str) {
  if (str.match(/\(gdb\) $/g)) {
    return str.replace(/\(gdb\) $/g, '');
  }
  return false;
}


function setApisValue(gdb, apis, callback) {
  var retVal = JSON.parse(JSON.stringify(apis));
  var queue = [];
  for (var key in retVal) {
    retVal[key].forEach(function (api) {
      queue.push(api);
    });
  }

  if (queue.length == 0) {
    return callback(retVal);
  }

  var cb = function () {
    if (queue.length > 0) {
      setValues(gdb, queue.shift(), cb);
    }
    else {
      callback(retVal);
    }
  };

  setValues(gdb, queue.shift(), cb);
}


function setValues(gdb, api, callback) {
  api.values = [];
  if (api.params.length == 0) {
    return callback();
  }

  var buf = new String();
  var idx = 0;

  var dataListener = function (data) {
    buf += data;
    var output = getCompleteStreamData(buf);
    if (output) {
      buf = '';
      api.values.push(Number(output.split('=')[1].trim()));

      if (idx < api.params.length) {
        gdb.stdin.write(`print ${api.params[idx++]}\n`);
      }
      else {
        gdb.stdout.removeListener('data', dataListener);
        callback();
      }
    }
  };

  gdb.stdout.on('data', dataListener);
  gdb.stdin.write(`print ${api.params[idx++]}\n`);
}
