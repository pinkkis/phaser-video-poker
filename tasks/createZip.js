// require modules
const fs = require('fs');
const archiver = require('archiver');
const version = require('../package.json').version;

// check that build exists
if (!fs.existsSync('./dist/')) {
	throw new Error('production build does not exist. run `npm run build` first.');
}

// create a file to stream archive data to.
if (!fs.existsSync('./build/')) {
	fs.mkdirSync('./build/');
}

const output = fs.createWriteStream(`./build/release-${version}.zip`);
const archive = archiver('zip', {
	zlib: { level: 7 } // Sets the compression level.
});

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function (err) {
	if (err.code === 'ENOENT') {
		// log warning
	} else {
		// throw error
		throw err;
	}
});

// good practice to catch this error explicitly
archive.on('error', function (err) {
	throw err;
});

// pipe archive data to the file
archive.pipe(output);

// append files from a glob pattern
archive.glob('**/*', {cwd: 'dist'});

// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive.finalize();
